from eve.flaskapp import Eve
from flask import (render_template, render_template_string)
from eve.io.mongo import Validator
import logging
import json
import os
from schema import main_schema
from eve_tokenauth.eveapp import EveWithTokenAuth

class MyValidator(Validator):
    def _validate_documentation(self, documentation, field, value):
        if documentation:
            return

    def _validate_formType(self, formType, field, value):
        if formType:
            return


logging.basicConfig(format='%(asctime)s %(message)s', level=logging.DEBUG)
log = logging.getLogger(__name__)
settings = os.path.join(os.path.dirname(os.path.realpath(__file__)),
                        'settings.py')
app = Eve(__name__, static_folder='static', settings=settings,
          template_folder='templates', validator=MyValidator)


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

@app.route('/login.js')
def render_login_js():
    return render_template('login.js')

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
    schema_json = json.dumps(main_schema)
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
