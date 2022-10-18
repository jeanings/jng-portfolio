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
from .tools.mongodb_helpers import create_facet_stage, create_projection_stage, get_selectables_pipeline, get_image_counts
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
        year = request.args.get('year')
        month = request.args.get('month')
        format_medium = request.args.get('format-medium')
        format_type = request.args.get('format-type')
        film = request.args.get('film')
        camera = request.args.get('camera')
        lenses = request.args.get('lenses')
        focal_length = request.args.get('focal-length')
        tags = request.args.get('tags')

        collections = sorted(db.list_collection_names())
        if year == 'default':
            # Set collection to current year on initial renders.
            collection = db[collections[-1]]
        elif year:
            collection = db[str(year)]

    except pymongo.errors.AutoReconnect:
        print("Reconnecting to database due to connection failure / is lost.")
    except pymongo.errors.OperationFailure:
        print("Database operation error.")

    raw_queries = {
        'month': month, 'format_medium': format_medium, 'format_type': format_type, 'film': film,
        'camera': camera, 'lenses': lenses, 'focal_length': focal_length, 'tags': tags
    }
    print(raw_queries)
    # Parse queries: month as is, the rest into lists.  
    queries = {}
    whitespaced_keywords = ['camera', 'film', 'lenses', 'tags']

    for key, val in raw_queries.items():
        
        if val:
            if key == 'month':
                queries.update({key: int(val)})
            elif key == 'focal_length':
                query = [int(foc_len) for foc_len in val.split('+')]
                queries.update({key: query})
            elif key in whitespaced_keywords:
                query = [item.replace('_', ' ') for item in val.split('+')]
                queries.update({key: query})
            else:
                queries.update({key: val.split('+')})

    query_field = {
        'month': 'date.month',
        'format_medium': 'format.medium',
        'format_type': 'format.type',
        'film': 'film',
        'camera': 'model',
        'lens': 'lens',
        'focal_length': 'focal_length_35mm',
        'tags': 'tags'
    }

    # Get unique values from fields for selectables to display in filter component.
    # Uses values from images in the whole year.
    filter_selectables = list(collection.aggregate(get_selectables_pipeline()))
    
    # Query MongoDB.
    if len(queries) == 0:
        # For query with just 'year'.
        docs = list(collection.find({}))
    else:
        # For other queries.
        facet_stage = create_facet_stage(queries, query_field)
        projection_stage = create_projection_stage(facet_stage)

        # Query for the group of filters requested.
        filtered_query = collection.aggregate([facet_stage, projection_stage])
        docs = list(filtered_query)[0]['intersect']

    # Get image counts for each month.
    counter = get_image_counts(docs)

    results = {
        'years': collections,
        'counter': counter,
        'filterSelectables': filter_selectables,
        'docs': docs
    }
        
    response = jsonify(results)

    return response
