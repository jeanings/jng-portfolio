#--------------------------------------------------------------------------------------------
# Script for creating and updating MongoDB docs for uploaded images on Google Cloud Storage.
#--------------------------------------------------------------------------------------------

from os import environ
from dotenv import load_dotenv
from pathlib import Path
from datetime import datetime
from urllib.parse import quote_plus
from decimal import *
from PIL import Image, ExifTags
from gps_unit_conversion import dms_to_deci_deg
from image_metadata import Metadata
from bson.json_util import ObjectId
from pymongo import MongoClient
from google.oauth2 import service_account
from google.cloud import storage
import json, pymongo, re

PROJ_FOLDER = Path.cwd() / 'application' / 'projects' / 'photo_diary'
IMG_FOLDER =  PROJ_FOLDER / 'images'

# Login variables/credentials.
load_dotenv(Path.cwd() / '.env')
MONGODB_ID = environ.get('MONGODB_ID')
MONGODB_KEY = environ.get('MONGODB_KEY')
MDB_PASS = quote_plus(MONGODB_KEY)
GOOGLE_APPLICATION_CREDENTIALS = PROJ_FOLDER / 'tools' / 'portfolio-sa-key.json'


# Instantiates a Google Storage client
credentials = service_account.Credentials.from_service_account_file(GOOGLE_APPLICATION_CREDENTIALS)
storage_client = storage.Client(credentials=credentials)

# Connection to mongo server.
try:
    client = MongoClient(f'mongodb+srv://{MONGODB_ID}:{MDB_PASS}@portfolio.8frim.mongodb.net/')    
except pymongo.errors.AutoReconnect:
    print("Reconnecting to database due to connection failure.")
except pymongo.errors.OperationFailure:
    print("Database operation error.")
db = client.photo_diary # or client['database_name']


            
def list_blobs_with_prefix(bucket_name, prefix):
    """
    Gets list of blobs in a bucket.
    https://cloud.google.com/storage/docs/listing-objects#storage-list-objects-python
    """

    # Organize prefixes by folder year.
    folders_request = storage_client.list_blobs(bucket_name, prefix=prefix, delimiter='/')
    folders = {}

    # Consume iterator to get prefixes.
    for _ in folders_request:
        pass
    
    folder_prefixes = folders_request.prefixes
    for item in folder_prefixes:
        year = item.strip(prefix)
        folders[year] = item

    # Get image blobs.
    blobs= {}
    image_extensions = ['.jpg', '.jpeg', '.png', '.tiff']
    for year in folders:
        blobs[year] = {}
        prefix = folders[year]
        blobs_request = storage_client.list_blobs(bucket_name, prefix=prefix, delimiter=None)

        for blob in blobs_request:
            if any(ext in blob.public_url[-5:] for ext in image_extensions):
                blobs[year][blob.name] = blob.public_url
            else:
                continue

    return blobs


def check_blobs_and_docs(images_blob):
    """
    Check MongoDB docs count against GCS blobs to get list of files to update.
    """

    image_blobs_to_update = {}

    print(">>> Comparing images on cloud to database entries...")
    for item in images_blob.items():
        year = item[0]
        collection = db[year]
        blobs = item[1]

        # Get image counts. 
        blob_count = len(blobs)
        collection_count = collection.count_documents({})   # queries all docs
        
        collection_images = list(collection.find({}, {'url': 1, '_id': 0}))
        collection_url_list = [doc['url'] for doc in collection_images]
        
        if blob_count != collection_count:
            # Get blobs that are missing in collection.
            for blob in images_blob[year].items():
                image_url = blob[1]
                    
                if image_url not in collection_url_list:
                    # Add to update dict.
                    image_blobs_to_update.setdefault(year, {})
                    image_blobs_to_update[year].update({blob[0]: blob[1]})

    return image_blobs_to_update


def find_metadata_in_tags(raw_tags):
    """
    Search in tags for embedded metadata (manually added to film scans).
    """

    keywords = ['date', 'camera', 'lens', 'iso', 'film']

    metadata_from_tags = {keyword: tag.strip(keyword).strip() for tag in raw_tags for keyword in keywords if keyword in tag}

    return metadata_from_tags


def strip_metadata_in_tags(raw_tags):
    """
    Search in tags for embedded metadata (manually added to film scans)
    and return array excluding it.  For film scans.
    """

    keywords = ['date', 'camera', 'lens', 'iso', 'film', 'roll']
    cleaned_tags = []

    for tag in raw_tags:
        if any([keyword in tag for keyword in keywords]):
            continue
        else:
            cleaned_tags.append(tag)

    return cleaned_tags


