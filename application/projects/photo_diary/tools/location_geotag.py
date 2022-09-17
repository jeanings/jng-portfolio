#--------------------------------------------------------------------
#   Script to read and strip needed info from Google timeline data.
#   
#   json folder structure:
#
#       year separated jsons/
#           2016.json
#           2017.json
#           ...
#
#   image sets folder structure:
#       
#       images/
#           2016/
#               2016-01-01 etc.jpg
#               ...
#           2017/
#               2017-01-01 etc.jpg
#               ...
#
#--------------------------------------------------------------------

import json, jsonpickle, piexif, pytz
from bisect import bisect_left
from datetime import datetime
from pathlib import Path
from location_rebuild_jsons import Location
from gps_unit_conversion import deci_deg_to_dms

PROJ_FOLDER = Path.cwd() / 'application' / 'projects' / 'photo_diary'
LOC_FOLDER = PROJ_FOLDER / 'tools' / 'Takeout' / 'Location History'
IMG_FOLDER = PROJ_FOLDER / 'images'
LOC_JSONS = LOC_FOLDER / 'year separated jsons'


def find_location(gps_blips, locate):
    """
    Compares image date with location dates, matches for gps data. 
    """

    pointer = bisect_left(gps_blips, locate)
    prev_blip = gps_blips[pointer - 1]
    
    try:
        next_blip = gps_blips[pointer]
    except IndexError:
        next_blip = gps_blips[pointer - 1]

    if (locate.timestamp.year != prev_blip.timestamp.year) or \
        (locate.timestamp.month != prev_blip.timestamp.month):
        return None
    elif (locate.timestamp - prev_blip.timestamp) < (next_blip.timestamp - locate.timestamp):
        return prev_blip
    else:
        return next_blip


def process_images(location_json, images_folder, image_set):
    """ 
    Takes in array of images and matches its EXIF date to location timestamp to geotag.
    """

    gps_blips = []

    with open(location_json) as file:
        location_data = json.load(file)
        print(">>> Loaded {0}...".format(location_json.name))

    for entry in location_data:
        decoded = jsonpickle.decode(entry)
        gps_blips.append(decoded)
    print(">>> Decoded json.")

    allowed_extensions = ['.jpg', '.JPG']
    images_list = [item for item in images_folder[image_set].rglob('**/*') if item.suffix in allowed_extensions]

    # Match picture-taken date with location's date and add gps data.
    for image in images_list:
        # Load existing EXIF metadata.
        exif_data = piexif.load(str(image))
        if len(exif_data['GPS']) > 0:
            continue
        else:
            print(">>> Editing {0}...".format(image.name))

        # Set datetime object to correct timezones.
        tz_image_set = image_set.replace('.', '/')
        try:
            timezone = pytz.timezone(tz_image_set)     # image_set is folder name, itself should be named as a TZ database region
        except pytz.exceptions.UnknownTimeZoneError:
            print(">>> Timezone being set to an unrecognized region.  Processing for image set {0}/{1} skipped.".format(location_json.stem, image_set))
            return

        raw_exif_time = exif_data['Exif'][piexif.ExifIFD.DateTimeOriginal]
        exif_time = raw_exif_time.decode('ASCII')          
        exif_time = datetime.strptime(exif_time, "%Y:%m:%d %H:%M:%S")
        exif_time = timezone.localize(exif_time)

        # Match closest location time and get gps data.
        locate = Location()
        locate.timestamp = exif_time
        locate_image = find_location(gps_blips, locate)
        if locate_image is None:    # Image and gps year or month doesn't match.
            continue                # Image placed in incorrect image set. 

        # Decimal degree coord to degrees/minutes/seconds conversion.
        lat_dms = deci_deg_to_dms(locate_image.latitude)
        lng_dms = deci_deg_to_dms(locate_image.longitude)

        if locate_image.latitude > 0:
            lat_ref = 'N'
        else:
            lat_ref = 'S'

        if locate_image.longitude > 0:
            lng_ref = 'E'
        else:
            lng_ref = 'W'

        # Add gps data into image.
        gps_ifd = {
            piexif.GPSIFD.GPSLatitudeRef: lat_ref,
            piexif.GPSIFD.GPSLatitude: (lat_dms[0], lat_dms[1], lat_dms[2]),
            piexif.GPSIFD.GPSLongitudeRef: lng_ref,              
            piexif.GPSIFD.GPSLongitude: (lng_dms[0], lng_dms[1], lng_dms[2])  
        }

        exif_gps = {"GPS": gps_ifd} 
        exif_data.update(exif_gps)
        exif_bytes = piexif.dump(exif_data)
        piexif.insert(exif_bytes, str(image))

        print(">>> {0} geotagged, processing next image...".format(image.name))
    print(">>> Processed all {0} images.  Closing program.".format(len(images_list))) 


def pair_image_json_paths():
    """
    Creates dict of location json and its image folder pair by year.
    """

    # Get list of image folders.
    image_folders = {}
    for year_path in IMG_FOLDER.iterdir():
        if year_path.is_dir():
            for image_set_path in year_path.iterdir():
                image_folders.update({
                    year_path.name: {
                        image_set_path.name: image_set_path
                    }
                })

    # Pair image folders to its respective json.
    image_json_paths = {}
    json_paths = [item for item in LOC_JSONS.rglob('**/*.json')]

    for json_path in json_paths:
        if json_path.stem in image_folders.keys():
            image_folder_path = image_folders[json_path.stem]
            image_json_paths.update({
                json_path.stem: {
                    json_path: image_folder_path
                }
            })
    
    return image_json_paths


def geotag():
    """
    Initiates pairing of image folder and json paths and passes it to be processed.
    """

    paired_paths = pair_image_json_paths()

    for (year, paths) in paired_paths.items():
        location_json = list(paths.keys())[0]
        images_folder = list(paths.values())[0]

        for image_set in images_folder:
            print("\n>>> Processing images from {0}, {1}...".format(year, image_set))
            process_images(location_json, images_folder, image_set)
        
    print("\n>>> Processed all images.  Terminating script")


if __name__ == '__main__':
    geotag()