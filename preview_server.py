"""Local academy website preview, persistent view count and public Slides images."""
import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
import re
import sqlite3
from urllib.parse import urlsplit, parse_qs
from urllib.request import urlopen

ROOT = Path(__file__).resolve().parent

class AcademyHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        path = urlsplit(self.path).path
        if path == '/api/views':
            self.views(False)
        elif path == '/api/album-image':
            self.album_image()
        elif path == '/':
            self.send_response(302)
            self.send_header('Location', '/saved/1/')
            self.end_headers()
        else:
            super().do_GET()

    def do_POST(self):
        if self.path != '/api/views':
            self.send_error(404)
            return
        origin = self.headers.get('Origin')
        if origin and urlsplit(origin).netloc != self.headers.get('Host'):
            self.send_error(403)
            return
        self.views(True)

    def views(self, increment):
        try:
            with sqlite3.connect(self.server.database, timeout=10) as db:
                if increment:
                    db.execute('UPDATE views SET total = total + 1 WHERE id = 1')
                total = db.execute('SELECT total FROM views WHERE id = 1').fetchone()[0]
            body = json.dumps({'views': total}).encode()
        except sqlite3.Error:
            self.send_error(503)
            return
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Cache-Control', 'no-store')
        self.end_headers()
        self.wfile.write(body)

    def album_image(self):
        target = parse_qs(urlsplit(self.path).query).get('url', [''])[0]
        parts = urlsplit(target)
        allowed = r'/presentation/(?:u/[0-9]+/)?d/15iFfwv9UDOEaO597w6DZqMoHMH2q-E2krIiuTGW1l7c/viewpage'
        if parts.scheme != 'https' or parts.netloc != 'docs.google.com' or not re.fullmatch(allowed, parts.path):
            self.send_error(400)
            return
        try:
            with urlopen(target, timeout=15) as response:
                if response.headers.get_content_type() != 'image/png':
                    raise ValueError('Not a slide image')
                body = response.read(15 * 1024 * 1024 + 1)
                if len(body) > 15 * 1024 * 1024:
                    raise ValueError('Image too large')
            self.send_response(200)
            self.send_header('Content-Type', 'image/png')
            self.send_header('Content-Length', str(len(body)))
            self.send_header('Cache-Control', 'private, max-age=60')
            self.send_header('X-Content-Type-Options', 'nosniff')
            self.end_headers()
            self.wfile.write(body)
        except Exception:
            self.send_error(502, 'Album image temporarily unavailable')

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=int, default=4187)
    parser.add_argument('--database', type=Path, default=ROOT.parent/'tmp'/'academy-views.sqlite3')
    args = parser.parse_args()
    args.database.parent.mkdir(parents=True, exist_ok=True)
    with sqlite3.connect(args.database) as db:
        db.execute('CREATE TABLE IF NOT EXISTS views (id INTEGER PRIMARY KEY CHECK(id=1), total INTEGER NOT NULL)')
        db.execute('INSERT OR IGNORE INTO views VALUES (1, 0)')
    server = ThreadingHTTPServer(('127.0.0.1', args.port), partial(AcademyHandler, directory=str(ROOT)))
    server.database = args.database
    print(f'Academy preview: http://127.0.0.1:{args.port}/saved/1/', flush=True)
    server.serve_forever()

if __name__ == '__main__':
    main()
