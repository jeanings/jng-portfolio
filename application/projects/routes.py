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
from .tools.colour_sets import main_colours, sub_colours 

DEBUG_MODE = app.config['FLASK_DEBUG']


# Blueprint config.
projects_bp = Blueprint('projects_bp', __name__, 
                        static_folder='static', 
                        template_folder='templates')
if DEBUG_MODE == 'True':
    build_assets(app)


# Login variables.
load_dotenv(Path.cwd() / '.env')
MONGODB_ID = environ.get('MONGODB_ID')
MONGODB_KEY = environ.get('MONGODB_KEY')
MDB_PASS = quote_plus(MONGODB_KEY)


# Connection to mongo server.
client = MongoClient(f'mongodb+srv://{MONGODB_ID}:{MDB_PASS}@portfolio.8frim.mongodb.net/fudousan?retryWrites=true&w=majority')
db = client.projectsIndex
collection_main = db['main']
collection_sub = db['sub']


# Projects route.
@projects_bp.route("/projects", methods=['GET'])
def projects():
    main_projects = []
    sub_projects = []

    for main_project in collection_main.find():
        main_projects.append(main_project)

    for sub_project in collection_sub.find():
        sub_projects.append(sub_project) 

    return render_template("projects.html", 
        title="Some personal projects / jeanings.space",
        main_projects=main_projects,
        sub_projects=sub_projects,
        main_colours=main_colours['mainColours'],
        sub_colours=sub_colours['subColours']
    )
