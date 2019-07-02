from flask import (render_template, render_template_string)
from schema import main_schema
from eve_tokenauth.eveapp import EveWithTokenAuth
from app import create_app
from eve.io.mongo import Validator
from app.cli import init_cli

import warnings
import json



app = create_app()

init_cli(app)
EveWithTokenAuth(app)


@app.route('/signup')
def signup():
    return render_template('signup.html')

@app.route('/map')
def map():
    return render_template('map.html')

@app.route('/schema.json')
def render_schema_json():
    schema_json = json.dumps(main_schema)
    return render_template_string(schema_json)


if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", threaded=True)
