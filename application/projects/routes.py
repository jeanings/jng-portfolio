#------------------------------------------
# Route for projects page.
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
projects_bp = Blueprint('projects_bp', __name__, 
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
db = client.projectsIndex
collection = db['main']


# Projects route.
@projects_bp.route("/projects", methods=['GET'])
@projects_bp.route("/projects/", methods=['GET'])
def projects():
    # Get project docs in reverse chronological order.
    docs = list(collection.find({}))
    projects = sorted(docs, key=lambda doc: doc['project_id'], reverse=True)

    return render_template("projects.html", 
        title="Some personal projects  ——  jeanings.space",
        projects=projects
    )
