#----------------------------------------------------------------
#   Script to geotag images with provided gps coordinates file.
#----------------------------------------------------------------

import json, piexif
from pathlib import Path
from location_geotag import deci_deg_to_dms

PROJ_FOLDER = Path.cwd() / 'application' / 'projects' / 'photo_diary'
IMG_FOLDER = PROJ_FOLDER / 'images'


def process_images(images_list, coords_array):
    for index, image in enumerate(images_list):
        # Load existing EXIF metadata.
        exif_data = piexif.load(str(image))
        if len(exif_data['GPS']) > 0:
            continue
        else:
            print(">>> Editing {0}...".format(image.name))

        coords = None
        if type(coords_array) is dict:
            try:
                coords = coords_array["coordinates"][image.name]
            except KeyError:
                continue
        elif type(coords_array) is list:
            coords = coords_array[index]

        if coords == '':
            continue 

        lat = float(coords.split(', ')[0])     # 35.72872031747768
        lng = float(coords.split(', ')[1])     # 139.7642071603787

        # Decimal degree coord to degrees/minutes/seconds conversion.
        lat_dms = deci_deg_to_dms(lat)
        if lat > 0:
            lat_ref = 'N'
        else:
            lat_ref = 'S'

        lng_dms = deci_deg_to_dms(lng)
        if lng > 0:
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
    

def geotag_with_coords():

    image_extensions = ['.jpg', '.JPG']
    coords_file_extensions = ['.txt', '.json']

    for year_path in IMG_FOLDER.iterdir():
        if year_path.is_dir():
            # if year_path.name != '2022':        # ------------------------------------- isolate if needed
            #     continue
            for image_set_path in year_path.iterdir():
                images_list = []
                coords_file = None
                coords_array = None

                # Set up image list and coordinate arrays.
                for item in image_set_path.iterdir(): # jpeg, txt/json files
                    if item.suffix in coords_file_extensions:
                        coords_file = item
                    elif item.suffix in image_extensions:
                        images_list.append(item)
                
                # If coordinate file isn't provided, terminate.
                if coords_file is None:
                    print(">>> No coordinates file found in {0}/{1}.  Skipping.".format(year_path.name, image_set_path.name))
                    break
                
                with open(coords_file, 'r') as file:
                    if coords_file.suffix == '.txt':
                        coords_array = file.readlines()
                        if len(images_list) != len(coords_array):
                            print(">>> Number of images and coordinates don't match. Skipping.")
                    
                    elif coords_file.suffix == '.json':
                        coords_array = json.load(file)
                    print(">>> Loaded coordinates file.")

                process_images(images_list, coords_array)


if __name__ == '__main__':
    geotag_with_coords()