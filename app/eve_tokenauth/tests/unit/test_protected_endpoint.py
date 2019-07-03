import json
from eve_tokenauth.tests.base import TestMethodsBase


class TestProtectedEndpoint(TestMethodsBase):

    def setUp(self):
        super().setUp()
        self.token = self.get_auth_token()
        self.token_header = {"Authorization": "Bearer " + self.token}

    def get_auth_token(self):
        post_response = self.post_account("Tim", "King", "password")
        account_id = post_response['_id']

        get_response = self.get_token('a@a.net', 'password')

        return get_response['_items'][0].get('token')

    def test_access_is_denied(self):
        get_response = json.loads(self._get("books").data.decode('utf8'))

        self.assertTrue('_error' in get_response.keys())

    def test_access_with_token_is_allowed(self):
        get_response = json.loads(self._get("books", headers=self.token_header).data.decode('utf8'))

        self.assertFalse('_error' in get_response.keys())