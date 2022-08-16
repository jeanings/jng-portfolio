#-------------------------------------------------------------------------------------
#   Script to read and rebuild data from Google timeline into separate jsons by year.
#-------------------------------------------------------------------------------------

import json, jsonpickle
from datetime import datetime
from pathlib import Path

LOC_FOLDER = Path.cwd() / 'application' / 'projects' / 'photo_diary' / 'tools' / 'Takeout' / 'Location History'
LOC_JSON_ORIG = LOC_FOLDER / 'Records.json'
LOC_JSON_YEARS_FOLDER = LOC_FOLDER / 'year separated jsons'


class Location(object):
    def __init__(self, loc_dict={}):
        self.timestamp = None
        self.latitude = None
        self.longitude = None
        self.altitude = 0

        for key in loc_dict:
            if key == 'timestamp':
                self.timestamp =  loc_dict[key]
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


def build_year_jsons():
    """
    Loads in location history data and rebuilds into date-bound files. 
    """
    
    print("\n>>> Loading {0} data...".format(LOC_JSON_ORIG))
    with open(LOC_JSON_ORIG) as file:
        location_data = json.load(file)
   
    location_dict = location_data['locations']
    print(">>> Found {0} location entries".format(len(location_dict)))
    
    years_entries_dict = {}
    current_year = datetime.today().year
    print(">>> Separating data...")

    # Saves location entries into years_entries_dict.
    for entry in location_dict:
        location = Location(entry)

        # Parse ISO date format, Z identifyier code equals UTC.
        location.timestamp = datetime.fromisoformat(location.timestamp.strip('Z'))
        
        year_json = LOC_JSON_YEARS_FOLDER / (str(location.timestamp.year) + '.json')
        if year_json.is_file() and location.timestamp.year != current_year:
            # Skip entry if json file for the year exists.
            continue
        else:
            # Create new entry for year.
            if not location.timestamp.year in years_entries_dict:
                years_entries_dict[location.timestamp.year] = []
                print(">>> Building year {0} data...".format(location.timestamp.year))

            years_entries_dict[location.timestamp.year].append(jsonpickle.encode(location))

    print(">>> Data separated into its years.  Now saving in encoded json...")

    for year in years_entries_dict:
        year_json = LOC_JSON_YEARS_FOLDER / (str(year) + '.json')
        with open(year_json, 'w') as file:
            json.dump(years_entries_dict[year], file)
    
        print(">>> Target data saved in {0}.".format(year_json))

    print("\n>>> Data separated by year and saved in encoded jsons.  Terminating script.")


if __name__ == '__main__':
    build_year_jsons()