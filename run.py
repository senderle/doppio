import bcrypt
from eve import Eve
from eve.auth import HMACAuth
from flask import render_template, render_template_string, request, current_app as app
from hashlib import sha256
from eve.io.mongo import Validator
import hmac
import base64
import logging
import json
from schema import schema
import secrets
import string
from flask import request

class MyValidator(Validator):
    def _validate_documentation(self, documentation, field, value):
        if documentation:
            return

    def _validate_formType(self, formType, field, value):
        if formType:
            return

# HMAC Auth
class HMACAuth(HMACAuth):
    def check_auth(self, userid, hmac_hash, headers, data, allowed_roles,
        resource, method):
        # use Eve's own db driver; no additional connections/resources are
        # used
        accounts = app.data.driver.db['accounts']
        lookup = {'userid': userid}
        user = accounts.find_one(lookup)  # should be userid or id?
        if allowed_roles:
            # only retrieve a user if his roles match ``allowed_roles``
            lookup['roles'] = {'$in': allowed_roles}
        if user:
            secret_key = user['secret_key']

        return user and hmac.new(str(secret_key).encode('utf-8'), data, sha256).hexdigest() == hmac_hash

def generate_key():
    alphabet = string.ascii_letters + string.digits
    while True:
        key = ''.join(secrets.choice(alphabet) for i in range(10))
        if (any(c.islower() for c in key)
                and any(c.isupper() for c in key)
                and sum(c.isdigit() for c in key) >= 3):
            break
    return key
# cmdline: python -c 'import run; run.generate_key()'

def create_hash(secret_key, data):
    hmac.new(str(secret_key).encode('utf-8'), data, sha256).hexdigest()

def create_user(documents):
    for document in documents:
        document['salt'] = bcrypt.gensalt()
        secret_key = document['secret_key']
        secret_key = bcrypt.hashpw(secret_key, document['salt'])
        document['secret_key'] = secret_key

def log_every_get(resource, request, payload):
    print (request.headers)
    # custom INFO-level message is sent to the log file
    app.logger.info('We just answered to a GET request!')

def log_every_post(resource, request, payload):
    print (request.headers)
    # custom INFO-level message is sent to the log file
    app.logger.info('We just answered to a POST request!')

def log_every_patch(resource, request, payload):
    # custom INFO-level message is sent to the log file
    app.logger.info('We just answered to a PATCH request!')

def log_every_put(resource, request, payload):
    # custom INFO-level message is sent to the log file
    app.logger.info('We just answered to a PUT request!')

def log_every_delete(resource, request, payload):
    print (request)
    # custom INFO-level message is sent to the log file
    app.logger.info('We just answered to a DELETE request!')

# BasicAuth
from eve.auth import BasicAuth

class BCryptAuth(BasicAuth):
    def check_auth(self, username, password, allowed_roles, resource, method):
        print ("Username is" + username)
        print ("Password is" + password)
        if resource == 'accounts':
            print ("accounts resources")
            return username == 'superuser' and password == 'password'
        else:
            # use Eve's own db driver; no additional connections/resources are used
            print ("other resources")
            accounts = app.data.driver.db['accounts']
            account = accounts.find_one({'username': username})
            return account and bcrypt.hashpw(password.encode('utf-8'),account['salt']) == account['password']

    def create_user(documents):
        print ("create_user")
        for document in documents:
            for i in document:
                print (i)
            document['salt'] = bcrypt.gensalt()
            password = document['password'].encode('utf-8')
            document['password'] = bcrypt.hashpw(password, document['salt'])

# TokenAuth
from eve.auth import TokenAuth
import random
import string
import base64
import datetime
from datetime import timedelta

class RolesAuth(TokenAuth):
    def check_auth(self, token,  allowed_roles, resource, method):
        # use Eve's own db driver; no additional connections/resources are used
        accounts = app.data.driver.db['accounts']
        lookup = {'token': token}
        if resource == 'accounts':
            return token == "c3VwZXJ1c2VyOnBhc3N3b3Jk"
        if allowed_roles:
            # only retrieve a user if his roles match ``allowed_roles``
            lookup['roles'] = {'$in': allowed_roles}
        account = accounts.find_one(lookup)
        return account

    def add_token(user):
        print (user)
        payload = {
            'sub': user[0]['username'],
            'iat': datetime.datetime.now(),
            'exp': datetime.datetime.now() + timedelta(days=14)
        }

        token = jwt.encode(payload, TOKEN_SECRET)
        dec = token.decode('unicode_escape')
        print (dec)
        return dec

