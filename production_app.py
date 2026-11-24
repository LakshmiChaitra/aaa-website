"""Render app with durable views and confirmed single-form registration."""
import hashlib
from html.parser import HTMLParser
import json
import os
from pathlib import Path
import re
from urllib.parse import urlencode, urlsplit
from urllib.request import Request, urlopen

from flask import Flask, abort, jsonify, redirect, request, send_from_directory
from werkzeug.middleware.proxy_fix import ProxyFix
from event_document import EVENTS_DOCUMENT_URL, parse_events

ROOT = Path(__file__).resolve().parent
SITE = ROOT / 'saved' / '1'
SLIDE_PATH = r'/presentation/(?:u/[0-9]+/)?d/15iFfwv9UDOEaO597w6DZqMoHMH2q-E2krIiuTGW1l7c/viewpage'
app = Flask(__name__, static_folder=None)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024
app.config['SERVE_LOCAL_PREVIEW'] = False
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1)


def trusted_origin(origin):
    if not origin:
        return False
    parts = urlsplit(origin)
    if parts.scheme not in {'https', 'http'} or parts.path or parts.query or parts.fragment or parts.username:
        return False
    if parts.netloc == request.host and parts.scheme == request.scheme:
        return True
    # Exact public site origins only; never reflect arbitrary origins or credentials.
    allowed = {item.strip().rstrip('/') for item in os.environ.get('PUBLIC_SITE_ORIGINS', '').split(',') if item.strip()}
    return parts.scheme == 'https' and origin in allowed


@app.after_request
def public_site_access(response):
    origin = request.headers.get('Origin')
    if (request.path.startswith('/api/') or request.path == '/healthz') and trusted_origin(origin):
        response.headers['Access-Control-Allow-Origin'] = origin
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
        response.headers.add('Vary', 'Origin')
    return response


def redis_command(command):
    endpoint = os.environ.get('UPSTASH_REDIS_REST_URL', '').rstrip('/')
    token = os.environ.get('UPSTASH_REDIS_REST_TOKEN', '')
    if not endpoint or not token:
        raise ValueError('Counter store is not configured')
    parts = urlsplit(endpoint)
    if parts.scheme != 'https' or not parts.hostname or not parts.hostname.endswith('.upstash.io'):
        raise ValueError('Invalid counter store')
    operation = Request(endpoint, data=json.dumps(command).encode(), method='POST', headers={
        'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'
    })
    with urlopen(operation, timeout=6) as response:
        data = json.load(response)
    if 'error' in data:
        raise ValueError('Counter store unavailable')
    return data['result']


def counter(increment):
    result = redis_command(['INCR' if increment else 'GET', 'anusha:website:views'])
    total = int(result) if result is not None else 0
    if total < 0 or total > 9007199254740991:
        raise ValueError('Invalid view count')
    return total


FORM_ID = '1FAIpQLSdnGrdu2G7vTg28E5qX1JStqjQ8CDTnI5-vMrr5PjjruCpgKg'
REGISTRATION_COURSES = {
    'Carnatic music', 'Kuchipudi dance', 'Shloka classes', 'Western dance',
    'Art classes', 'Yoga', 'Zumba fitness', 'Keyboard classes',
    'Martial arts & self-defence', 'Handwriting classes', 'Public speaking skills',
    'Sankeertanas workshop', 'Sunday music workshop', 'Sunday dance workshop',
    'Sunday art workshop',
}


