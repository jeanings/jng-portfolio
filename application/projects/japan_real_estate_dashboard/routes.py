#----------------------------------------------
# Route for Japan real estate dashboard page.
#----------------------------------------------

from flask import Blueprint, render_template
from flask import current_app as app
from flask import jsonify, request, send_from_directory
from .assets import build_assets
from bson.json_util import ObjectId
from pathlib import Path
from pymongo import MongoClient
from urllib.parse import quote_plus
import json, pymongo


# Folder paths.
REACT_PATH = Path.cwd() / 'application' / 'static' / 'builds' / 'projects' / 'japan_real_estate_dashboard' / 'React'
if REACT_PATH.exists():
    react_templates_abs = REACT_PATH.resolve().as_posix()
    react_static_abs = (REACT_PATH / 'static').resolve().as_posix()
    
    
# JSON encoder for ObjectId type.
class MongoEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        return super(MongoEncoder, self).default(obj)
app.json_encoder = MongoEncoder


# Blueprint config.
japan_real_estate_dashboard_bp = Blueprint('japan_real_estate_dashboard_bp', __name__,
    static_url_path='/static',
    static_folder='builds/projects/fudousan_stats/React/static',
    template_folder=react_templates_abs
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


# EN Japan real estate dashboard stats main route.
@japan_real_estate_dashboard_bp.route('/japan-real-estate-dashboard-2010-2020', methods=['GET'])
@japan_real_estate_dashboard_bp.route('/japan-real-estate-dashboard-2010-2020/', methods=['GET'])
def japan_real_estate_dashboard_en():
    return send_from_directory(react_templates_abs, 'japan_real_estate_dashboard_en.html')


# JP Japan real estate dashboard stats main route.
@japan_real_estate_dashboard_bp.route('/fudousan-kakaku-hikaku-2010-2020', methods=['GET'])
@japan_real_estate_dashboard_bp.route('/fudousan-kakaku-hikaku-2010-2020/', methods=['GET'])
def japan_real_estate_dashboard_jp():
    return send_from_directory(react_templates_abs, 'japan_real_estate_dashboard_jp.html')


# Japan real estate dashboard MongoDB get menu data route.
@japan_real_estate_dashboard_bp.route('/japan-real-estate-dashboard-2010-2020/get-menu', methods=['GET'])
def japan_real_estate_dashboard_menu_data():
    try:
        # /get-menu?region=asdf&name=asdf
        language = request.args.get('lang', None)
        country = request.args.get('country', None)
        region = request.args.get('regions', None)
        prefecture = request.args.get('prefectures', None)
        city = request.args.get('cities', None)

        if language == 'en':
            db = client.fudousan_en
        elif language == 'jp':
            db = client.fudousan_jp

        collection_regions = db.geo_hierarchy

    except pymongo.errors.AutoReconnect:
        print("Reconnecting to database due to connection failure / is lost.")
    except pymongo.errors.OperationFailure:
        print("Database operation error.")


    if country:
        # Retrieves every region.
        results = collection_regions.aggregate([
            { '$unwind': 
                '$regions' },
            { '$project': 
                { 'regions._id': 1, 'regions.name': 1 } }
        ])
    elif region:
        # Retrieves every prefecture under requested region.
        results = collection_regions.aggregate([
            { '$unwind': 
                '$prefectures' },
            { '$match': 
                { 'prefectures.partOf': region } },
            { '$group': 
                { '_id': '$prefectures' } },
            { '$sort': 
                { '_id.order': 1 } },
            { '$project': 
                { '_id._id': 1, '_id.name': 1, '_id.order': 1, '_id.partOf': 1 } }
        ])
    elif prefecture:
        # Retrieves every city under requested prefecture.
        results = collection_regions.aggregate([
            { '$unwind': 
                '$cities' },
            { '$match': 
                { 'cities.partOf': prefecture } },
            { '$group': 
                { '_id': '$cities' } },
            { '$sort': 
                { '_id.count': -1 } },
            { '$project': 
                { '_id._id': 1, '_id.name': 1, '_id.count': 1, '_id.partOf': 1 } }
        ])
    elif city:
        # Retrieves every district under requested city.
        results = collection_regions.aggregate([
            { '$unwind': 
                '$districts' },
            { '$match': 
                { 'districts.partOf': city } },
            { '$group': 
                { '_id': '$districts' } },
            { '$sort': 
                { '_id.count': -1 } },
            { '$project': 
                { '_id._id': 1, '_id.name': 1, '_id.count': 1, '_id.partOf': 1 } }
        ])

    response = jsonify(list(results))

    return response


# Japan real estate dashboard MongoDB get sales data route.
@japan_real_estate_dashboard_bp.route('/japan-real-estate-dashboard-2010-2020/get-data', methods=['GET'])
def japan_real_estate_dashboard_price_data():
    try:
        # /get-data?collection=1980_1990&options=stFrame-100_150
        language = request.args.get('lang', None);
        collection = request.args.get('collection', None)
        options = request.args.get('options', None)

        if language == 'en':
            db = client.fudousan_en
        elif language == 'jp':
            db = client.fudousan_jp

        collection_data = db[collection]

    except pymongo.errors.AutoReconnect:
        print("Reconnecting to database due to connection failure / is lost.")
    except pymongo.errors.OperationFailure:
        print("Database operation error.")

    # Retrieves entire regions tree under parameters provided in options.
    results = collection_data.aggregate([
        { '$match': 
            { options : 
                { '$type': 'object' } } }, 
        { '$project': 
            { 'regions': '$' + options + '.regions' } }
    ])

    response = jsonify(list(results))

    return response