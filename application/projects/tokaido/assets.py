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
                    'builds/style.css',
                    'builds/projects/tokaido/tokaido.css',
                    'builds/media_res.css',
                    # filters='cssmin',
                    output='dist/css/tokaido.css')

    js_bundle = Bundle(
                    'builds/main.js',
                    'builds/nav.js',
                    'builds/projects/tokaido/tokaido.js',
                    # filters='jsmin',
                    output='dist/js/tokaido.js')


    # Register and build in development mode.
    assets.register('tokaido_css', css_bundle)
    assets.register('tokaido_js', js_bundle)
    # if app.config['FLASK_ENV'] == 'development':
    css_bundle.build()
    js_bundle.build()