def get_metadata(image, cameras_dict, image_url):
    """
    Extract and build dict of image metadata of interest.
    """
    # Decimal precision.
    getcontext().prec = 15

    # Get metadata.
    pil_image = Image.open(image)
    exif_data = {ExifTags.TAGS[key]: val for key, val in pil_image._getexif().items() if key in ExifTags.TAGS}
    xmp_string = pil_image.app['APP1'].decode('utf-8')
    xmp_raw_string = repr(xmp_string)
    metadata = Metadata()

    # Narrow regex to portion of xmp where tags are.
    pattern_filter_tags = re.compile(r"<rdf:Bag>(.{0,}?)</rdf:Bag>") #<rdf:Bag>(.*?)</rdf:Bag>
    regex_filter_tags = re.findall(pattern_filter_tags, xmp_raw_string)
    # Isolate for tags.
    pattern_refine = re.compile(r"<rdf:li>(.{0,}?)</rdf:li>")
    raw_tags = re.findall(pattern_refine, regex_filter_tags[0])

    # Get metadata for film scans.
    film_metadata = find_metadata_in_tags(raw_tags)

    # Base file info.
    metadata.filename = image.name
    metadata.local_path = str(image)

    # ---------------------------------------- 
    # ---------- For digital images ----------
    # ----------------------------------------
    if len(film_metadata) == 0:
        # Date data.
        metadata.date['taken'] = exif_data['DateTimeOriginal']
        dt = datetime.strptime(metadata.date['taken'], "%Y:%m:%d %H:%M:%S")
        metadata.date['year'] = int(dt.year)
        metadata.date['month'] = int(dt.month)
        metadata.date['day'] = int(dt.day)
        metadata.date['time'] = ':'.join([str(dt.hour), str(dt.minute), str(dt.second)])

        # Camera/lens data.
        metadata.make = exif_data['Make'].strip()
        metadata.model = exif_data['Model'].strip()
        
        if metadata.model == 'DMC-LX7':
            metadata.get_lens()
            metadata.model = 'Lumix DMC-LX7'
        
        metadata.focal_Length_35mm = int(exif_data['FocalLengthIn35mmFilm'])
        metadata.get_format(cameras_dict)

        # Exposure settings.
        metadata.iso = int(exif_data['ISOSpeedRatings'])
        metadata.aperture = float(exif_data['FNumber'])
        metadata.shutter_speed = [exif_data['ExposureTime'].numerator, exif_data['ExposureTime'].denominator]

        # GPS coordinates.
        metadata.gps['lat_ref'] = exif_data['GPSInfo'][1]
        if metadata.gps['lat_ref'] == 'N':
            metadata.gps['lat'] = str(dms_to_deci_deg(exif_data['GPSInfo'][2]))
        else:
            metadata.gps['lat'] = str(dms_to_deci_deg(exif_data['GPSInfo'][2]) * Decimal(-1.0))

        metadata.gps['lng_ref'] = exif_data['GPSInfo'][3]
        if metadata.gps['lng_ref'] == 'E':
            metadata.gps['lng'] = str(dms_to_deci_deg(exif_data['GPSInfo'][4]))
        else:
            metadata.gps['lng'] = str(dms_to_deci_deg(exif_data['GPSInfo'][4]) * Decimal(-1.0))
        
        # URL for uploaded image.
        metadata.url = image_url
        metadata.url_thumb = image_url.replace('images', 'thumbs')

        # Tags.
        metadata.tags = raw_tags

    # ------------------------------------
    # ---------- For film scans ----------
    # ------------------------------------
    else:
        # Date data.
        date_year_month = film_metadata['date'].split('-')
        metadata.date['year'] = int(date_year_month[0])
        metadata.date['month'] = int(date_year_month[1])

        # Camera/lens data.
        camera = film_metadata['camera'].split(' ')
        metadata.make = camera[0]
        metadata.model = ' '.join(camera[1:])
        metadata.lens = film_metadata['lens']
        pattern_focal_length = re.compile(r"[\d]+(?=mm)")
        regex_focal_length = re.search(pattern_focal_length, metadata.lens)
        metadata.focal_Length_35mm = int(regex_focal_length.group(0))
        metadata.get_format(cameras_dict)

        # Exposure settings.
        metadata.film = film_metadata['film']
        metadata.iso = int(film_metadata['iso'])
        
        # GPS coordinates.
        metadata.gps['lat_ref'] = exif_data['GPSInfo'][1]
        if metadata.gps['lat_ref'] == 'N':
            metadata.gps['lat'] = str(dms_to_deci_deg(exif_data['GPSInfo'][2]))
        else:
            metadata.gps['lat'] = str(dms_to_deci_deg(exif_data['GPSInfo'][2]) * Decimal(-1.0))

        metadata.gps['lng_ref'] = exif_data['GPSInfo'][3]
        if metadata.gps['lng_ref'] == 'E':
            metadata.gps['lng'] = str(dms_to_deci_deg(exif_data['GPSInfo'][4]))
        else:
            metadata.gps['lng'] = str(dms_to_deci_deg(exif_data['GPSInfo'][4]) * Decimal(-1.0))

        # URL for uploaded image.
        metadata.url = image_url
        metadata.url_thumb = image_url.replace('images', 'thumbs')

        # Tags.
        metadata.tags = strip_metadata_in_tags(raw_tags)

    return metadata


