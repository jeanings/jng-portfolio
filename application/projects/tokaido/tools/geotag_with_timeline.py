#-------------------------------------------------------------------
#   Program to read and strip needed info from Google timeline data.
#-------------------------------------------------------------------

import json, jsonpickle, piexif, pytz
from bisect import bisect_left
from datetime import datetime
from pathlib import Path
from get_location_by_date import Location

PROJ_FOLDER = Path.cwd() / "application" / "projects" / "tokaido"
LOCATION_JSON = PROJ_FOLDER / "data" / "LocationCleaned.json"
IMG_FOLDER = PROJ_FOLDER / "journal" / "images"


def find_location(gps_blips, image_location):
    """ Compares image date with location dates, matches for gps data. """
    pointer = bisect_left(gps_blips, image_location)
    prev_blip = gps_blips[pointer - 1]
    # if not gps_blips[pointer]:
    #     next_blip = gps_blips[pointer - 1]
    # else:
    next_blip = gps_blips[pointer]

    if (image_location.timestamp - prev_blip.timestamp) < (next_blip.timestamp - image_location.timestamp):
        return prev_blip
    else:
        return next_blip


def deci_deg_to_dms(deci_deg_coord):
    """ 
    Helper function to convert decimal degree coordinates to degrees/minutes/seconds.
    https://docs.microsoft.com/en-us/office/troubleshoot/excel/convert-degrees-minutes-seconds-angles
    """
    degrees = int(deci_deg_coord)
    minutes = (deci_deg_coord - degrees) * 60.0
    seconds = (minutes - int(minutes)) * 60.0
    dms_coord = ((degrees, 1), (int(minutes), 1), (int(seconds*100), 100))
    return dms_coord 


def geotag():
    """ Takes in array of images and matches exif date to location's date to get gps coords """    
    with open(LOCATION_JSON) as file:
        location_data = json.load(file)
        print("\n>>> Loaded {0}...".format(LOCATION_JSON.name))

    gps_blips = []
    print(">>> Decoding json...")
    for item in location_data:
        decoded = jsonpickle.decode(item)
        gps_blips.append(decoded)
    print(">>> Decoding complete.")

    # Match picture-taken date with location's date and add gps data.
    allowed_extensions = ['.jpg', '.JPG']
    image_list = [item for item in IMG_FOLDER.rglob('**/*') if item.suffix in allowed_extensions]

    for image in image_list:
        # Load existing EXIF metadata.
        exif_data = piexif.load(str(image))
        if len(exif_data['GPS']) > 0:
            continue
        else:
            print(">>> Editing {0}...".format(image.name))

        # Clean up date format (compare image's local time against data's UTC) for searching.
        tz_JPT = pytz.timezone('Japan')
        raw_exif_time = exif_data['Exif'][piexif.ExifIFD.DateTimeOriginal]
        exif_time = raw_exif_time.decode('ASCII')          
        exif_time = datetime.strptime(exif_time, "%Y:%m:%d %H:%M:%S")
        exif_time = tz_JPT.localize(exif_time, is_dst=False)

        # Match closest location time and get gps data.
        image_location = Location()
        image_location.timestamp = exif_time
        locate_image = find_location(gps_blips, image_location)

        # Decimal degree coord to degrees/minutes/seconds conversion.
        lat_dms = deci_deg_to_dms(locate_image.latitude)
        lng_dms = deci_deg_to_dms(locate_image.longitude)

        # Add gps data into image.
        gps_ifd = {
            piexif.GPSIFD.GPSLatitude: (lat_dms[0], lat_dms[1], lat_dms[2]),              
            piexif.GPSIFD.GPSLongitude: (lng_dms[0], lng_dms[1], lng_dms[2])             
            # piexif.GPSIFD.GPSLatitudeRef: 1,          # b'N'
            # piexif.GPSIFD.GPSLongitudeRef: 1,         # b'E'
            # piexif.GPSIFD.GPSAltitude: 1,             # (10900, 100)
            # piexif.GPSIFD.GPSAltitudeRef: 1,          # 0
        }

        exif_gps = {"GPS": gps_ifd} 
        exif_data.update(exif_gps)
        exif_bytes = piexif.dump(exif_data)
        piexif.insert(exif_bytes, str(image))

        print(">>> {0} geotagged, processing next image...".format(image.name))
    print(">>> Processed all {0} images.  Closing program.".format(len(image_list))) 


if __name__ == '__main__':
    geotag()