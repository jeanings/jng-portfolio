#------------------------------------------
# Route for index page.
#------------------------------------------

from flask import Blueprint, render_template, url_for
from flask import current_app as app
from . import assets      # COMMENT OUT FOR GAE DEPLOYMENT


# Blueprint config.
index_bp = Blueprint('index_bp', __name__, 
                    static_folder='static',
                    template_folder='templates')
assets.build_assets(app)      # COMMENT OUT FOR GAE DEPLOYMENT


# Index route.
@index_bp.route('/', methods=['GET'])
def index():
    return render_template('index.html', title="Some personal site on the web / jeanings.space")
