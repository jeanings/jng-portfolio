#----------------------------------------------
# Route for photo diary page.
#----------------------------------------------

from flask import Blueprint, render_template
from flask import current_app as app
from flask import jsonify, request, send_from_directory, session
from bson.json_util import ObjectId
from pathlib import Path
from pymongo import MongoClient
from urllib.parse import quote_plus
from google_auth_oauthlib.flow import Flow
from .tools.mongodb_helpers import (
    create_facet_stage,
    create_projection_stage,
    get_filtered_selectables,
    get_image_counts,
    get_selectables_pipeline,
    build_geojson_collection,
    get_bounding_box
)
import json, pymongo, hashlib, os

DEBUG_MODE = app.config['FLASK_DEBUG']


""" -------------------------
Flask, default routing.
------------------------- """
# Folder paths.
REACT_PATH = Path.cwd() / 'application' / 'static' / 'builds' / 'projects' / 'photo_diary' / 'React'
if REACT_PATH.exists():
    react_abs = REACT_PATH.resolve().as_posix()
    react_static_abs = (REACT_PATH / 'static').resolve().as_posix()
    react_favicon_abs = (REACT_PATH / 'favicon').resolve().as_posix()


# Blueprint config.
photo_diary_bp = Blueprint('photo_diary_bp', __name__,
    static_folder=react_static_abs,
    template_folder=react_abs
)


# Photo diary main route.
@photo_diary_bp.route('/photo-diary', methods=['GET'])
@photo_diary_bp.route('/photo-diary/', methods=['GET'])
def photo_diary():
    return send_from_directory(react_abs, 'photo_diary.html')



""" -------------------------
MongoDB routing.
------------------------- """
# JSON encoder for ObjectId type.
class MongoEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        return super(MongoEncoder, self).default(obj)
app.json_encoder = MongoEncoder


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


# MongoDB data fetch route.
@photo_diary_bp.route('/photo-diary/get-data', methods=['GET'])
def photo_diary_data():
    '''
    MongoDB aggregation pipelines for filter functionality.
    '''
    # Create a state token to prevent request forgery.
    # Store it in the session for later validation.
    # if 'state' not in session:
    #     state = hashlib.sha256(os.urandom(1024)).hexdigest()
    #     session['state'] = state
    
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

        collections_list = db.list_collection_names()
        collections = sorted(collections_list)
        collections.remove('bounds')
        if year == 'default':
            # Set default year to current year on initial renders.
            year = collections[-1]
        
        # Assign collection based on year. 
        collection = db[str(year)]
            
    except pymongo.errors.AutoReconnect:
        print("Reconnecting to database due to connection failure / is lost.")
    except pymongo.errors.OperationFailure:
        print("Database operation error.")

    raw_queries = {
        'month': month, 'format_medium': format_medium, 'format_type': format_type, 'film': film,
        'camera': camera, 'lenses': lenses, 'focal_length': focal_length, 'tags': tags
    }

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

    # Get unique values from fields for selectables to display in filter component.
    # Uses values from images in the whole year.
    filter_selectables = list(collection.aggregate(get_selectables_pipeline()))
    # For month queries, build separate dict.
    if month != None:
        filtered_selectables = get_filtered_selectables(docs)
    else:
        filtered_selectables = []

    # Build geojson collection.
    feature_collection = build_geojson_collection(docs)

    # Calculate bounding box.
    bounding_box = get_bounding_box(docs)

    results = {
        'years': collections,
        'counter': counter,
        'filterSelectables': filter_selectables,
        'filteredSelectables': filtered_selectables,
        'docs': docs,
        'featureCollection': feature_collection,
        'bounds': bounding_box,
    }
        
    response = jsonify(results)

    return response



""" -------------------------
Google OAuth routing.
------------------------- """
# GAE Oauth variables.
GAE_OAUTH_SECRET_FILE = Path.cwd() / 'application' / 'projects' / 'photo_diary' / 'tools' / app.config['GAE_OAUTH_SECRET_JSON']
GAE_OAUTH_CLIENT_ID = app.config['GAE_OAUTH_CLIENT_ID']
GAE_OAUTH_SECRET = app.config['GAE_OAUTH_SECRET']
GAE_OAUTH_REDIRECT_URI = app.config['GAE_OAUTH_REDIRECT_URI']


# Login route to allow for users to edit db entries.
@photo_diary_bp.route('/photo-diary/login', methods=['GET'])
def photo_diary_login():
    '''
    Receives Google OAuth's authorization code from front end,
    exchanging for authorization token with Google's OAuth API.

    Returns cookie with token.
    '''

    auth_code = request.args.get('auth-code')
    # state = session['state']

    # Create authorization flow instance.
    flow = Flow.from_client_secrets_file(
        GAE_OAUTH_SECRET_FILE,
        scopes=[
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile',
            'openid'    
        ],
        # state=state,
        redirect_uri=GAE_OAUTH_REDIRECT_URI
    )

    # access_type 'offline' allows for retrieval of refresh access token,
    # state can mitigate CSRF attacks by validating response,
    # authorization_url, state = flow.authorization_url(
    #     access_type='offline',
    #     state=state
    # )

    # Fetch access token using authorization code obtained from front end.
    # Return value used in credentials, authorized_session().
    flow.fetch_token(code=auth_code)

    # Get credentials.
    # https://google-auth.readthedocs.io/en/stable/reference/google.oauth2.credentials.html#google.oauth2.credentials.Credentials
    credentials = flow.credentials
    session['credentials'] = {
        'token': credentials.token,
        'refresh_token': credentials.refresh_token,
        'scopes': credentials.scopes
    }

    # Get authorized session.
    # https://google-auth.readthedocs.io/en/stable/reference/google.auth.transport.requests.html#google.auth.transport.requests.AuthorizedSession
    authed_session = flow.authorized_session()
    session['authorized'] = authed_session.get('https://www.googleapis.com/userinfo/v2/me').json()

    return jsonify({})


# @photo_diary_bp.route('/photo-diary/logout', methods=['GET'])
# def photo_diary_logout():
#     if 'credentials' in session:
#         del session['credentials']
#     response = {'credentials': 'cleared' }
#     return jsonify(response)