def registration_data(raw):
    if not isinstance(raw, dict):
        raise ValueError('Invalid registration')
    limits = {'studentName': 100, 'age': 3, 'phone': 20, 'address': 1000,
              'course': 100, 'learningMode': 10, 'guardianName': 100,
              'preferredBatch': 150, 'message': 1000, 'requestId': 36}
    result = {}
    for key, limit in limits.items():
        value = raw.get(key, '')
        if not isinstance(value, str) or len(value) > limit or '\x00' in value:
            raise ValueError('Invalid registration')
        result[key] = value.strip()
    if not all(result[k] for k in ('studentName', 'address', 'course')):
        raise ValueError('Complete all required fields')
    if not result['age'].isdigit() or not 1 <= int(result['age']) <= 120:
        raise ValueError('Enter a valid age')
    if not re.fullmatch(r'[+0-9 ()-]{10,20}', result['phone']) or not 10 <= len(re.sub(r'\D', '', result['phone'])) <= 15:
        raise ValueError('Enter a valid contact number')
    if result['course'] not in REGISTRATION_COURSES:
        raise ValueError('Choose a class or workshop')
    modes = {'Online', 'Offline'} if result['course'] in {'Carnatic music', 'Yoga'} else {'Offline'}
    if result['learningMode'] not in modes:
        raise ValueError('Choose an available learning mode')
    if not re.fullmatch(r'[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}', result['requestId']):
        raise ValueError('Invalid submission reference')
    return result


def submit_google_registration(data, reference):
    fields = {
        'entry.351942244': data['studentName'], 'entry.1054744038': data['age'],
        'entry.215957962': data['phone'], 'entry.1676087060': data['address'],
        'entry.68124289': data['course'], 'entry.984631157': data['learningMode'],
        'entry.2022916799': '\n'.join(filter(None, [
            f'Registration reference: {reference}', f'Class / workshop: {data["course"]}',
            f'Learning mode: {data["learningMode"]}',
            data['guardianName'] and f'Parent / guardian: {data["guardianName"]}',
            data['preferredBatch'] and f'Preferred batch: {data["preferredBatch"]}',
            data['message'] and f'Notes: {data["message"]}',
        ])),
        'pageHistory': '0', 'submit': 'Submit',
    }
    operation = Request(f'https://docs.google.com/forms/d/e/{FORM_ID}/formResponse?hl=en',
                        data=urlencode(fields).encode(), method='POST',
                        headers={'Content-Type': 'application/x-www-form-urlencoded'})
    with urlopen(operation, timeout=20) as response:
        body = response.read(2 * 1024 * 1024).decode('utf-8')
    confirmation = GoogleConfirmation()
    confirmation.feed(body)
    if not re.search(r'Your response has been recorded\.', ''.join(confirmation.text)):
        raise ValueError('Google did not confirm receipt')


class GoogleConfirmation(HTMLParser):
    """Only the confirmation message counts, never reflected form/script text."""
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.depth = 0
        self.text = []

    def handle_starttag(self, tag, attrs):
        classes = dict(attrs).get('class', '').split()
        if self.depth:
            if tag not in {'br', 'hr', 'img', 'input', 'meta', 'link'}:
                self.depth += 1
        elif 'vHW8K' in classes or 'freebirdFormviewerViewResponseConfirmationMessage' in classes:
            self.depth = 1

    def handle_endtag(self, tag):
        if self.depth:
            self.depth -= 1

    def handle_data(self, value):
        if self.depth:
            self.text.append(value)


@app.post('/api/registrations')
def registrations():
    headers = {'Cache-Control': 'no-store'}
    origin = request.headers.get('Origin')
    if not trusted_origin(origin):
        return jsonify(error='Submit from the academy website'), 403, headers
    if not request.is_json:
        return jsonify(error='Invalid registration'), 415, headers
    try:
        data = registration_data(request.get_json(silent=True))
    except ValueError as error:
        return jsonify(error=str(error)), 400, headers
    reference = 'AAA-' + data.pop('requestId')
    key = 'anusha:registration:' + reference
    fingerprint = hashlib.sha256(json.dumps(data, sort_keys=True).encode()).hexdigest()
    state = {'fingerprint': fingerprint, 'status': 'pending'}
    try:
        # Reserve before contacting Google. Retrying an uncertain submission must
        # never send a second response. No learner details are stored in Redis.
        existing = redis_command(['GET', key])
        if existing:
            previous = json.loads(existing)
            if previous == {'fingerprint': fingerprint, 'status': 'submitted'}:
                return jsonify(ok=True, registrationId=reference), 200, headers
            return jsonify(error='Submission already received or awaiting confirmation. Please contact the academy before submitting again.'), 409, headers
        reserved = redis_command(['SET', key, json.dumps(state), 'NX', 'EX', 86400])
        if reserved != 'OK':
            return jsonify(error='Submission is already in progress'), 409, headers
    except Exception:
        return jsonify(error='Registration temporarily unavailable. Please try again shortly.'), 503, headers
    try:
        submit_google_registration(data, reference)
    except Exception:
        return jsonify(error='Receipt could not be confirmed. Please contact the academy before submitting again.'), 502, headers
    state['status'] = 'submitted'
    try:
        redis_command(['SET', key, json.dumps(state), 'EX', 86400])
    except Exception:
        pass  # Google confirmed receipt; the pending reservation still prevents retries.
    return jsonify(ok=True, registrationId=reference), 200, headers


