from app.main import bp
from flask import render_template

@bp.route('/')
@bp.route('/home')
def index():
    return render_template('index.html')
