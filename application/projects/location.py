#-------------------------------------------------------------------
#   Program to read and strip needed info from Google timeline data.
#-------------------------------------------------------------------

import json

LOCATION_JSON = "C:\\CODE\\portfolio\\Takeout\\Location History\\Location History.json"

location_dict = json.loads(LOCATION_JSON)
print(location_dict)
