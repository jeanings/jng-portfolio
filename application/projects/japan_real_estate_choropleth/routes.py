#------------------------------------------
# Route for real estate page.
#------------------------------------------

from flask import Blueprint, render_template
from flask import current_app as app
from .assets import build_assets      # COMMENT OUT FOR GAE DEPLOYMENT


# Blueprint config.
fudousan_bp = Blueprint('fudousan_bp', __name__, 
                        static_folder='static', 
                        template_folder='templates')
build_assets(app)      # COMMENT OUT FOR GAE DEPLOYMENT


# Real estate route.
@fudousan_bp.route('/fudousan', methods=['GET'])
@fudousan_bp.route('/fudousan/', methods=['GET'])
def fudousan():
    return render_template('fudousan.html', title="不動産取引価格マップ", MAPBOX_ACCESS_KEY=app.config["MAPBOX_ACCESS_KEY"])
