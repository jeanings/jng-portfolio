#------------------------------------------
# Route for gallery page.
#------------------------------------------

from flask import Blueprint, render_template
from flask import current_app as app
from .assets import build_assets      # COMMENT OUT FOR GAE DEPLOYMENT
from pathlib import Path
import numpy as np
import csv


# Blueprint config.
gallery_bp = Blueprint('gallery_bp', __name__, 
                        static_folder='static', 
                        template_folder='templates')
STATIC = Path(gallery_bp.static_folder)
build_assets(app)      # COMMENT OUT FOR GAE DEPLOYMENT 


# Gallery route.
@gallery_bp.route('/gallery', methods=['GET'])
@gallery_bp.route('/gallery/', methods=['GET'])
def gallery():
    """ Set up lists for dominant colour and caption for images to pass into gallery. """
    hsl_file = STATIC / 'hsl_list.npy'
    captions_file = STATIC / 'photo_captions.csv'

    hsl_list = np.load(hsl_file, allow_pickle=True)
    swatches = []
    for row in hsl_list:
        hsl_color = np.ndarray.tolist(row[1])
        swatches.append([row[0], hsl_color])

    captions = {}
    with open(captions_file) as csv_file:
        csv_reader = csv.reader(csv_file, delimiter=",")
        for line in csv_reader:
            captions[line[0]] = line[1]

    return render_template('gallery.html', title="Gallery", swatches=swatches, captions=captions)
