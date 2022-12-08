#--------------------------
# Flask config file.
#--------------------------

from os import environ, path
from dotenv import load_dotenv
# import pkg_resources
# pkg_resources.require("heroku3==5.1.4")
# import heroku3


basedir = path.abspath(path.dirname(__file__))
load_dotenv(path.join(basedir, '.env'))

# Heroku connection
# heroku_conn = heroku3.from_key(environ.get('HEROKU_KEY'))
# heroku_app = heroku_conn.app('portfolio-jn')
# heroku_config = heroku_app.config()
# HEROKU_DATABASE_URL = heroku_config['DATABASE_URL']


class Config:
    """ Set flask config variables. """

    # General Flask
    TESTING = environ.get('TESTING')
    SECRET_KEY = environ.get('SECRET_KEY')
    FLASK_DEBUG = None
    # Get actual env debug value.
    flask_debug_env = environ.get('FLASK_DEBUG')
    if flask_debug_env.lower() in ('t', 'true', True, '1', 1, 'on'):
        FLASK_DEBUG = True
    elif flask_debug_env.lower() in ('f', 'false', False, '0', 0, 'off'):
        FLASK_DEBUG = False


    # Database
    # SQLALCHEMY_DATABASE_URI = HEROKU_DATABASE_URL.replace("://", "ql://", 1)
    # SQLALCHEMY_TRACK_MODIFICATIONS = False #environ.get('SQLALCHEMY_TRACK_MODIFICATIONS')
    MONGODB_ID = environ.get('MONGODB_ID')
    MONGODB_KEY = environ.get('MONGODB_KEY')

    # Mapbox
    MAPBOX_ACCESS_KEY = environ.get('MAPBOX_ACCESS_KEY')