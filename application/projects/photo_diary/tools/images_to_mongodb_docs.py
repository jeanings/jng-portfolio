#--------------------------------------------------------------------------------------------
# Script for creating and updating MongoDB docs for uploaded images on Google Cloud Storage.
#--------------------------------------------------------------------------------------------

from os import environ
from dotenv import load_dotenv
from pathlib import Path
from datetime import datetime
from urllib.parse import quote_plus
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
# try:
#     client = MongoClient(f'mongodb+srv://{MONGODB_ID}:{MDB_PASS}@portfolio.8frim.mongodb.net/')    
# except pymongo.errors.AutoReconnect:
#     print("Reconnecting to database due to connection failure.")
# except pymongo.errors.OperationFailure:
#     print("Database operation error.")
# db = client.photo_diary # or client['database_name']


            
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
    for year in folders:
        blobs[year] = {}
        prefix = folders[year]
        blobs_request = storage_client.list_blobs(bucket_name, prefix=prefix, delimiter=None)

        for blob in blobs_request:
            blobs[year][blob.name] = blob.public_url

    return blobs


def check_blobs_and_docs():
    """
    Check MongoDB docs count against GCS blobs to get list of files to update.
    """

    # db.collection.find().count()



def get_metadata(image, cameras_dict, image_url):
    """
    Extract and build dict of image metadata of interest.
    """

    pil_image = Image.open(image)
    exif_data = {ExifTags.TAGS[key]: val for key, val in pil_image._getexif().items() if key in ExifTags.TAGS}
    metadata = Metadata()

    # Base file info.
    metadata.filename = image.name
    metadata.local_path = str(image)
    metadata.date_taken = exif_data['DateTimeOriginal']

    dt = datetime.strptime(metadata.date_taken, "%Y:%m:%d %H:%M:%S")
    metadata.date_year = dt.year
    metadata.date_month = dt.month
    metadata.date_day = dt.day
    metadata.date_time = ':'.join([str(dt.hour), str(dt.minute), str(dt.second)])

    # Camera/lens data.
    metadata.make = exif_data['Make']
    metadata.model = exif_data['Model']
    metadata.focal_Length_35mm = exif_data['FocalLengthIn35mmFilm']
    metadata.get_format(cameras_dict)

    # Exposure settings.
    metadata.iso = exif_data['ISOSpeedRatings']
    metadata.aperture = exif_data['FNumber']
    metadata.shutter_speed = exif_data['ExposureTime']

    # GPS coordinates.
    metadata.gps_lat = dms_to_deci_deg(exif_data['GPSInfo'][2])
    metadata.gps_lng = dms_to_deci_deg(exif_data['GPSInfo'][4])

    # Tags.
    xmp_string = pil_image.app['APP1'].decode('utf-8')
    xmp_raw_string = repr(xmp_string)
    # Narrow regex to portion of xmp where tags are.
    pattern_filter = re.compile(r"<rdf:Bag>(.{0,}?)</rdf:Bag>") #<rdf:Bag>(.*?)</rdf:Bag>
    regex_filter = re.findall(pattern_filter, xmp_raw_string)
    # Isolate for tags.
    pattern_refine = re.compile(r"<rdf:li>(.{0,}?)</rdf:li>")
    tags = re.findall(pattern_refine, regex_filter[0])
    metadata.tags = tags

    # URL for uploaded image.
    metadata.url = image_url

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


def create_mongodb_docs():
    """
    Gets list of image blobs and compares to MongoDB docs.
    Creates and updates docs when needed.
    """

    # Get images blob from Google Cloud Storage.
    bucket_name = environ.get('GCS_BUCKET')
    images_folder_prefix = environ.get('GCS_BUCKET_IMG_PREFIX')
    images_blob = list_blobs_with_prefix(bucket_name, images_folder_prefix)

    # Create dict of all images in local folder.
    image_extensions = ['.jpg', '.jpeg', '.png', '.tiff']
    images = {}
    mongodb_collections = {}

    for year_folder in IMG_FOLDER.iterdir():
        # Initialize dict entry for the year.
        mongodb_collections[year_folder.name] = []
        
        for image_set in year_folder.iterdir():
            for item in image_set.iterdir():
                if item.suffix in image_extensions:
                    # Build images_blob dict key from path.
                    parts_index = [4, 5, 6, 7, 8, 9]
                    blob_key = '/'.join([part for index, part in enumerate(item.parts) if index in parts_index])

                    try:
                        image_url = images_blob[year_folder.name][blob_key]
                    except KeyError:
                        print(">>> {0} not in GCS images blob.  Check files for errors.  Skipping.".format(blob_key))
                        continue

                    images.update({item: image_url})
    
    # Create MongoDB doc for each image and add to its year collection.
    cameras_json = PROJ_FOLDER / 'tools' / 'cameras.json'
    with open(cameras_json) as file:
        cameras_dict = json.load(file)
    
    for image in images:
        image_url = images[image]
        metadata = get_metadata(image, cameras_dict, image_url)
        mongodb_doc = build_mongodb_doc(metadata)
        # Add to its corresponding year in collections dict.
        mongodb_collections[str(mongodb_doc['date_year'])].append(mongodb_doc)

    # Insert collections to MongoDB database.
    # for year in mongodb_collections:
    #     collection = db[year]
    #     collection.insert_many(mongodb_collections[year])


        


    print(">>> MongoDB database of uploaded images updated.")
   

if __name__ == '__main__':
    create_mongodb_docs()

    
"""
pseudo

0)  upload images to GCS

1)  get list of uploaded folders/images
        create dict of {image name: url}

2)  get Mongo docs of images
    if len(docs) != len(uploaded)
        create new docs
        update

3)  for all images in image_folder
        append to images list

4)  for image in images list
        read EXIF data
        get url from dict in 1)

        Mongo doc obj {
            name
            url
            year
            month
            day
            time
            gps
            camera
            lens
            aperture
            shutter
            tags
        }

        insert Mongo doc

"""