"""Extract displayable text and embedded images from the public events Doc."""
import base64
import binascii
from html.parser import HTMLParser
import re

EVENTS_DOCUMENT_URL = 'https://docs.google.com/document/d/1-cE1KjjwoikvozMxG1G2E74Qb7cBb1uWgJIEY9wIPmY/export?format=html'


class EventsParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.blocks = []
        self.text = []
        self.skipped = 0

    def flush(self):
        text = ''.join(self.text).strip()
        self.text = []
        if text:
            self.blocks.append({'type': 'text', 'text': text})

    def handle_starttag(self, tag, attrs):
        if tag in {'head', 'script', 'style'}:
            self.skipped += 1
        if self.skipped:
            return
        if tag in {'p', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'}:
            self.flush()
        if tag == 'br':
            self.text.append('\n')
        if tag == 'img':
            self.flush()
            attrs = dict(attrs)
            src = attrs.get('src', '')
            if len(src) > 8 * 1024 * 1024:
                return
            match = re.fullmatch(r'data:image/(png|jpeg|gif|webp);base64,([A-Za-z0-9+/=\s]+)', src)
            if not match:
                return
            try:
                data = base64.b64decode(re.sub(r'\s+', '', match[2]), validate=True)
            except (ValueError, binascii.Error):
                return
            signatures = {'png': data.startswith(b'\x89PNG\r\n\x1a\n'),
                          'jpeg': data.startswith(b'\xff\xd8\xff'),
                          'gif': data.startswith((b'GIF87a', b'GIF89a')),
                          'webp': data.startswith(b'RIFF') and data[8:12] == b'WEBP'}
            if signatures[match[1]]:
                self.blocks.append({'type': 'image', 'src': src,
                                    'alt': attrs.get('alt', '').strip() or 'Upcoming event image'})

    def handle_endtag(self, tag):
        if tag in {'head', 'script', 'style'}:
            self.skipped = max(0, self.skipped - 1)
        if not self.skipped and tag in {'p', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'}:
            self.flush()

    def handle_data(self, data):
        if not self.skipped:
            self.text.append(data)


def parse_events(html):
    parser = EventsParser()
    parser.feed(html)
    parser.flush()
    return parser.blocks
