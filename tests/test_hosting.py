import unittest
from production_app import app


class HostingTests(unittest.TestCase):
    def setUp(self):
        self.previous = app.config['SERVE_LOCAL_PREVIEW']
        app.config['SERVE_LOCAL_PREVIEW'] = False
        self.client = app.test_client()

    def tearDown(self):
        app.config['SERVE_LOCAL_PREVIEW'] = self.previous

    def test_old_website_links_redirect_to_firebase(self):
        for old, new in [('/', '/'), ('/saved/1/', '/'),
                         ('/phone-preview.html', '/phone-preview.html'),
                         ('/saved/1/people.css', '/people.css')]:
            response = self.client.get(old)
            self.assertEqual(response.status_code, 302)
            self.assertEqual(response.location, 'https://anushaartacademy.web.app' + new)

    def test_unknown_api_does_not_redirect(self):
        self.assertEqual(self.client.get('/api/unknown').status_code, 404)

    def test_local_preview_still_serves_website(self):
        app.config['SERVE_LOCAL_PREVIEW'] = True
        with self.client.get('/') as response:
            self.assertEqual(response.status_code, 200)


if __name__ == '__main__':
    unittest.main()
