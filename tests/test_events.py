import unittest
from unittest.mock import patch
from io import BytesIO
from email.message import Message

from event_document import parse_events
from production_app import app


class EventsTests(unittest.TestCase):
    def test_images_remain_between_text_blocks(self):
        blocks = parse_events('<p>Before</p><p><img src="data:image/png;base64,iVBORw0KGgo="></p><p>After</p>')
        self.assertEqual([b['type'] for b in blocks], ['text', 'image', 'text'])
        self.assertEqual(blocks[-1]['text'], 'After')

    def test_unsafe_images_and_scripts_are_not_returned(self):
        blocks = parse_events('<style>hidden</style><script>secret()</script><p>Safe &amp; sound</p>'
                              '<img src="https://untrusted.example/a.png"><img src="data:image/svg+xml;base64,PHN2Zz4=">'
                              '<img src="data:image/png;base64,bm90LWFuLWltYWdl">')
        self.assertEqual(blocks, [{'type': 'text', 'text': 'Safe & sound'}])

    def test_endpoint_returns_document_blocks(self):
        response = BytesIO(b'<p>Event details</p>')
        response.headers = Message()
        response.headers['Content-Type'] = 'text/html'
        with patch('production_app.urlopen', return_value=response):
            result = app.test_client().get('/api/events')
        self.assertEqual(result.status_code, 200)
        self.assertEqual(result.json['blocks'][0]['text'], 'Event details')

    def test_document_failure_is_recoverable(self):
        with patch('production_app.urlopen', side_effect=TimeoutError):
            result = app.test_client().get('/api/events')
        self.assertEqual(result.status_code, 502)


if __name__ == '__main__':
    unittest.main()
