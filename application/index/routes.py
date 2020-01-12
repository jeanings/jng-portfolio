#------------------------------------------
# Route for index page.
#------------------------------------------

from flask import Blueprint, render_template, url_for
from flask import current_app as app
from . import assets


# Blueprint config.
index_bp = Blueprint('index_bp', __name__, 
                    static_folder='static',
                    template_folder='templates')
assets.build_assets(app)


# Index route.
@index_bp.route('/', methods=['GET'])
def index():
    return render_template('index.html', title="Welcome.")
