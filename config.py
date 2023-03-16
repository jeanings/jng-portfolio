#--------------------------
# Flask config file.
#--------------------------

from os import environ, path
from dotenv import load_dotenv

basedir = path.abspath(path.dirname(__file__))
load_dotenv(path.join(basedir, '.env'))


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

    # CORS origins
    CORS_ORIGIN_DEV1 =  environ.get('CORS_ORIGIN_DEV1')
    CORS_ORIGIN_DEV2 = environ.get('CORS_ORIGIN_DEV2')
    CORS_ORIGIN_PRODUCTION = environ.get('CORS_ORIGIN_PRODUCTION')


    # Database
    MONGODB_ID = environ.get('MONGODB_ID')
    MONGODB_KEY = environ.get('MONGODB_KEY')

    # Mapbox
    MAPBOX_ACCESS_KEY = environ.get('MAPBOX_ACCESS_KEY')

    # GAE OAuth
    GAE_OAUTH_CLIENT_ID = environ.get('GAE_OAUTH_CLIENT_ID')
    GAE_OAUTH_SECRET= environ.get('GAE_OAUTH_SECRET')
    GAE_OAUTH_SECRET_JSON= environ.get('GAE_OAUTH_SECRET_JSON')
    GAE_OAUTH_REDIRECT_URI= environ.get('GAE_OAUTH_REDIRECT_URI')