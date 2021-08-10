#-----------------------------------------------------------------------
#   Script to read and strip date-range-bound data from Google timeline.
#-----------------------------------------------------------------------

import json, jsonpickle, pytz
from datetime import datetime
from pathlib import Path

PROJ_FOLDER = Path.cwd() / "application" / "projects" / "tokaido"
LOCATION_JSON = PROJ_FOLDER / "tools" / "data" / "LocationHistory.json"
CLEANED_JSON = PROJ_FOLDER / "tools" / "data" / "LocationCleaned.json"
CLEANED_JSON_RAW = PROJ_FOLDER / "tools" / "data" / "LocationCleanedRaw.json"


class Location(object):
    def __init__(self, loc_dict={}):
        self.timestamp = None
        self.latitude = None
        self.longitude = None
        self.altitude = 0

        for key in loc_dict:
            if key == 'timestampMs':
                self.timestamp =  int(loc_dict[key]) / 1000
            elif key == 'latitudeE7':
                self.latitude = int(loc_dict[key]) / 1e7
            elif key == 'longitudeE7':
                self.longitude = int(loc_dict[key]) / 1e7
            elif key == 'altitude':
                self.altitude = loc_dict[key]
            elif key == 'activity':
                self.activity = loc_dict[key]
    
    # Comparison operators.
    def __eq__(self, other):
        return self.timestamp == other.timestamp
    def __lt__(self, other):
        return self.timestamp < other.timestamp
    def __gt__(self, other):
        return self.timestamp > other.timestamp
    def __le__(self, other):
        return self.timestamp <= other.timestamp
    def __ge__(self, other):
        return self.timestamp >= other.timestamp
    def __ne__(self, other):
        return self.timestamp != other.timestamp


def clean_json():
    """
    Loads in location history data and rebuilds into date-bound files. 
    """
    if not CLEANED_JSON_RAW.is_file():
        print("\n>>> Loading {0} data...".format(LOCATION_JSON))
        with open(LOCATION_JSON) as file:
            location_data = json.load(file)
    else:
        print("\n>>> Loading {0} data...".format(CLEANED_JSON_RAW))
        with open(CLEANED_JSON_RAW) as file:
            location_data = json.load(file)

    location_dict = location_data['locations']
    print(">>> Found {0} location entries".format(len(location_dict)))

    # Define start and end dates for time/location of interest.
    tz_JPT = pytz.timezone('Japan')
    # start_date = datetime(2017, 4, 25, 10).astimezone(tz_JPT) # 2017-04-25 10:00:00
    # end_date = datetime(2017, 5, 20, 18, 30).astimezone(tz_JPT) # 2017-05-20 18:30:00
    start_date = datetime(2017, 4, 25, 10).replace(tzinfo=tz_JPT) # 2017-04-25 10:00:00
    end_date = datetime(2017, 5, 20, 19, 30).replace(tzinfo=tz_JPT) # 2017-05-20 18:30:00
    
    # Clean, rebuild and apply <Location> class to each location entry.
    location_cleaned_enc= []
    entry_list = []
    location_cleaned_raw = {"locations": entry_list}
    print(">>> Cleaning data...")
    
    for entry in location_dict:
        location = Location(entry)
        location.timestamp = datetime.fromtimestamp(location.timestamp, tz=pytz.utc)

        # Filter for target dates only and encode for saving in json.
        if location.timestamp >= start_date and location.timestamp <= end_date:
            entry_list.append(entry)
            location_cleaned_raw.update({"locations": entry_list})
            location_cleaned_enc.append(jsonpickle.encode(location))

    print(">>> Data cleaned with {0} entries and encoded for saving in json...".format(len(location_cleaned_enc)))
    
    with open(CLEANED_JSON, 'w') as file:
        json.dump(location_cleaned_enc, file)
    with open(CLEANED_JSON_RAW, 'w') as file:
        json.dump(location_cleaned_raw, file)
    print(">>> Target data saved in {0}.  Closing program.".format(CLEANED_JSON))


if __name__ == '__main__':
    clean_json()