# token auth
class TokenAuth(TokenAuth):
    def check_auth(self, username, password, token, allowed_roles, resource, method):
        """For the purpose of this example the implementation is as simple as
        possible. A 'real' token should probably contain a hash of the
        username/password combo, which sould then validated against the account
        data stored on the DB.
        """
        # use Eve's own db driver; no additional connections/resources are used
        if resource == 'accounts' and method == "post":
            return token == "c3VwZXJ1c2VyOnBhc3N3b3Jk"
        if token:
            accounts = app.data.driver.db['accounts']
            return accounts.find_one({'token': token})
        else:
            accounts = app.data.driver.db['accounts']
            account = accounts.find_one({'username': username})
            return account and bcrypt.hashpw(password.encode('utf-8'),account['salt']) == account['password']

    def create_user(documents):
        print ("create_user")
        for document in documents:
            for i in document:
                print (i)
            document['salt'] = bcrypt.gensalt()
            password = document['password'].encode('utf-8')
            document['password'] = bcrypt.hashpw(password, document['salt'])

    def add_token(user):
        for document in documents:
            document["token"] = (''.join(random.choice(string.ascii_uppercase)
                                      for x in range(10)))

# from controllers import accounts, tokens

# app = Eve(__name__, auth=BCryptAuth, template_folder='templates', validator=MyValidator)
# app.on_insert_accounts += accounts.hash_passwords
# app.on_fetched_resource_tokens += tokens.generate_login_token_for_user
# app.on_post_GET += log_every_get
# app.on_post_POST += log_every_post


# Basic Auth
# app = Eve(__name__, auth=BCryptAuth, template_folder='templates', validator=MyValidator)
# app.on_insert_accounts += BCryptAuth.create_user
# app.on_post_GET += log_every_get


# app = Eve(__name__, auth=HMACAuth, template_folder='templates', validator=MyValidator)
# app.on_post_POST += log_every_post
# app.on_post_PATCH += log_every_patch
# app.on_post_PUT += log_every_put
# app.on_post_DELETE += log_every_delete

import logging
import os
from eve.flaskapp import Eve
from eve_tokenauth.eveapp import EveWithTokenAuth
from flask import send_from_directory


logging.basicConfig(format='%(asctime)s %(message)s', level=logging.DEBUG)
log = logging.getLogger(__name__)

settings = os.path.join(os.path.dirname(os.path.realpath(__file__)), 'settings.py')
app = Eve(__name__, static_folder='static', settings=settings, template_folder='templates', validator=MyValidator)
app.on_post_POST += log_every_post
app.on_post_PATCH += log_every_patch
app.on_post_PUT += log_every_put
app.on_post_DELETE += log_every_delete
evewta = EveWithTokenAuth(app)

@app.route('/home')
def index():
    return render_template('index.html')

@app.route('/login')
def login():
    return render_template('login.html')

@app.route('/login.js')
def render_login_js():
    return render_template('login.js')

@app.route('/newlogin')
def newlogin():
    return render_template('newlogin.html')

@app.route('/newlogin.js')
def render_newlogin_js():
    return render_template('newlogin.js')

@app.route('/signup')
def signup():
    return render_template('signup.html')

@app.route('/signup.js')
def render_signup_js():
    return render_template('signup.js')

@app.route('/main.js')
def render_main_js():
    return render_template('main.js')

@app.route('/map')
def map():
    return render_template('map.html')

@app.route('/map.js')
def render_map_js():
    return render_template('map.js')

@app.route('/schema.json')
def render_schema_json():
    schema_json = json.dumps(schema)
    return render_template_string(schema_json)

@app.route('/style.css')
def render_stylesheet():
    return app.send_static_file('style.css')
    
@app.route('/search')
def render_search_page():
    return render_template('search.html')

@app.route('/search.js')
def render_search_js():
    return render_template('search.js')

@app.route('/functions.js')
def render_functions_js():
    return render_template('functions.js')



if __name__ == '__main__':

    # enable logging to 'app.log' file
    handler = logging.FileHandler('app.log')

    # set a custom log format, and add request
    # metadata to each log line
    handler.setFormatter(logging.Formatter(
        '%(asctime)s %(levelname)s: %(message)s '
        '[in %(filename)s:%(lineno)d] -- ip: %(clientip)s, '
        'url: %(url)s, method:%(method)s'))

    

    app.logger.setLevel(logging.INFO)

    # append the handler to the default application logger
    app.logger.addHandler(handler)
    app.run(debug=True, host="0.0.0.0", threaded=True)


