#------------------------------------------
# Route for tokaido page.
#------------------------------------------

from flask import Blueprint, render_template
from flask import current_app as app
from flask_sqlalchemy import SQLAlchemy
from .assets import build_assets
from application.models import db, Journal

DEBUG_MODE = app.config['FLASK_DEBUG']


# Blueprint config.
tokaido_bp = Blueprint('tokaido_bp', __name__, 
    static_folder='static', 
    template_folder='templates'
)

if DEBUG_MODE == 'True':
    build_assets(app)


# Tokaido route.
@tokaido_bp.route('/tokaido-urban-hike', methods=['GET'])
@tokaido_bp.route('/tokaido-urban-hike/', methods=['GET'])  
def tokaido_urban_hike():
    """ 
    Dynamically generate each journal entry, pulling info from database. 
    """
    
    day_entries = []
    cumulative_dist = []
    total_dist = 545.68

    for i in range(0, 27):
        day_entry = Journal.query.filter_by(day=i).first()
        day_entries.append(day_entry)
        dist = float(day_entry.distance_percent_cum)
        cumulative = total_dist - (total_dist * 0.01 * dist)
        cumulative_dist.append("{:.2f}".format(cumulative))

    return render_template('tokaido.html', 
        title="Urban Hiking the Tokaido  ——  jeanings.space", 
        MAPBOX_ACCESS_KEY=app.config["MAPBOX_ACCESS_KEY"], 
        day_entries=day_entries, 
        totals=cumulative_dist, 
        total=total_dist
    )
