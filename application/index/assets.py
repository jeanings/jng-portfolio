#------------------------------------------
# Assets for index page.
#------------------------------------------
from flask import current_app as app
from flask_assets import Bundle, Environment

DEBUG_MODE = app.config['FLASK_DEBUG']


def build_assets(app):
    assets = Environment(app)
        
    # Automatically build and merge assets.
    Environment.auto_build = True
    Environment.debug = False

    # Miniaturize if not in debug mode.
    if DEBUG_MODE == 'False':
        css_min = 'cssmin'
        js_min = 'jsmin'
    else:
        css_min = None
        js_min = None

    css_bundle = Bundle(
                    'builds/style.css',
                    'builds/index/index.css',
                    'builds/media_res.css',
                    'builds/index/index_media_res.css',
                    filters=css_min,
                    output='dist/css/index.css')

    js_bundle = Bundle(
                    'builds/nav.js',
                    'builds/index/index.js',
                    filters=js_min,
                    output='dist/js/index.js')

    # Register and build in development mode.
    assets.register('index_css', css_bundle)
    assets.register('index_js', js_bundle)

    if DEBUG_MODE == 'True':
        css_bundle.build()
        js_bundle.build()
