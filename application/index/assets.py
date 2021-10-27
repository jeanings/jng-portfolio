#------------------------------------------
# Assets for index page.
#------------------------------------------
from flask import current_app as app
from flask_assets import Bundle, Environment


def build_assets(app):
    DEBUG_MODE = app.config['FLASK_DEBUG']
    assets = Environment(app)
        
    # Automatically build and merge assets.
    Environment.auto_build = True
    Environment.debug = False

    css_bundle = Bundle(
                    'builds/style.css',
                    'builds/index/index.css',
                    # 'builds/media_res.css',
                    'builds/index/index_media_res.css',
                    filters='cssmin',
                    output='dist/css/index.css')

    js_bundle = Bundle(
                    'builds/main.js',
                    'builds/index/index.js',
                    'builds/nav.js',
                    filters='jsmin',
                    output='dist/js/index.js')

    # Register and build in development mode.
    assets.register('index_css', css_bundle)
    assets.register('index_js', js_bundle)

    if DEBUG_MODE == 'True':
        css_bundle.build()
        js_bundle.build()
