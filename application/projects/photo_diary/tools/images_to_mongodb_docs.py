#--------------------------------------------------------------------------------------------
# Script for creating and updating MongoDB docs for uploaded images on Google Cloud Storage.
#--------------------------------------------------------------------------------------------

from os import environ
from dotenv import load_dotenv
from pathlib import Path
from urllib.parse import quote_plus
from bson.json_util import ObjectId
from pymongo import MongoClient
from google.oauth2 import service_account
from google.cloud import storage
import json, pymongo

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
    print("Reconnecting to database due to connection failure / is lost.")
except pymongo.errors.OperationFailure:
    print("Database operation error.")
db = client.photo_diary # or client['database_name']



def list_blobs_with_prefix(bucket_name, prefix, delimiter=None):
    """
    Gets list of blobs in a bucket.
    https://cloud.google.com/storage/docs/listing-objects#storage-list-objects-python
    """

    blobs = storage_client.list_blobs(bucket_name, prefix=prefix, delimiter=delimiter)
    request = {}

    for blob in blobs:
        request.update({
            blob.name: blob.public_url
        })

    if delimiter:
        request["prefixes"] = []
        for prefix in blobs.prefixes:
            request["prefixes"].append(prefix)

    return request


def create_mongodb_docs():
    """
    Gets list of image blobs and compares to MongoDB docs.
    Creates and updates docs when needed.
    """

    bucket_name = environ.get('GCS_BUCKET')
    images_folder_prefix = environ.get('GCS_BUCKET_IMG_PREFIX')

    images_blob = list_blobs_with_prefix(bucket_name, images_folder_prefix)
   

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