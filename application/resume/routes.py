#------------------------------------------
# Route for resume page.
#------------------------------------------

from flask import Blueprint, render_template
from flask import current_app as app
from .assets import build_assets
from os import environ
from pathlib import Path
from dotenv import load_dotenv
from pymongo import MongoClient
from urllib.parse import quote_plus

DEBUG_MODE = app.config['FLASK_DEBUG']


# Blueprint config.
resume_bp = Blueprint('resume_bp', __name__, 
    static_folder='static', 
    template_folder='templates'
)

if DEBUG_MODE == 'True':
    build_assets(app)


# Login variables.
load_dotenv(Path.cwd() / '.env')
MONGODB_ID = environ.get('MONGODB_ID')
MONGODB_KEY = environ.get('MONGODB_KEY')
MDB_PASS = quote_plus(MONGODB_KEY)


# Connection to mongo server.
client = MongoClient(f'mongodb+srv://{MONGODB_ID}:{MDB_PASS}@portfolio.8frim.mongodb.net/fudousan?retryWrites=true&w=majority')
db = client.resume
collection = db['2021']


# Projects route.
@resume_bp.route('/resume', methods=['GET'])
@resume_bp.route('/resume/', methods=['GET'])
def resume():
    cv = []
    proj, edu, exp, info = {}, {}, {}, {}

    for section in collection.find():
        cv.append(section)
        for key in section.keys():
            if key == 'selectedProject':
                proj = section[key]
            elif key == 'education':
                edu = section[key]
            elif key == 'experience':
                exp = section[key]
            elif key == 'additionalInfo':
                info = section[key]


    return render_template('resume.html', 
        title="Résumé  ——  jeanings.space",
        cv=cv,
        proj=proj,
        edu=edu,
        exp=exp,
        info=info
    )
