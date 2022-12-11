#------------------------------------------
# Assets for tokaido page.
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
    if DEBUG_MODE == False:
        css_min = 'cssmin'
        js_min = 'jsmin'
    else:
        css_min = None
        js_min = None

    css_bundle = Bundle(
                    'builds/projects/tokaido/style.css',
                    'builds/projects/tokaido/tokaido.css',
                    'builds/media_res.css',
                    # 'builds/projects/tokaido/tokaido_media_res.css',
                    filters=css_min,
                    output='dist/css/tokaido.css')

    js_bundle = Bundle(
                    'builds/main.js',
                    'builds/projects/tokaido/nav.js',
                    'builds/projects/tokaido/tokaido.js',
                    filters=js_min,
                    output='dist/js/tokaido.js')

    # Register and build in development mode.
    assets.register('tokaido_css', css_bundle)
    assets.register('tokaido_js', js_bundle)

    if DEBUG_MODE == True:
        css_bundle.build()
        js_bundle.build()
        