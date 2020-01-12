#------------------------------------------
# Assets for gallery page.
#------------------------------------------
from flask_assets import Bundle, Environment


def build_assets(app):
    assets = Environment(app)
        
    # Automatically build and merge assets.
    Environment.auto_build = True
    Environment.debug = False

    css_bundle = Bundle(
                    'builds/style.css',
                    'builds/gallery/gallery.css',
                    filters='cssmin',
                    output='dist/css/gallery.css')

    js_bundle = Bundle(
                    'builds/main.js',
                    'builds/nav.js',
                    'builds/gallery/gallery.js',
                    filters='jsmin',
                    output='dist/js/gallery.js')


    # Register and build in development mode.
    assets.register('gallery_css', css_bundle)
    assets.register('gallery_js', js_bundle)
    # if app.config['FLASK_ENV'] == 'development':
    css_bundle.build()
    js_bundle.build()
