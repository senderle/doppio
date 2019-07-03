import json
from eve_tokenauth.tests.base import TestMethodsBase


class TestBasicAuthOnTokenEndpoint(TestMethodsBase):

    def test_get_for_existing_account(self):
        post_response = self.post_account("Tim", "King", "password")
        account_id = post_response['_id']

        get_response = self.get_token('a@a.net', 'password')

        self.assertTrue('_error' not in get_response.keys())

    def test_get_bad_account(self):
        get_response = self.get_token('b@a.net', 'bogus')

        self.assertTrue('_error' in get_response.keys())

    def test_no_auth_credentials(self):
        get_response = json.loads(self._get("tokens").data.decode('utf8'))

        self.assertTrue('_error' in get_response.keys())


class TestControlsOnTokenEndpoint(TestMethodsBase):

    def test_token_in_response(self):
        post_response = self.post_account("Tim", "King", "password")
        account_id = post_response['_id']

        get_response = self.get_token('a@a.net', 'password')

        self.assertTrue(get_response['_items'][0].get('token'))

    def test_two_tokens_returned(self):
        post_response = self.post_account("Tim", "King", "password")
        account_id = post_response['_id']

        get_response = self.get_token('a@a.net', 'password')
        get_response2 = self.get_token('a@a.net', 'password')

        self.assertEqual(len(get_response2['_items']), 2)