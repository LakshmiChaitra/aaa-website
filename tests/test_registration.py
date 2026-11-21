import json
import unittest
from io import BytesIO
from unittest.mock import patch
from urllib.parse import parse_qs

import production_app as site


class RegistrationTests(unittest.TestCase):
    def setUp(self):
        self.client = site.app.test_client()
        self.data = dict(studentName='Website Test', age='20', phone='0000000000',
                         address='Test address', course='Yoga', learningMode='Online',
                         guardianName='', preferredBatch='Morning', message='',
                         requestId='12345678-1234-4234-8234-123456789012')
        self.headers = {'Origin': 'http://localhost'}
        self.store = {}

    def redis(self, command):
        op, key, *args = command
        if op == 'GET':
            return self.store.get(key)
        if op == 'SET':
            if 'NX' in args and key in self.store:
                return None
            self.store[key] = args[0]
            return 'OK'
        raise AssertionError(command)

    def post(self, **updates):
        return self.client.post('/api/registrations', json={**self.data, **updates}, headers=self.headers)

    def test_required_fields_and_online_classes(self):
        with patch.object(site, 'urlopen') as upstream:
            for updates in ({'address': ''}, {'age': '0'}, {'age': '121'},
                            {'phone': 'no'}, {'learningMode': ''},
                            {'course': 'Keyboard classes', 'learningMode': 'Online'},
                            {'course': 'Unknown'}, {'requestId': 'invalid'}, {'age': 20}):
                self.assertEqual(self.post(**updates).status_code, 400)
            upstream.assert_not_called()
        self.assertEqual(self.client.post('/api/registrations', json=self.data).status_code, 403)
        self.assertEqual(self.client.post('/api/registrations', json=self.data,
                         headers={'Origin': 'https://other.example'}).status_code, 403)

    def test_confirmed_submission_and_retry_send_once(self):
        body = b'<div class="vHW8K">Your response has been recorded.</div>'
        with patch.object(site, 'redis_command', side_effect=self.redis), patch.object(site, 'urlopen', return_value=BytesIO(body)) as google:
            result = self.post()
            self.assertEqual(result.status_code, 200)
            self.assertTrue(result.json['ok'])
            fields = parse_qs(google.call_args.args[0].data.decode())
            self.assertEqual(fields['entry.1676087060'], ['Test address'])
            self.assertEqual(fields['entry.68124289'], ['Yoga'])
            self.assertEqual(fields['entry.984631157'], ['Online'])
            self.assertIn(site.FORM_ID, google.call_args.args[0].full_url)
            self.assertIn('Learning mode: Online', fields['entry.2022916799'][0])
            self.assertEqual(self.post().json, result.json)
            google.assert_called_once()
            self.assertEqual(self.post(studentName='Different learner').status_code, 409)
        self.assertNotIn('Test address', str(self.store))
        self.assertNotIn('0000000000', str(self.store))

    def test_keyboard_saves_its_own_course_and_learning_mode(self):
        with patch.object(site, 'redis_command', side_effect=self.redis), patch.object(site, 'urlopen', return_value=BytesIO(b'<div class="vHW8K">Your response has been recorded.</div>')) as google:
            self.assertEqual(self.post(course='Keyboard classes', learningMode='Offline').status_code, 200)
            fields = parse_qs(google.call_args.args[0].data.decode())
            self.assertEqual(fields['entry.68124289'], ['Keyboard classes'])
            self.assertEqual(fields['entry.984631157'], ['Offline'])

    def test_unknown_response_is_not_success_or_retried(self):
        for body in (b'<script>"Your response has been recorded."</script>', b'<p>Form is closed</p>'):
            self.store.clear()
            with patch.object(site, 'redis_command', side_effect=self.redis), patch.object(site, 'urlopen', return_value=BytesIO(body)) as google:
                self.assertEqual(self.post().status_code, 502)
                self.assertEqual(self.post().status_code, 409)
                google.assert_called_once()

    def test_store_outage_does_not_send_registration(self):
        with patch.object(site, 'redis_command', side_effect=TimeoutError), patch.object(site, 'urlopen') as google:
            self.assertEqual(self.post().status_code, 503)
            google.assert_not_called()

    def test_google_timeout_does_not_retry(self):
        with patch.object(site, 'redis_command', side_effect=self.redis), patch.object(site, 'urlopen', side_effect=TimeoutError) as google:
            self.assertEqual(self.post().status_code, 502)
            self.assertEqual(self.post().status_code, 409)
            google.assert_called_once()


if __name__ == '__main__':
    unittest.main()
