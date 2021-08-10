#--------------------------
# Tool for creating SQL db.
#--------------------------

from pathlib import Path
from flask import current_app as app
from os import environ
from dotenv import load_dotenv
from sqlalchemy import create_engine, Table, Column, DECIMAL, Integer, String, Text, VARCHAR, MetaData
import json


load_dotenv(Path.cwd() / '.env')
DATABASE_URL = environ.get('DATABASE_URL')
DATAFILE = Path.cwd() / "application" / "projects" / "tokaido" / "tools" / "journal" / "journal.json"

engine = create_engine(DATABASE_URL)
meta = MetaData()



def table_exists():
    """ Helper: Checks for table. """

    print("Checking for table 'journalEntries' in database...")
    if engine.dialect.has_table(engine, "journal"):
        return True
    else:
        return False



def create_table():
    """ Helper: create SQL model. """
    print("Table doesn't exist, creating now.")

    journal_entries = Table("journal", meta,
        Column("id", Integer, primary_key=True),
        Column("day", Integer, index=True, unique=True, nullable=True),
        Column("date", String(50), index=False, unique=True, nullable=True),
        Column("route", VARCHAR(75), index=False, unique=False, nullable=True),
        Column("weather", VARCHAR(50), index=False, unique=False, nullable=True),
        Column("weather_data", VARCHAR(100), index=False, unique=False, nullable=True),
        Column("temp", Integer, index=False, unique=False, nullable=True),
        Column("distance", DECIMAL(4,2), index=False, unique=False, nullable=True),
        Column("distance_percent", DECIMAL(4,2), index=False, unique=False, nullable=True),
        Column("distance_percent_cum", DECIMAL(5,2), index=False, unique=False, nullable=True),
        Column("moving", String(20), index=False, unique=False, nullable=True),
        Column("lodging", DECIMAL(6,2), index=False, unique=False, nullable=True),
        Column("food", DECIMAL(6,2), index=False, unique=False, nullable=True),
        Column("strava", VARCHAR(85), index=False, unique=False, nullable=True),
        Column("entry", Text, index=False, unique=False, nullable=True)
    )
    journal_entries.create(engine)



def populate_table(data):
    """ Helper: Fill in table. """
    print("Adding data to table...")

    for index, entry in enumerate(data['journalEntries']):
        id_num = data['journalEntries'][index]['id']
        day = data['journalEntries'][index]['day']
        date = data['journalEntries'][index]['date']
        route = data['journalEntries'][index]['route']
        weather = data['journalEntries'][index]['weather']
        weather_data = data['journalEntries'][index]['weatherData']
        temp = data['journalEntries'][index]['temp']
        distance = data['journalEntries'][index]['distance']
        distancePercent = data['journalEntries'][index]['distancePercent']
        distancePercentCum = data['journalEntries'][index]['distancePercentCum']
        moving = data['journalEntries'][index]['moving']
        lodging = data['journalEntries'][index]['lodging']
        food = data['journalEntries'][index]['food']
        strava = data['journalEntries'][index]['strava']
        text_entry = data['journalEntries'][index]['entry']

        with engine.connect() as connection:
            connection.execute("""
                INSERT INTO journal (id, day, date, route, weather, weather_data, temp, distance, distance_percent, distance_percent_cum, moving, lodging, food, strava, entry)
                VALUES (%(id)s, %(day)s, %(date)s, %(route)s, %(weather)s, %(weather_data)s, %(temp)s, %(distance)s, %(distance_percent)s, %(distance_percent_cum)s, \
                        %(moving)s, %(lodging)s, %(food)s, %(strava)s, %(entry)s);""", {
                    "id": id_num,
                    "day": day,
                    "date": date,
                    "route": route,
                    "weather": weather,
                    "weather_data": weather_data,
                    "temp": temp,
                    "distance": distance,
                    "distance_percent": distancePercent,
                    "distance_percent_cum": distancePercentCum,
                    "moving": moving,
                    "lodging": lodging,
                    "food": food,
                    "strava": strava,
                    "entry": text_entry
                }
            )



def update_table(data):
    """ Helper: Update table. """
    print("Table exists - updating table instead.")

    for index, entry in enumerate(data['journalEntries']):
        id_num = data['journalEntries'][index]['id']
        day = data['journalEntries'][index]['day']
        date = data['journalEntries'][index]['date']
        route = data['journalEntries'][index]['route']
        weather = data['journalEntries'][index]['weather']
        weather_data = data['journalEntries'][index]['weatherData']
        temp = data['journalEntries'][index]['temp']
        distance = data['journalEntries'][index]['distance']
        distancePercent = data['journalEntries'][index]['distancePercent']
        distancePercentCum = data['journalEntries'][index]['distancePercentCum']
        moving = data['journalEntries'][index]['moving']
        lodging = data['journalEntries'][index]['lodging']
        food = data['journalEntries'][index]['food']
        strava = data['journalEntries'][index]['strava']
        text_entry = data['journalEntries'][index]['entry']

        with engine.connect() as connection:
            connection.execute("""
                UPDATE journal SET entry = %(entry)s
                WHERE id = %(id)s;""", {
                    "id": id_num,
                    "entry": text_entry
                }
            )



def create_db():
    """ Reads in json and builds db with model from models.py """

    with open(DATAFILE) as file:
        print(">>> Opening {0}...".format(DATAFILE))
        data = json.load(file)

    if table_exists() is False:
        create_table()        
        populate_table(data)
        print("Table created and populated, closing.")
    else:
        update_table(data)
        print("Table updated, closing.")        



if __name__ == '__main__':
    create_db()