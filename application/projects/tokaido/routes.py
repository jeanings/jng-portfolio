#------------------------------------------
# Route for tokaido page.
#------------------------------------------

from flask import Blueprint, render_template
from flask import current_app as app
from .assets import build_assets
import requests
# from flask_sqlalchemy import SQLAlchemy
# from application.models import db, Journal

DEBUG_MODE = app.config['FLASK_DEBUG']


# Blueprint config.
tokaido_bp = Blueprint('tokaido_bp', __name__, 
    static_folder='static', 
    template_folder='templates'
)

if DEBUG_MODE == True:
    build_assets(app)


# Tokaido route.
@tokaido_bp.route('/tokaido-urban-hike', methods=['GET'])
@tokaido_bp.route('/tokaido-urban-hike/', methods=['GET'])  
def tokaido_urban_hike():
    """ 
    Generate each journal entry.
    """

    # Get data from external JSON.
    json_url = 'https://storage.googleapis.com/jn-portfolio/projects/tokaido/data/journal.json'
    try:
        response = requests.get(json_url)
        read_json = response.json()
    except response.ConnectionError:
       return "Connection error in fetching journal data."
    
    data = read_json
    day_entries = []
    cumulative_dist = []
    total_dist = 545.68

    for index in range(0, len(data['journalEntries'])):
        # Get entries in ascending order.
        day_entry = [entry for entry in data['journalEntries'] if entry['day'] == index][0]
        # Compile entries in correct order.
        day_entries.append(day_entry)

        # Calculate distances.
        dist = float(day_entry['distancePercentCum'])
        cumulative = total_dist - (total_dist * 0.01 * dist)
        cumulative_dist.append("{:.2f}".format(cumulative))

    return render_template('tokaido.html', 
        title="Urban Hiking the Tokaido  ——  jeanings.space", 
        MAPBOX_ACCESS_KEY=app.config["MAPBOX_ACCESS_KEY"], 
        day_entries=day_entries, 
        totals=cumulative_dist, 
        total=total_dist
    )
