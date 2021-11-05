#------------------------------------------
# Assets for projects page.
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
                    'builds/media_res.css',
                    'builds/projects/projects.css',
                    # 'builds/projects/projects_media_res.css',
                    filters='cssmin',
                    output='dist/css/projects.css')

    js_bundle = Bundle(
                    'builds/nav.js',
                    'builds/projects/projects.js',
                    filters='jsmin',
                    output='dist/js/projects.js')

    # Register and build in development mode.
    assets.register('projects_css', css_bundle)
    assets.register('projects_js', js_bundle)

    if DEBUG_MODE == 'True':
        css_bundle.build()
        js_bundle.build()