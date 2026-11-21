"""Render web app. Registration remains in the academy's Google Form."""
import json
import os
from pathlib import Path
import re
from urllib.parse import urlsplit
from urllib.request import Request, urlopen

from flask import Flask, abort, jsonify, request, send_from_directory
from werkzeug.middleware.proxy_fix import ProxyFix

ROOT = Path(__file__).resolve().parent
SITE = ROOT / 'saved' / '1'
SLIDE_PATH = r'/presentation/(?:u/[0-9]+/)?d/15iFfwv9UDOEaO597w6DZqMoHMH2q-E2krIiuTGW1l7c/viewpage'
app = Flask(__name__, static_folder=None)
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1)


def counter(increment):
    endpoint = os.environ.get('UPSTASH_REDIS_REST_URL', '').rstrip('/')
    token = os.environ.get('UPSTASH_REDIS_REST_TOKEN', '')
    if not endpoint or not token:
        raise ValueError('Counter store is not configured')
    parts = urlsplit(endpoint)
    if parts.scheme != 'https' or not parts.hostname or not parts.hostname.endswith('.upstash.io'):
        raise ValueError('Invalid counter store')
    command = ['INCR' if increment else 'GET', 'anusha:website:views']
    operation = Request(endpoint, data=json.dumps(command).encode(), method='POST', headers={
        'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'
    })
    with urlopen(operation, timeout=6) as response:
        data = json.load(response)
    if 'error' in data:
        raise ValueError('Counter store unavailable')
    total = int(data['result']) if data['result'] is not None else 0
    if total < 0 or total > 9007199254740991:
        raise ValueError('Invalid view count')
    return total


@app.get('/healthz')
def health():
    # Deployment must configure durable storage before accepting traffic.
    configured = bool(os.environ.get('UPSTASH_REDIS_REST_URL') and os.environ.get('UPSTASH_REDIS_REST_TOKEN'))
    return jsonify(ok=configured), 200 if configured else 503


@app.route('/api/views', methods=['GET', 'POST'])
def views():
    origin = request.headers.get('Origin')
    if request.method == 'POST' and origin and urlsplit(origin).netloc != request.host:
        abort(403)
    try:
        return jsonify(views=counter(request.method == 'POST')), 200, {'Cache-Control': 'no-store'}
    except Exception:
        return jsonify(error='View count temporarily unavailable'), 503, {'Cache-Control': 'no-store'}


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
    return send_from_directory(SITE, 'index.html')


@app.get('/phone-preview.html')
def phone_preview():
    return send_from_directory(ROOT, 'phone-preview.html')


@app.get('/saved/1/')
def saved_home():
    return send_from_directory(SITE, 'index.html')


@app.get('/saved/1/<path:path>')
@app.get('/<path:path>')
def assets(path):
    if path.startswith('api/') or any(part.startswith('.') for part in Path(path).parts):
        abort(404)
    return send_from_directory(SITE, path)
