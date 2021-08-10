#-------------------------------------------------------------------
#   Program to write needed info from image exif to json.
#-------------------------------------------------------------------

import json, piexif, pytz, jsons
from copy import deepcopy
from datetime import datetime
from pathlib import Path

PROJ_FOLDER = Path.cwd() / "application" / "projects" / "tokaido"
IMG_FOLDER = PROJ_FOLDER / "tools" / "journal" / "images"
PHOTO_JSON = IMG_FOLDER /  "tools" / "journal" / "photo.json"
JSON_FILE = PROJ_FOLDER /  "tools" / "data" / "photo_data.json"



class Photo(object):
    class Geometry(object):
        def __init__(self):
            self.type = "Point"
            self.coordinates = None

    class Properties(object):
        def __init__(self):
            self.filename = None
            self.url = None
            self.thumbnail = None
            self.icon = None
            self.date = None
            self.day = None

    def __init__(self):
        self.type = "Feature"
        self.geometry = self.Geometry()
        self.properties = self.Properties()


def dms_to_deci_deg(dms_coord):
    """ 
    Helper function to convert degrees/minutes/seconds to decimal degree coordinates.
    https://docs.microsoft.com/en-us/office/troubleshoot/excel/convert-degrees-minutes-seconds-angles
    """
    degrees = dms_coord[0][0]
    minutes = dms_coord[1][0]
    seconds = dms_coord[2][0]

    deci_coord = degrees + (minutes / 60) + (seconds / 100 / 3600)
    return deci_coord


def build_photo_json():
    """ Crawls through images to extract data and generate a json from it. """    

    allowed_extensions = ['.jpg', '.JPG']
    image_list = [item for item in IMG_FOLDER.rglob('**/*') if item.suffix in allowed_extensions]
    collection = {"type": "FeatureCollection", "features": []}
    data_dict = []

    with open(JSON_FILE, 'w') as file:
        for image in image_list:
            # Load existing EXIF metadata.
            exif_data = piexif.load(str(image))
            print(">>> Extracting data from {0}...".format(image.name))

            # Clean up date format.
            tz_JPT = pytz.timezone('Japan')
            raw_exif_time = exif_data['Exif'][piexif.ExifIFD.DateTimeOriginal]
            exif_time = raw_exif_time.decode('ASCII')          
            exif_time = datetime.strptime(exif_time, "%Y:%m:%d %H:%M:%S")
            exif_time = tz_JPT.localize(exif_time, is_dst=False)
            latitude = dms_to_deci_deg(exif_data['GPS'][2])
            longitude = dms_to_deci_deg(exif_data['GPS'][4])

            # Add wanted data.
            photo_data = Photo()
            photo_data.geometry.coordinates = [longitude, latitude]
            photo_data.properties.filename = image.name.strip(".jpg")   
            photo_data.properties.url = "https://storage.googleapis.com/jn-portfolio/projects/tokaido/images/" + image.name
            photo_data.properties.thumbnail = "https://storage.googleapis.com/jn-portfolio/projects/tokaido/images/thumbs/" + image.name
            photo_data.properties.icon = "https://storage.googleapis.com/jn-portfolio/projects/tokaido/images/icons/" + image.name
            photo_data.properties.date = exif_time.strftime("%Y/%m/%d, %H:%M:%S")
            photo_data.properties.day = exif_time.strftime("%Y/%m/%d")


            temp_dict = {image.stem: photo_data}
            # dump = json.dumps(temp_dict[image.stem].__dict__)
            dump = temp_dict[image.stem].__dict__
            # data_dict.append(deepcopy(temp_dict))
            data_dict.append(deepcopy(dump))
            # file.write(dump + "\n")
        
        collection["features"] = data_dict
        collectionString = jsons.dumps(collection)
        # json.dump(data_dict, file, indent=2)
        file.write(collectionString)
        file.close()

    print(">>> JSON generated, closing program.")



if __name__ == '__main__':
    build_photo_json()