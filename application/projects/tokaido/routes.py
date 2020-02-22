#------------------------------------------
# Route for tokaido page.
#------------------------------------------

from flask import Blueprint, render_template
from flask import current_app as app
from .assets import build_assets


# Blueprint config.
tokaido_bp = Blueprint('tokaido_bp', __name__, 
                        static_folder='static', 
                        template_folder='templates')
build_assets(app)

# Tokaido route.
@tokaido_bp.route('/tokaido_urban_hike', methods=['GET'])
def projects():
    return render_template('tokaido.html', title="Urban hiking the Tokaido")
