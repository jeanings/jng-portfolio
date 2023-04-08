#----------------------------------------------
# Route for photo diary page.
#----------------------------------------------

from flask import Blueprint
from flask import current_app as app
from flask import (
    jsonify, 
    make_response, 
    request, 
    send_from_directory, 
    session
)
from bson.json_util import ObjectId
from datetime import (
    datetime,
    timedelta,
    timezone
)
from pathlib import Path
from pymongo import MongoClient, UpdateMany
from urllib.parse import quote_plus
from google_auth_oauthlib.flow import Flow
from .tools.mongodb_helpers import (
    create_match_stage,
    create_facet_stage,
    create_projection_stage,
    get_filtered_selectables,
    get_image_counts,
    get_selectables_pipeline,
    build_geojson_collection,
    get_bounding_box
)
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    create_refresh_token,
    get_jwt_identity,
    get_jwt,
    jwt_required,
    set_access_cookies,
    set_refresh_cookies,
    unset_jwt_cookies
)
import json, pymongo, hashlib, os

DEBUG_MODE = app.config['FLASK_DEBUG']
# Set up Flask-JWT-extended instance.
token_expiry_minutes = 30
app.config["JWT_COOKIE_SECURE"] = False
app.config['JWT_TOKEN_LOCATION'] = ['headers', 'cookies']
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(minutes=token_expiry_minutes)
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(minutes=token_expiry_minutes)
# app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(days=1)
jwt = JWTManager(app)



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
    # Get session cookies from request.
    state = request.cookies.get('state')
    user = request.cookies.get('user')

    # Create a state token to prevent request forgery.
    # Store it in the session for later validation.
    if not state:
        state = hashlib.sha256(os.urandom(1024)).hexdigest()
    if not user:
        user = 'visitor'

    session['state'] = state
    session['user'] = user
    print(session['user'])
    # Handle request query.
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

        # Retrieve admin's collection if user is visitor.
        if session['user'] == 'visitor' or session['user'] == 'unauthorized':
            user_profile = db['accounts'].find_one({'role': 'admin'})
        else:
            user_profile = db['accounts'].find_one({'email': session['user']['email']})

        collections = sorted(user_profile['collections'])
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
        docs = list(collection.find({'owner': user_profile['_id']}))
    else:
        # For other queries.
        match_stage = create_match_stage(user_profile['_id'])
        facet_stage = create_facet_stage(queries, query_field)
        projection_stage = create_projection_stage(facet_stage)

        # Query for the group of filters requested.
        filtered_query = collection.aggregate([match_stage, facet_stage, projection_stage])
        docs = list(filtered_query)[0]['intersect']

    # Get image counts for each month.
    counter = get_image_counts(docs)

    # Get unique values from each field for displaying in filter component buttons.
    # Uses data from images for the whole year.
    filter_selectables = list(collection.aggregate(get_selectables_pipeline(user_profile['_id'])))
    # For month queries, build separate dict.
    if month:
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
        
    # Convert results to JSON, add cookies to track session.
    response = jsonify(results)
    
    # Session state cookie, not read into front end.
    max_age_sec = 60 * token_expiry_minutes
    response.set_cookie(
        'state', 
        session['state'],
        secure=True,
        httponly=True,
        samesite='Lax',
        max_age=max_age_sec
    )
    
    # Session user cookie.
    response.set_cookie(
        'user', 
        session['user'],
        secure=True,
        httponly=False,
        samesite='Lax',
        max_age=max_age_sec
    )
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

    Returns cookie with JWT token and JSON of authorized user profile.
    '''
    auth_code = request.args.get('auth-code')

    # Get session state cookie from request.
    session['state'] = request.cookies.get('state')

    # Create authorization flow instance.
    flow = Flow.from_client_secrets_file(
        GAE_OAUTH_SECRET_FILE,
        scopes=[
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile',
            'openid'    
        ],
        state=session['state'],
        redirect_uri=GAE_OAUTH_REDIRECT_URI
    )

    # Fetch access token using authorization code obtained from front end.
    # Return value used in credentials, authorized_session().
    flow.fetch_token(code=auth_code)

    try: 
        # Get credentials.
        # https://google-auth.readthedocs.io/en/stable/reference/google.oauth2.credentials.html#google.oauth2.credentials.Credentials
        credentials = flow.credentials
        session['credentials'] = {
            'token': credentials.token,
            'refresh_token': credentials.refresh_token,
            'scopes': credentials.scopes
        }
    except ValueError:
        response = jsonify({'user': 'unauthorized'})
        return response

    # Get authorized session.
    # https://google-auth.readthedocs.io/en/stable/reference/google.auth.transport.requests.html#google.auth.transport.requests.AuthorizedSession
    authed_session = flow.authorized_session()
    session['authorized'] = authed_session.get('https://www.googleapis.com/userinfo/v2/me').json()
    session['user'] = {
        'name': session['authorized']['name'],
        'email': session['authorized']['email'],
        'profilePic': session['authorized']['picture']
    }

    # Assign role to enable permissions-based operations.
    account = db['accounts'].find_one({'email': session['user']['email']})
    if account:
        session['user']['role'] = account['role']
    else:
        session['user']['role'] = 'viewer'

    # Create base response with authorized profile.
    response = jsonify({'user': session['user']})
 
    # User profile cookie.
    max_age_sec = 60 * token_expiry_minutes
    response.set_cookie(
        'user', 
        json.dumps(session['user']),
        secure=True,
        httponly=False,
        samesite='Lax',
        max_age=max_age_sec
    )

    # Create JWT token for validation.
    jwt_additional_claims = {
        'state': session['state']
    }

    jwt_access_token = create_access_token(
        identity=session['user'], 
        additional_claims=jwt_additional_claims,
        fresh=True              # for JWT routes requiring fresh tokens --> @jwt_required(fresh=True)
        # expires_delta=None    # uses default app.config value
    )

    # jwt_refresh_token = create_refresh_token(
    #     identity=session['user'], 
    #     additional_claims=jwt_additional_claims,
    #     # expires_delta         # uses default app.config value
    # )

    # Set JWT-containing cookie, along with X-CSRF token.
    # Routes requiring login (@jwt-required) will need 'X-CSRF-TOKEN' in headers.
    set_access_cookies(response, jwt_access_token)
    # set_refresh_cookies(response, jwt_refresh_token)

    return response


# Logout route to revoke access for access token.
@photo_diary_bp.route('/photo-diary/logout', methods=['POST'])
def photo_diary_logout():    
    response = jsonify({'user': 'logout'})
    unset_jwt_cookies(response)
    return response


# Update route for editing doc's metadata.
@photo_diary_bp.route('/photo-diary/update', methods=['PATCH'])
@jwt_required()
def photo_diary_update():
    '''
    Update requests handling only if JWT access token is verified.
    Returns response status, its message, and the updated doc.
    '''
    update_request = request.get_json()
    # Get doc properties from request.
    try:
        doc_id = ObjectId(update_request['id'])
        doc_collection = update_request['collection']
        fields_to_update = update_request['fields']
    except KeyError:
        return jsonify({'updateStatus': 'Error: JSON formatted incorrectly, missing required keys.'})
    
    # Locate requested doc in database.
    collection = db[str(doc_collection)]
    doc = collection.find({'_id': doc_id})
    if (len(list(doc)) == 0):
        return jsonify({'updateStatus': ('Error: {0} not found in {1} collection.', doc_id, doc_collection)})
    
    # Parse request into correct fields and values for database.  
    fields = {}
    skipped_flag = False
    for key, val in fields_to_update.items():
        if val:
            if key == 'Date':
                try:
                    year = month = day = time = None
                    date_time = val.split(' ', 1)
                    yyyy_mm_dd = date_time[0]
                    if len(date_time) == 2:
                        yyyy_mm_dd, time = date_time
                    yyyy_mm_dd = yyyy_mm_dd.split('/')
                    if len(yyyy_mm_dd) == 3:
                        year, month, day = [int(segment) for segment in yyyy_mm_dd]
                    elif len(yyyy_mm_dd) == 2:
                        year, month = [int(segment) for segment in yyyy_mm_dd]
                    else:
                        year = int(yyyy_mm_dd)
                    date = {
                        'year': year, 
                        'month': month, 
                        'day': day, 
                        'time': time
                    }
                    fields.update({
                        'date': date
                    })
                except:
                    # Date not in correct format, skip.
                    skipped_flag = True
            elif key == 'FocalLength':
                # Strip units and keep only digits.
                focal_length = [char for char in val if char.isdigit()]
                if len(focal_length) == 0:
                    # Focal length in '50mm' format, skip.
                    skipped_flag = True
                    pass
                else:
                    focal_length_35mm = int(''.join(focal_length[:]))
                    fields.update({
                        'focal_length_35mm': focal_length_35mm
                    })
            elif key == 'Format':
                try:
                    # Split into photo medium and medium type.
                    format_mediums = ['digital', 'film']
                    format_medium = format_type = ''
                    formats = [category.lower() for category in val.split(' ')]
                    for category in formats:
                        if category in format_mediums:
                            format_medium = category
                        else: 
                            format_type = category
                    fields.update({
                        'format': {
                            'medium': format_medium, 
                            'type': format_type
                        }
                    })
                except ValueError:
                    # Format not in 'Medium Type' format, skip.
                    skipped_flag = True
            elif key == 'Camera':
                try:
                    make, model = val.split(' ', 1)
                    fields.update({
                        'make': make, 
                        'model': model
                    })
                except ValueError:
                    # Camera in 'Make Model' format, skip.
                    skipped_flag = True
            elif key == 'ISO':
                try:
                    iso = int(val)
                    fields.update({
                        'iso': iso
                    })
                except ValueError:
                    # Not number, skip.
                    skipped_flag = True
            elif key == 'Tags': 
                tags = [tag.strip().lower() for tag in val.split(',')]
                fields.update({
                    'tags': tags
                })
            elif key == 'Coordinates':
                try:
                    coords = [float(coord.strip()) for coord in val.split(',')]
                    lat, lng = coords[0], coords[1]
                    lat_ref, lng_ref = 'N', 'E'
                    if lat < 0:
                        lat_ref = 'S'
                    if lng < 0:
                        lng_ref = 'W'
                    if lat < -90 or lat > 90:
                        lat = None
                    if lng < -180 or lng > 180:
                        lng = None
                    gps = {
                        'lat': lat, 
                        'lat_ref': lat_ref, 
                        'lng': lng, 
                        'lng_ref': lng_ref
                    }
                    fields.update({
                        'gps': gps
                    })
                except ValueError:
                    # Not numbers, skip.
                    skipped_flag = True
            else:
                try:
                    # Convert to int when possible, database value type.
                    val = int(val)
                except ValueError:
                    # Keep value as is.
                    pass
                fields.update({
                    key.lower(): val
                })
    
    # Update document with parsed fields.
    collection.update_one(
        {'_id': doc_id}, 
        {'$set': fields}
    )

    updated_doc = list(collection.find({'_id': doc_id}))[0]
    update_status = "successful"
    update_message = "All edits OK!"
    if (skipped_flag is True):
        update_status = "passed with error"
        update_message = "Some edit(s) in wrong format."

    response = jsonify({
        'updateStatus': update_status, 
        'updatedDoc': updated_doc,
        'updateMessage': update_message 
    })
    return response


# Checks for expiring token and refreshes them.
@photo_diary_bp.after_request
def auto_refresh_expiring_jwt(response):
    cookies = response.headers.getlist('Set-Cookie')

    # No logged user, return original response.
    if ('user=visitor' or 'user=unauthorized') in cookies:
        return response
    
    # Logged user, check if access token requires refreshing.
    check_interval_minutes = token_expiry_minutes / 2
    try:
        # Compare timestamps for passive token refresh.
        expiry_timestamp = get_jwt()['exp']
        current_timestamp = datetime.now(timezone.utc)
        new_timestamp = datetime.timestamp(current_timestamp + timedelta(minutes=(check_interval_minutes)))
        should_refresh_access_token = new_timestamp > expiry_timestamp

        if should_refresh_access_token:
            # Get refreshed JWT token.
            session_user = get_jwt_identity()
            refreshed_jwt_access_token = create_access_token(identity=session_user, fresh=True)
            set_access_cookies(response, refreshed_jwt_access_token)
        return response

    except (RuntimeError, KeyError):
        # Return original response if not within refresh interval.
        # Notify front end that session is now unauthorized.
        response.set_cookie(
            'user',
            'unauthorized',
            secure=True,
            httponly=False,
            samesite='Lax'
        )
        return response
       