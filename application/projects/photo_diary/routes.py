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
from .tools.create_pipeline import create_pipeline
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
    client = MongoClient(f'mongodb+srv://{MONGODB_ID}:{MDB_PASS}@portfolio.8frim.mongodb.net/')
    db = client.photo_diary
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
        year = request.args.get('year', None)
        month = request.args.get('month', None)
        format_medium = request.args.get('format-medium', None)     # digital, film
        format_type = request.args.get('format-type', None)         # 35mm, APS-C
        camera = request.args.get('camera', None)
        focal_length = request.args.get('focal-length', None)       # wide, standard, long
        aperture = request.args.get('aperture', None)
        tags = request.args.get('tags', None)

        
        '''
            Work in progress ------------------------------
        '''

    except pymongo.errors.AutoReconnect:
        print("Reconnecting to database due to connection failure / is lost.")
    except pymongo.errors.OperationFailure:
        print("Database operation error.")

    
    if year:
        collection = db[str(year)]
        year_count = collection.find({}).count_documents


    # todo parse argument strings into list (except for year and month)

        
    raw_queries = {
        'month': month, 'format_medium': format_medium, 'format_type': format_type, 
        'camera': camera, 'focal_length': focal_length, 'aperture': aperture, 'tags': tags
    }

    queries = {key: val for key, val in raw_queries.items() if val}
    query_field = {
        'month': 'date.month',
        'format_medium': 'format.medium',
        'format_type': 'format.type',
        'camera': 'model',
        'focal_length': 'focal_length_35mm',
        'aperture': 'aperture',
        'tags': 'tags'
    }

    
    # Build facet stage.
    facet_stage = {
        '$facet': {}
    }

    for keyword, request in queries.items():
        key = 'get_' + query_field[keyword]
        facet_stage['$facet'].update({
            key: create_pipeline(request, query_field[keyword])
        })


    # Build projection stage.
    projection_stage = {
        "$project": {
            "intersect": {
                "$setIntersection": []
            }
        }
    }

    for facet in facet_stage['$facet'].keys():
        projection_stage['$project']['intersect']['$setIntersection'].append(
            '$' + facet
        )
    
    
    # Query for the group of filters requested.
    collection.aggregate([facet_stage, projection_stage])

   
    results = 'WIP'
    response = jsonify(list(results))

    return response
