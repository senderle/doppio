from eve.flaskapp import Eve
from flask import (render_template, render_template_string)
from eve.io.mongo import Validator
from settings import EVE_MAIN_COLLECTION
from bson import json_util, ObjectId
import logging
import json
import os
import click
import getpass
import bcrypt
import shutil
from schema import main_schema
from eve_tokenauth.eveapp import EveWithTokenAuth

class MyValidator(Validator):
    def _validate_documentation(self, documentation, field, value):
        """ Test the oddity of a value.
        The rule's arguments are validated against this schema:
        {'type': 'string'}
        """
        if documentation:
            return

    def _validate_formType(self, formType, field, value):
        """ Test the oddity of a value.
        The rule's arguments are validated against this schema:
        {'type': 'string'}
        """
        if formType:
            return

    def _validate_order(self, order, field, value):
        """ Test the oddity of a value.
        The rule's arguments are validated against this schema:
        {'type': 'string'}
        """
        if order:
            return


logging.basicConfig(format='%(asctime)s %(message)s', level=logging.DEBUG)
log = logging.getLogger(__name__)
settings = os.path.join(os.path.dirname(os.path.realpath(__file__)),
                        'settings.py')
app = Eve(__name__, static_folder='static',
          static_url_path=os.path.join(os.getcwd(),'static'), settings=settings,
          template_folder='templates', validator=MyValidator)


# Command Line Management Commands #

# Create user to access website
@app.cli.command()
def createsuperuser():

    username = input("Username: ")

    if (username == ""):
        click.echo("Username cannot be empty")
        return

    password = getpass.getpass("Password: ")
    confirm_password = getpass.getpass("Confirm Password: ")

    if (password != confirm_password):
        click.echo("Passwords don't match")
        return

    password = bcrypt.hashpw(password.encode('utf8'), bcrypt.gensalt())

    accounts = app.data.driver.db['accounts']
    account = accounts.find_one({'username': username})

    if account is None:
        accounts.insert_one({'username': username, "password" : password})
        click.echo("Successfully created user")
    else:
        click.echo("User already exists")


# Dump data from mongo to json files
@app.cli.command()
def dumptojson():

    dir = 'dumps'

    if not os.path.exists(dir):
        os.mkdir(dir)
    else:
        shutil.rmtree(dir)
        os.makedirs(dir)


    collection = app.data.driver.db[EVE_MAIN_COLLECTION]
    docs = collection.find()

    #i = 0;

    for doc in docs:

        # Enumerate the filenames
        #filename = '%s/item%d.json' % (dir,i)

        # Use object id as filename
        filename = dir + '/' + str(doc['_id']) + '.json'

        with open(filename, 'w') as outfile:
            json.dump(json.loads(json_util.dumps(doc)), outfile)

        #i += 1




def log_every_get(resource, request, payload):
    # custom INFO-level message is sent to the log file
    app.logger.info('We just answered to a GET request!')

def log_every_post(resource, request, payload):
    # custom INFO-level message is sent to the log file
    app.logger.info('We just answered to a POST request!')

def log_every_patch(resource, request, payload):
    # custom INFO-level message is sent to the log file
    app.logger.info('We just answered to a PATCH request!')

def log_every_put(resource, request, payload):
    # custom INFO-level message is sent to the log file
    app.logger.info('We just answered to a PUT request!')

def log_every_delete(resource, request, payload):
    # custom INFO-level message is sent to the log file
    app.logger.info('We just answered to a DELETE request!')


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

# @app.route('/login.js')
# def render_login_js():
#     return render_template('login.js')

@app.route('/signup')
def signup():
    return render_template('signup.html')

# @app.route('/signup.js')
# def render_signup_js():
#     return render_template('signup.js')

# @app.route('/main.js')
# def render_main_js():
#     return render_template('main.js')

@app.route('/map')
def map():
    return render_template('map.html')

# @app.route('/map.js')
# def render_map_js():
#     return render_template('map.js')

@app.route('/schema.json')
def render_schema_json():
    schema_json = json.dumps(main_schema)
    return render_template_string(schema_json)
#
# @app.route('/style.css')
# def render_stylesheet():
#     return app.send_static_file('style.css')

@app.route('/search')
def render_search_page():
    return render_template('search.html')

# @app.route('/search.js')
# def render_search_js():
#     return render_template('search.js')
#
# @app.route('/functions.js')
# def render_functions_js():
#     return render_template('functions.js')


# enable logging to 'app.log' file
app_logging_handler = logging.FileHandler('app.log')

# set a custom log format, and add request
# metadata to each log line
app_logging_handler.setFormatter(logging.Formatter(
    '%(asctime)s %(levelname)s: %(message)s '
    '[in %(filename)s:%(lineno)d] -- ip: %(clientip)s, '
    'url: %(url)s, method:%(method)s'))

app.logger.setLevel(logging.INFO)

# append the handler to the default application logger
app.logger.addHandler(app_logging_handler)

if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", threaded=True)
