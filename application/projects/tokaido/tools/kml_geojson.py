#-----------------------------------------------------------------------
#   Tool for converting kml to geojson.
#-----------------------------------------------------------------------

import kml2geojson as k2g
from pathlib import Path

PROJ_FOLDER = Path.cwd() / "application" / "projects" / "tokaido"
KML_FOLDER = PROJ_FOLDER / "tools" / "data" / "gps" / "complete"
OUTPUT = KML_FOLDER / "geojson"


def make_geojson():
    for file in KML_FOLDER.glob('*.kml'):
        k2g.main.convert(
            file, 
            OUTPUT, 
            separate_folders=False, 
            style_type=None, 
            style_filename='style.json'
        )
        print(">>> Created geojson for {0}".format(file.name))
    

if __name__ == '__main__':
    make_geojson()