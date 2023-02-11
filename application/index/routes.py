#------------------------------------------
# Route for index page.
#------------------------------------------

from flask import Blueprint, render_template, url_for
from flask import current_app as app
from .assets import build_assets
from os import environ
from pathlib import Path
from dotenv import load_dotenv
from pymongo import MongoClient
from urllib.parse import quote_plus

DEBUG_MODE = app.config['FLASK_DEBUG']


# Blueprint config.
index_bp = Blueprint('index_bp', __name__,
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


# Index route.
@index_bp.route('/', methods=['GET'])
def index():
    # Get latest project.
    docs = list(collection.find({}))
    projects = sorted(docs, key=lambda doc: doc['project_id'], reverse=True)

    return render_template('index.html', 
        title="Some personal site on the web  ——  jeanings.space",
        latest_project=projects[0]
    )