def build_mongodb_doc(metadata):
    """
    Prepare object in MongoDB document schema. 
    """
    # Initiate MongoDB doc with id.
    mongodb_doc = {}
    mongodb_doc['_id'] = ObjectId()

    mongodb_doc.update(metadata.as_dict())
    
    return mongodb_doc


def get_gps_data(image):
    # Get metadata.
    pil_image = Image.open(image)
    exif_data = {ExifTags.TAGS[key]: val for key, val in pil_image._getexif().items() if key in ExifTags.TAGS}
    metadata = Metadata()

    # GPS coordinates.
    metadata.gps['lat_ref'] = exif_data['GPSInfo'][1]
    if metadata.gps['lat_ref'] == 'N':
        metadata.gps['lat'] = dms_to_deci_deg(exif_data['GPSInfo'][2])
    else:
        metadata.gps['lat'] = dms_to_deci_deg(exif_data['GPSInfo'][2]) * Decimal(-1.0)

    metadata.gps['lng_ref'] = exif_data['GPSInfo'][3]
    if metadata.gps['lng_ref'] == 'E':
        metadata.gps['lng'] = dms_to_deci_deg(exif_data['GPSInfo'][4])
    else:
        metadata.gps['lng'] = dms_to_deci_deg(exif_data['GPSInfo'][4]) * Decimal(-1.0)
    
    return metadata.gps


def calculate_map_bounds(coords):
    # Get bounding box coordinates.
    bbox = {
        'lng': [
            float(min(coords['lng'])), 
            float(max(coords['lng']))
        ], 
        'lat': [
            float(min(coords['lat'])),
            float(max(coords['lat']))
        ]
    }

    return bbox


def create_mongodb_docs():
    """
    Gets list of image blobs and compares to MongoDB docs.
    Creates and updates docs when needed.
    """

    # Get images blob from Google Cloud Storage.
    bucket_name = environ.get('GCS_BUCKET')
    images_folder_prefix = environ.get('GCS_BUCKET_IMG_PREFIX')
    storage_images_blob = list_blobs_with_prefix(bucket_name, images_folder_prefix)

    # Get collections of MongoDB docs to add.
    image_blobs_to_update = check_blobs_and_docs(storage_images_blob)

    # Create dict of all images in local folder.
    image_extensions = ['.jpg', '.jpeg', '.png', '.tiff']
    images = {}
    mongodb_collections = {}
    bounding_boxes = {}
    map_bounds = {}

    for year_folder in IMG_FOLDER.iterdir():
        # Initialize dict entry for the year.
        mongodb_collections[year_folder.name] = []
        bounding_boxes[year_folder.name] = []
        map_bounds[year_folder.name] = {
            'lat': [], 'lng': []
        }

        # image_set == tz code folder name, 'Japan', 'America.Vancouver'
        for image_set in year_folder.iterdir():
            # item == files
            for item in image_set.iterdir():
                if item.suffix in image_extensions:
                    # Add GPS data for calculating bounds.
                    gps_coords = get_gps_data(item)
                    map_bounds[year_folder.name]['lat'].append(gps_coords['lat'])
                    map_bounds[year_folder.name]['lng'].append(gps_coords['lng'])
                    
                    # Build images_blob dict key from path.
                    parts_index = [4, 5, 6, 7, 8, 9]
                    blob_key = '/'.join([part for index, part in enumerate(item.parts) if index in parts_index])

                    # Get images url for all images requiring to be added to MongoDB.
                    try:
                        image_url = image_blobs_to_update[year_folder.name][blob_key]
                    except KeyError:
                        print(">>> {0} not in GCS images to update.  Skipping.".format(blob_key))
                        continue

                    images.update({item: image_url})
    
    cameras_json = PROJ_FOLDER / 'tools' / 'cameras.json'
    with open(cameras_json) as file:
        cameras_dict = json.load(file)
    
    # Create MongoDB doc for each image and add to its year collection.
    for image in images:
        image_url = images[image]
        metadata = get_metadata(image, cameras_dict, image_url)
        mongodb_doc = build_mongodb_doc(metadata)
        # Add to its corresponding year in collections dict.
        mongodb_collections[str(mongodb_doc['date']['year'])].append(mongodb_doc)

    # Insert bounding boxes.
    for year in map_bounds:
        bbox = calculate_map_bounds(map_bounds[year])
        collection = db['bounds']
        bbox_doc = {
            'year': year, 
            'bbox': bbox
        }
        collection.insert_one(bbox_doc)
        print(">>> Bounding box for {0} inserted into collection.".format(year))

    # Insert collections to MongoDB database.
    for year in mongodb_collections:
        if len(mongodb_collections[year]) == 0:
            continue

        collection = db[year]
        collection.insert_many(mongodb_collections[year])
        print(">>> {0} documents inserted into {1} collection.".format(len(mongodb_collections[year]), year))

    print(">>> MongoDB database of uploaded images updated.")


if __name__ == '__main__':
    create_mongodb_docs()
