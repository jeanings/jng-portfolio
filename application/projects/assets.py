#------------------------------------------
# Assets for projects page.
#------------------------------------------
from flask_assets import Bundle, Environment


def build_assets(app):
    assets = Environment(app)
        
    # Automatically build and merge assets.
    Environment.auto_build = True
    Environment.debug = False

    css_bundle = Bundle(
                    'builds/style.css',
                    'builds/projects/projects.css',
                    'builds/media_res.css',
                    # filters='cssmin',
                    output='dist/css/projects.css')

    js_bundle = Bundle(
                    'builds/main.js',
                    'builds/nav.js',
                    # 'builds/projects/projects.js',
                    # filters='jsmin',
                    output='dist/js/projects.js')


    # Register and build in development mode.
    assets.register('projects_css', css_bundle)
    assets.register('projects_js', js_bundle)
    # if app.config['FLASK_ENV'] == 'development':
    css_bundle.build()
    js_bundle.build()