@app.get('/healthz')
def health():
    # Deployment must configure durable storage before accepting traffic.
    configured = bool(os.environ.get('UPSTASH_REDIS_REST_URL') and os.environ.get('UPSTASH_REDIS_REST_TOKEN'))
    return jsonify(ok=configured), 200 if configured else 503


@app.route('/api/views', methods=['GET', 'POST'])
def views():
    origin = request.headers.get('Origin')
    if request.method == 'POST' and origin and not trusted_origin(origin):
        abort(403)
    try:
        return jsonify(views=counter(request.method == 'POST')), 200, {'Cache-Control': 'no-store'}
    except Exception:
        return jsonify(error='View count temporarily unavailable'), 503, {'Cache-Control': 'no-store'}


@app.get('/api/events')
def events_document():
    try:
        with urlopen(EVENTS_DOCUMENT_URL, timeout=20) as response:
            if response.headers.get_content_type() != 'text/html':
                raise ValueError('Not a document')
            body = response.read(12 * 1024 * 1024 + 1)
        if len(body) > 12 * 1024 * 1024:
            raise ValueError('Document too large')
        return jsonify(blocks=parse_events(body.decode('utf-8'))), 200, {'Cache-Control': 'no-store'}
    except Exception:
        return jsonify(error='Event updates temporarily unavailable'), 502, {'Cache-Control': 'no-store'}


@app.get('/api/album-image')
def album_image():
    target = request.args.get('url', '')
    parts = urlsplit(target)
    if parts.scheme != 'https' or parts.netloc != 'docs.google.com' or not re.fullmatch(SLIDE_PATH, parts.path):
        abort(400)
    try:
        with urlopen(target, timeout=12) as response:
            if response.headers.get_content_type() != 'image/png':
                raise ValueError('Not an image')
            body = response.read(15 * 1024 * 1024 + 1)
        if len(body) > 15 * 1024 * 1024:
            raise ValueError('Image too large')
        return body, 200, {'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=60', 'X-Content-Type-Options': 'nosniff'}
    except Exception:
        return jsonify(error='Album image temporarily unavailable'), 502


@app.get('/')
def home():
    if not app.config['SERVE_LOCAL_PREVIEW']:
        return redirect('https://anushaartacademy.web.app/', code=302)
    return send_from_directory(SITE, 'index.html')


@app.get('/phone-preview.html')
def phone_preview():
    if not app.config['SERVE_LOCAL_PREVIEW']:
        return redirect('https://anushaartacademy.web.app/phone-preview.html', code=302)
    return send_from_directory(ROOT, 'phone-preview.html')


@app.get('/saved/1/')
def saved_home():
    return home()


@app.get('/saved/1/<path:path>')
@app.get('/<path:path>')
def assets(path):
    if path.startswith('api/') or any(part.startswith('.') for part in Path(path).parts):
        abort(404)
    if not app.config['SERVE_LOCAL_PREVIEW']:
        from urllib.parse import quote
        return redirect('https://anushaartacademy.web.app/' + quote(path, safe='/'), code=302)
    return send_from_directory(SITE, path)
