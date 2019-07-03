import json
from eve_tokenauth.tests.base import TestMethodsBase


class TestAccountsEvents(TestMethodsBase):

    def test_account_is_added(self):
        post_response = self.post_account("Tim", "King", "password")
        account_id = post_response['_id']

        result = self.fetch_account(account_id)

        self.assertTrue(result)

    def test_password_is_not_plaintext(self):
        post_response = self.post_account("Tim", "King", "password")
        account_id = post_response['_id']

        matching_account = self.fetch_account(account_id)

        self.assertNotEqual(matching_account["password"], "password")

    def test_password_not_included_on_get(self):

        # temporarily turn off authentication on this endpoint
        self.apiapp.config['DOMAIN']['accounts']['authentication'] = None

        post_response = self.post_account("Tim", "King", "password")
        account_id = post_response['_id']

        result = self.get_account(account_id)

        self.assertTrue("password" not in result.keys())
        self.assertTrue("email" in result.keys())


class TestAccountsEndpointAuth(TestMethodsBase):

    def test_without_auth_allows_post(self):
        post_response = self.post_account("Tim", "King", "password")
        account_id = post_response['_id']

        get_response = self.get_account(account_id)

        self.assertTrue(get_response)

    def test_without_auth_denies_get(self):
        get_response = json.loads(self._get("accounts").data.decode('utf8'))

        self.assertTrue('_error' in get_response.keys())

    def test_with_token_allows_get(self):
        post_response = self.post_account("Tim", "King", "password")
        account_id = post_response['_id']

        get_response = self.get_token('a@a.net', 'password')

        token = get_response['_items'][0].get('token')
        headers = {"Authorization": "Bearer " + token}

        get_account_response = self.get_account(account_id, headers)

        self.assertFalse('_error' in get_account_response.keys())
