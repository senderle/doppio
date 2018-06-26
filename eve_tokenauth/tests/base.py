import base64
import json
import os
from unittest import TestCase
from urllib.parse import urljoin
import bson
from eve.flaskapp import Eve
from pymongo import MongoClient
from eve_tokenauth.eveapp import EveWithTokenAuth
from eve_tokenauth.tests.testsettings import *
from eve_tokenauth.tests.testsettings import MONGO_DBNAME


class TestBaseMinimal(TestCase):
    def setUp(self):
        settings_path = os.path.join(os.path.dirname(
            os.path.realpath(__file__)), 'testsettings.py')

        self.headers = {'Content-Type': 'application/json'}

        self.setupDB()

        self.apiapp = Eve(settings=settings_path)
        self.evewta = EveWithTokenAuth(self.apiapp)

        self.local_client = self.apiapp.test_client()

    def setupDB(self):
        self.connection = MongoClient(MONGO_HOST, MONGO_PORT)
        self.connection.drop_database(MONGO_DBNAME)
        if MONGO_USERNAME:
            self.connection[MONGO_DBNAME].add_user(MONGO_USERNAME,
                                                   MONGO_PASSWORD)

    def bulk_insert(self):
        pass

    def dropDB(self):
        self.connection = MongoClient(MONGO_HOST, MONGO_PORT)
        self.connection.drop_database(MONGO_DBNAME)
        self.connection.close()


class TestMethodsBase(TestBaseMinimal):
    def setUp(self):

        self.target_url = "http://localhost:6000/dummy"

        super().setUp()

    def tearDown(self):
        super().tearDown()

    def _build_url(self, resource, item):
        base = self.apiapp.api_prefix

        if item:
            return "{0}/{1}/{2}".format(base, resource, item)
        else:
            return "{0}/{1}".format(base, resource)

    def _setup_change_operation(self, etag, item, payload, resource):
        url = self._build_url(resource, item)
        headers = {
            "If-Match": etag
        }
        headers.update(self.headers)
        payload = json.dumps(payload)
        return headers, payload, url

    def _post(self, resource, payload, headers=None, item=None):

        if headers:
            self.headers.update(headers)

        url = self._build_url(resource, item)

        payload = json.dumps(payload)
        return self.local_client.post(url, data=payload, headers=self.headers)

    def _get(self, resource, item=None, headers=None):

        url = self._build_url(resource, item)

        return self.local_client.get(url, headers=headers)

    def _patch(self, resource, payload, etag, item=None):
        headers, payload, url = self._setup_change_operation(etag, item, payload, resource)

        return self.local_client.patch(url, data=payload, headers=headers)

    def _put(self, resource, payload, etag, item=None):
        headers, payload, url = self._setup_change_operation(etag, item, payload, resource)

        return self.local_client.put(url, data=payload, headers=headers)

    def _delete(self, resource, etag, item):
        payload = {}
        headers, _, url = self._setup_change_operation(etag, item, payload, resource)

        return self.local_client.delete(url, headers=headers)

    def _parse_get_items(self, response):
        return json.loads(response.data.decode('utf8'))['_items']

    def get_account(self, id, headers=None):
        url = urljoin("accounts/", id)
        response = self._get(url, headers=headers)

        return json.loads(response.data.decode('utf8'))

    def post_account(self, first_name, last_name, password):
        payload = dict(
            first_name=first_name,
            last_name=last_name,
            email="a@a.net",
            password=password,
            is_email_confirmed=True,
        )

        response = self._post("accounts", payload)
        return json.loads(response.data.decode('utf8'))

    def get_token(self, email, password):
        url = "tokens/"

        authheader = str(email + ":" + password).encode('utf8')
        headers = {
            'Authorization': 'Basic ' + base64.b64encode(authheader).decode('utf8')
        }

        response = self._get(url, headers=headers)

        return json.loads(response.data.decode('utf8'))

    def fetch_account(self, account_id):
        accounts = self.connection[MONGO_DBNAME].accounts
        result = accounts.find_one({"_id": bson.ObjectId(account_id)})
        return result