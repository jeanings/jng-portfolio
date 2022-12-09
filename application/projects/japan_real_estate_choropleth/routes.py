#-----------------------------------------------
# Route for Japan real estate choropleth page.
#-----------------------------------------------

from flask import Blueprint, render_template
from flask import current_app as app
from .assets import build_assets

DEBUG_MODE = app.config['FLASK_DEBUG']


# Blueprint config.
japan_real_estate_choropleth_bp = Blueprint('japan_real_estate_choropleth_bp', __name__, 
    static_folder='static', 
    template_folder='templates'
)

if DEBUG_MODE == True:
    build_assets(app)


# Japan real estate choropleth route.
@japan_real_estate_choropleth_bp.route('/fudousan-kakaku-nuriwake-chizu-2010-2020', methods=['GET'])
@japan_real_estate_choropleth_bp.route('/fudousan-kakaku-nuriwake-chizu-2010-2020/', methods=['GET'])
def japan_real_estate_choropleth():
    return render_template('japan_real_estate_choropleth.html', 
        title="不動産取引価格塗り分け地図 2010～2020  ——  jeanings.space", 
        MAPBOX_ACCESS_KEY=app.config["MAPBOX_ACCESS_KEY"]
    )
