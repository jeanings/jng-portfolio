#-----------------------------------------------------------------------
#   Script to categorize 'acitivities' in location json file.
#-----------------------------------------------------------------------

import json, jsonpickle, geojson, pprint, pytz
from datetime import datetime, timedelta
from geojson import Feature, GeometryCollection, LineString, Point
from location import Location
from pathlib import Path

PROJ_FOLDER = Path("E:\\CODE\\portfolio\\application\\projects\\tokaido\\")
CLEANED_JSON_RAW = PROJ_FOLDER / "static" / "data" / "LocationCleanedRaw.json"


class Activity(object):
    def __init__(self, actvt_dict={}):
        self.type = None
        self.confidence = None

        for key in actvt_dict:
            if key == 'type':
                self.type = actvt_dict[key]
            elif key == 'confidence':
                self.confidence = int(actvt_dict[key])


def filter_activity(loc_dict_item, activity_obj, activity_counter):
    # Helper function to categorize for activities of interest:
    activity = activity_obj
    if activity.type == 'UNKNOWN':
        counter = activity_counter + 1
        activity_obj = Activity(loc_dict_item['activity'][0]['activity'][counter])
        filter_activity(loc_dict_item, activity_obj, counter)
        return activity
    elif activity.type == 'IN_VEHICLE' and activity.confidence >= 50:
        return activity
    elif activity.type == 'ON_FOOT' or activity.type == 'WALKING':
        return activity
    elif activity.type == 'STILL':
        return activity
    # Tilting, etc.
    else: 
        return None
    

def categorize_activity():
    """
    Categorizes location entries based on activity and confidence levels.
    Converts json structure into geojson for Mapbox:
    - 'Point' geometry for STILL (resting) datapoints
    - 'LineString' geometry for IN_VEHICLE, ON_FOOT, WALKING datapoints
    """
    if CLEANED_JSON_RAW.is_file():
        print("\n>>> Loading {0} data...".format(CLEANED_JSON_RAW))
        with open(CLEANED_JSON_RAW) as file:
            location_data = json.load(file)
    else:
        print("\n>>> {0} doesn't exist. Closing.".format(CLEANED_JSON_RAW))

    location_dict = location_data['locations']
    print(">>> Found {0} location entries".format(len(location_dict)))

    # Define start and end dates for time/location of interest.
    tz_JPT = pytz.timezone('Japan')
    start_date = datetime(2017, 4, 25, 10).replace(tzinfo=tz_JPT) # 2017-04-25 10:00:00
    end_date = datetime(2017, 5, 20, 18, 30).replace(tzinfo=tz_JPT) # 2017-05-20 18:30:00

    # Apply <Location> class to each location item and categorize.
    print(">>> Categorizing data...")
    entry_list = []
    vehicle_dict = {"locations": entry_list}
    walk_dict = {"locations": entry_list}
    still_dict = {"locations": entry_list}

    for index, item in enumerate(location_dict):
        location = Location(item)
        location.timestamp = datetime.fromtimestamp(location.timestamp, tz=pytz.utc)
        counter = 0
        if 'activity' in item:
            activity = Activity(item['activity'][0]['activity'][counter])

            # Filter for target dates only and encode for saving in json.
            if location.timestamp >= start_date and location.timestamp <= end_date:
                counter = 0
                category = filter_activity(item, activity, counter)
                if category.type == 'IN_VEHICLE' and category.confidence >= 50:
                    print(index, "/", len(location_dict), category.type)
                # Use time difference to determine if part of a series.
                
                """
                TO DO
                    timedelta(minutes=0, hours=0)

                    if STILL ie resting:
                        Point((coord)) 

                    if connected:
                        LineString([(coord1), (coord2)])

                    if end of collection:
                        geo = GeometryCollection([coord_series])
                        Feature(geometry=geo)

                    ** validation **
                    geo_obj = Point((-3.69, 40.41))
                    geo_obj.is_valid    *bool

                    geo_obj.errors()

                    geojson.dump(geo_obj)

                """



                # if category == 'IN_VEHICLE':
                #     pass
                # elif category == 'ON FOOT' or category == 'WALKING':
                #     pass
                # elif category == 'STILL':
                #     pass

            
            # location_cleaned.append(jsonpickle.encode(location))
            # entry_list.append(item)
            # location_cleaned_raw.update({"locations": entry_list})
    
    # with open(CLEANED_JSON_RAW, 'w') as file:
    #     json.dump(location_cleaned_raw, file)


if __name__ == '__main__':
    categorize_activity()