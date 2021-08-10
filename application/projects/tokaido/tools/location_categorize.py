#-----------------------------------------------------------------------
#   Script to categorize 'acitivities' in location json file.
#-----------------------------------------------------------------------

import json, geojson, pytz
from datetime import datetime, timedelta
from geojson import Feature, FeatureCollection, LineString
from get_location_by_date import Location
from pathlib import Path

PROJ_FOLDER = Path.cwd() / "application" / "projects" / "tokaido"
CLEANED_JSON_RAW = PROJ_FOLDER / "tools" / "data" / "LocationCleanedRaw.json"
VEHICLE_JSON = PROJ_FOLDER / "tools" / "data" / "vehicle.json"
WALK_JSON = PROJ_FOLDER / "tools" / "data" / "walk.json"
STILL_JSON = PROJ_FOLDER / "tools" / "data" / "still.json"
VEHICLE_GEOJSON = PROJ_FOLDER / "tools" / "data" / "vehicle_geo.json"
WALK_GEOJSON = PROJ_FOLDER / "tools" / "data" / "walk_geo.json"
STILL_GEOJSON = PROJ_FOLDER / "tools" / "data" / "still_geo.json"


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


def generate_dict(category, item, vehicle_list, vehicle_dict, walk_list, walk_dict, still_list, still_dict):
    if category is None:
        pass
    elif category.type == 'IN_VEHICLE':
        vehicle_list.append(item)
        vehicle_dict.update({"locations": vehicle_list})
    elif category.type == 'ON_FOOT' or category.type == 'WALKING':
        walk_list.append(item)
        walk_dict.update({"locations": walk_list})
    elif category.type == 'STILL':
        still_list.append(item)
        still_dict.update({"locations": still_list})
    

def categorize_activity():
    """
    Categorizes location entries based on activity and confidence levels,
    save to individual json files for further processing.
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
    vehicle_list,  walk_list, still_list = [], [], []
    vehicle_dict = {"locations": vehicle_list}
    walk_dict = {"locations": walk_list}
    still_dict = {"locations": still_list}

    for index, item in enumerate(location_dict):
        location = Location(item)
        location.timestamp = datetime.fromtimestamp(location.timestamp, tz=pytz.utc).astimezone(tz_JPT)
        counter = 0

        if 'activity' in item:
            activity = Activity(item['activity'][0]['activity'][counter])

            # Filter for target dates only and encode for saving in json.
            if location.timestamp >= start_date and location.timestamp <= end_date:
                counter = 0
                category = filter_activity(item, activity, counter)
                generate_dict(category, item, vehicle_list, vehicle_dict, walk_list, walk_dict, still_list, still_dict)

    with open(VEHICLE_JSON, 'w') as file:
        json.dump(vehicle_dict, file)
    with open(WALK_JSON, 'w') as file:
        json.dump(walk_dict, file)
    with open(STILL_JSON, 'w') as file:
        json.dump(still_dict, file)

    print(">>> {0}, {1}, {2} categorized and saved as json.".format(VEHICLE_JSON, WALK_JSON, STILL_JSON))


def build_geojson():
    """
    Converts json structure into geojson for Mapbox:
    - 'Point' geometry for STILL (resting) datapoints
    - 'LineString' geometry for IN_VEHICLE, ON_FOOT, WALKING datapoints
    """
    
    if STILL_JSON.is_file() is False:
        print(">>> Individual jsons not found, categorizing main json file...")
        categorize_activity()
    
    print(">>> Processing into geojson format...")
    with open(VEHICLE_JSON) as file:
        vehicle_json = json.load(file)
    tz_JPT = pytz.timezone('Japan')

    time_A = None
    blip_A = None
    vehicle_coord_list = []
    vehicle_feat_collection = []

    for index, blip in enumerate(vehicle_json['locations']):
        blip_B = Location(blip)
        time_B =  datetime.fromtimestamp(blip_B.timestamp, tz=pytz.utc).astimezone(tz_JPT)
        time_delta = timedelta(minutes=15)
        # Temporarily assign initial point for comparison.
        if time_A is None:
            time_A = time_B
            blip_A = blip_B
            continue

        if time_B - time_A <= time_delta:
            # Condition: mark True if within time delta.
            marker = True
            vehicle_coord_list.append((blip_A.longitude, blip_A.latitude))
            vehicle_coord_list.append((blip_B.longitude, blip_B.latitude))
            # print(index, time_A, "\t", time_B, time_B - time_A)
        elif marker is True:
            # Condition: end of series, generate geojson feature, mark to False.
            line = LineString(vehicle_coord_list)
            # geometry = GeometryCollection(line)
            feature = Feature(geometry=line)
            
            # Reset coordinates list and build features collection.
            vehicle_coord_list.clear()
            vehicle_feat_collection.append(feature)
            marker = False
            # print(index, time_A, "\t", time_B, time_B - time_A, "end")
        elif marker is False:
            print(index, "/", len(vehicle_json['locations']), time_B)
            pass

        # Assign new data points for the next comparison.
        blip_A, time_A = blip_B, time_B

    vehicle_geojson = FeatureCollection(vehicle_feat_collection)   
    with open(VEHICLE_GEOJSON, 'w') as file:
        geojson.dump(vehicle_geojson, file)
    print("done")



if __name__ == '__main__':
    build_geojson()