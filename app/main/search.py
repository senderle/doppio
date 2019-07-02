from app.main import bp
from flask import render_template

@bp.route('/search')
def render_search_page():
    return render_template('search.html')
