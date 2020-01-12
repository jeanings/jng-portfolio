#------------------------------------------
# Assets for index page.
#------------------------------------------
from flask_assets import Bundle, Environment


def build_assets(app):
    assets = Environment(app)
        
    # Automatically build and merge assets.
    Environment.auto_build = True
    Environment.debug = False

    css_bundle = Bundle(
                    'builds/style.css',
                    'builds/index/index.css',
                    filters='cssmin',
                    output='dist/css/index.css')

    js_bundle = Bundle(
                    'builds/main.js',
                    'builds/index/index.js',
                    filters='jsmin',
                    output='dist/js/index.js')


    # Register and build in development mode.
    assets.register('index_css', css_bundle)
    assets.register('index_js', js_bundle)
    # if app.config['FLASK_ENV'] == 'development':
    css_bundle.build()
    js_bundle.build()
