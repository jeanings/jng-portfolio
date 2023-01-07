#------------------------------------------
# Assets for Japan real estate choropleth.
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
                    'builds/projects/japan_real_estate_choropleth/style.css',
                    'builds/projects/japan_real_estate_choropleth/japan_real_estate_choropleth.css',
                    'builds/media_res.css',
                    'builds/projects/japan_real_estate_choropleth/japan_real_estate_choropleth_media_res.css',
                    filters=css_min,
                    output='dist/css/japan_real_estate_choropleth.css')

    js_bundle = Bundle(
                    'builds/main.js',
                    'builds/projects/japan_real_estate_choropleth/nav.js',
                    'builds/projects/japan_real_estate_choropleth/japan_real_estate_choropleth.js',
                    filters=js_min,
                    output='dist/js/japan_real_estate_choropleth.js')


    # Register and build in development mode.
    assets.register('japan_real_estate_choropleth_css', css_bundle)
    assets.register('japan_real_estate_choropleth_js', js_bundle)

    if DEBUG_MODE == True:
        css_bundle.build()
        js_bundle.build()
        