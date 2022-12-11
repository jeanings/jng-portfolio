#------------------------------------------
# Route for index page.
#------------------------------------------

from flask import Blueprint, render_template, url_for
from flask import current_app as app
from .assets import build_assets

DEBUG_MODE = app.config['FLASK_DEBUG']


# Blueprint config.
index_bp = Blueprint('index_bp', __name__,
    static_folder='static',
    template_folder='templates'
)

if DEBUG_MODE == True:
    build_assets(app)


# Index route.
@index_bp.route('/', methods=['GET'])
def index():
    return render_template('index.html', 
        title="Some personal site on the web  ——  jeanings.space"
    )
