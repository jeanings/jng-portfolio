#------------------------------------------
# Route for gallery page.
#------------------------------------------

from flask import Blueprint, render_template
from flask import current_app as app
from .assets import build_assets
from pathlib import Path
import numpy as np
import csv

DEBUG_MODE = app.config['FLASK_DEBUG']
FILE_HSL = Path.cwd() / 'application' / 'projects' / 'gallery' / 'tools' / 'hsl_list.npy'
FILE_CAPTIONS = Path.cwd() / 'application' / 'projects' / 'gallery' / 'tools' / 'photo_captions.csv'


# Blueprint config.
gallery_bp = Blueprint('gallery_bp', __name__, 
    static_folder='static', 
    template_folder='templates'
)

if DEBUG_MODE == 'True':
    build_assets(app)


# Gallery route.
@gallery_bp.route('/gallery', methods=['GET'])
@gallery_bp.route('/gallery/', methods=['GET'])
def gallery():
    """ 
    Set up lists for dominant colour and caption for images to pass into gallery.
    """
    
    hsl_list = np.load(FILE_HSL, allow_pickle=True)

    swatches = []
    for row in hsl_list:
        hsl_color = np.ndarray.tolist(row[1])
        swatches.append([row[0], hsl_color])

    captions = {}
    with open(FILE_CAPTIONS) as csv_file:
        csv_reader = csv.reader(csv_file, delimiter=",")
        for line in csv_reader:
            captions[line[0]] = line[1]

    return render_template('gallery.html', 
        title="Gallery  ——  jeanings.space", 
        swatches=swatches, 
        captions=captions
    )
