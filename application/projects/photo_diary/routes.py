#----------------------------------------------
# Route for photo diary page.
#----------------------------------------------

from flask import Blueprint, render_template
from flask import current_app as app
from flask import jsonify, request, send_from_directory
from bson.json_util import ObjectId
from pathlib import Path
from pymongo import MongoClient
from urllib.parse import quote_plus
import json, pymongo

DEBUG_MODE = app.config['FLASK_DEBUG']


# Folder paths.
REACT_PATH = Path.cwd() / 'application' / 'static' / 'builds' / 'projects' / 'photo_diary' / 'React'
if REACT_PATH.exists():
    react_abs = REACT_PATH.resolve().as_posix()
    react_static_abs = (REACT_PATH / 'static').resolve().as_posix()
    react_favicon_abs = (REACT_PATH / 'favicon').resolve().as_posix()
    
    
# JSON encoder for ObjectId type.
class MongoEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        return super(MongoEncoder, self).default(obj)
app.json_encoder = MongoEncoder


# Blueprint config.
photo_diary_bp = Blueprint('photo_diary_bp', __name__,
    static_folder=react_static_abs,
    template_folder=react_abs
)


# MongoDB login variables.
MONGODB_ID = app.config['MONGODB_ID']
MONGODB_KEY = app.config['MONGODB_KEY']
MDB_PASS = quote_plus(MONGODB_KEY)


# MongoDB connection.
try:
    client = MongoClient(f'mongodb+srv://{MONGODB_ID}:{MDB_PASS}@portfolio.8frim.mongodb.net/fudousan?retryWrites=true&w=majority')    
except pymongo.errors.AutoReconnect:
    print("Reconnecting to database due to connection failure / is lost.")
except pymongo.errors.OperationFailure:
    print("Database operation error.")


# Photo diary main route.
@photo_diary_bp.route('/photo-diary', methods=['GET'])
@photo_diary_bp.route('/photo-diary/', methods=['GET'])
def photo_diary():
    return send_from_directory(react_abs, 'photo_diary.html')


# MongoDB route.
@photo_diary_bp.route('/photo-diary/get-data', methods=['GET'])
def photo_diary_data():
    try:
        db = client.photo_diary
        # collection_regions = db.photo_data
    
    '''
        Work in progress ------------------------------
    '''

    except pymongo.errors.AutoReconnect:
        print("Reconnecting to database due to connection failure / is lost.")
    except pymongo.errors.OperationFailure:
        print("Database operation error.")

    # results = 0

    response = jsonify(list(results))

    return response
