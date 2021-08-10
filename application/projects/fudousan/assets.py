#------------------------------------------
# Assets for tokaido page.
#------------------------------------------
from flask_assets import Bundle, Environment


def build_assets(app):
    assets = Environment(app)
        
    # Automatically build and merge assets.
    Environment.auto_build = True
    Environment.debug = False

    css_bundle = Bundle(
                    'builds/projects/fudousan/style.css',
                    'builds/projects/fudousan/fudousan.css',
                    'builds/projects/fudousan/media_res.css',
                    # filters='cssmin',
                    output='dist/css/fudousan.css')

    js_bundle = Bundle(
                    'builds/main.js',
                    'builds/nav.js',
                    'builds/projects/fudousan/fudousan.js',
                    # filters='jsmin',
                    output='dist/js/fudousan.js')


    # Register and build in development mode.
    assets.register('fudousan_css', css_bundle)
    assets.register('fudousan_js', js_bundle)
    # if app.config['FLASK_ENV'] == 'development':
    css_bundle.build()
    js_bundle.build()
