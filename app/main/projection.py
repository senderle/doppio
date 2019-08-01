from app.main import bp
from flask import render_template

@bp.route('/projection')
def render_projection_page():
    return render_template('projection.html')
