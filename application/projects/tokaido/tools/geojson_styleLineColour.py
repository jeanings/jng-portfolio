#-----------------------------------------------------------------------
#   Script to add line color property for activities for mapbox gl.
#-----------------------------------------------------------------------

import json
from pathlib import Path

PROJ_FOLDER = Path.cwd() / "application" / "projects" / "tokaido"
GEOJSON_FOLDER = PROJ_FOLDER / "tools" / "data" / "gps" / "complete" / "geojson"
OUTPUT_FOLDER = GEOJSON_FOLDER / "final"

    

def addLineColorProperty(geo_file):
    """
    Reads geojson file and adds line colour property for each feature.
    """

    with open(geo_file) as file:
        print(">>> Opening {0}...".format(geo_file))
        geo = json.load(file)

    transport_modes = ['Bus', 'Rail', 'Car', 'Boat', 'Ropeway']

    # Add geojson property "color" value to each feature.
    for index, feature in enumerate(geo['features']):
        property_name = geo['features'][index]['properties']['name']

        if property_name in transport_modes:
            geo['features'][index]['properties']['color'] = '#42f5ad'   #aquamarine #purple #9d00ff
            geo['features'][index]['properties']['color-alt'] = '#42f5ad'
        elif property_name == 'Walking':
            geo['features'][index]['properties']['color'] = '#000000'   #black
            geo['features'][index]['properties']['color-alt'] = '#ffffff'   #white

    output_file = OUTPUT_FOLDER / geo_file.name
    with open(output_file, 'w') as file:
        json.dump(geo, file)

    print(">>> {0} processed and saved in {1}.".format(geo_file.name, OUTPUT_FOLDER))



def build_geojson():
    """
    Opens geojson files and adds a property for styling line colour depending on activity type for mapbox gl.
    """
    
    allowed_extensions = ['.geojson']
    if not PROJ_FOLDER:
        print("Project folder not found.  Quitting program.")
    else:
        file_list = [item for item in GEOJSON_FOLDER.rglob('**/*') if item.suffix in allowed_extensions]

    for geo_file in file_list:
        addLineColorProperty(geo_file)
    
    print("Editing complete, closing program.")


if __name__ == '__main__':
    build_geojson()