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
import json

DEBUG_MODE = app.config['FLASK_DEBUG']
CV_LETTER_JSON = Path.cwd() / 'application' / 'resume' / 'tools' / 'cv_letter.json'


# Blueprint config.
resume_bp = Blueprint('resume_bp', __name__, 
    static_folder='static', 
    template_folder='templates'
)

if DEBUG_MODE == True:
    build_assets(app)


# Login variables.
load_dotenv(Path.cwd() / '.env')
MONGODB_ID = environ.get('MONGODB_ID')
MONGODB_KEY = environ.get('MONGODB_KEY')
MDB_PASS = quote_plus(MONGODB_KEY)


# Connection to mongo server.
client = MongoClient(f'mongodb+srv://{MONGODB_ID}:{MDB_PASS}@portfolio.8frim.mongodb.net/')
db = client.resume
collection = db['web']


# Resume route.
@resume_bp.route('/resume', methods=['GET'])
@resume_bp.route('/resume/', methods=['GET'])
def resume():
    selected_projects, skills, education, experience = {}, {}, {}, {}

    for section in collection.find():
        for key in section.keys():
            if key == 'contact': 
                contact = section[key]
            elif key == 'selectedProjects':
                selected_projects = section[key]
            elif key == 'skills':
                skills = section[key]
            elif key == 'education':
                education = section[key]
            elif key == 'experience':
                experience = section[key]


    return render_template('resume.html', 
        title="Résumé  ——  jeanings.space",
        contact=contact,
        selected_projects=selected_projects,
        skills=skills,
        education=education,
        experience=experience
    )


# Cover letter template route.
@resume_bp.route('/resume/cover-letter-template', methods=['GET'])
@resume_bp.route('/resume/cover-letter-template/', methods=['GET'])
def coverletter():
    cv_letter = {}

    with open(CV_LETTER_JSON, encoding='utf-8') as json_file:
        data = json.load(json_file)
        cv_letter = data
         

    return render_template('letter.html', 
        title="Cover letter template ——  jeanings.space",
        block=cv_letter["block"],
        body=cv_letter["body"]
    )
