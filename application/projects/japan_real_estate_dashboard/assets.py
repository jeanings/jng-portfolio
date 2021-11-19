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
                    'builds/projects/fudousan_stats/style.css',
                    'builds/projects/fudousan_stats/fudousan_stats.css',
                    'builds/projects/fudousan_stats/media_res.css',
                    # filters='cssmin',
                    output='dist/css/fudousan_stats.css')

    js_bundle = Bundle(
                    'builds/main.js',
                    'builds/nav.js',
                    'builds/projects/fudousan_stats/fudousan_stats.js',
                    # filters='jsmin',
                    output='dist/js/fudousan_stats.js')


    # Register and build in development mode.
    assets.register('fudousan_stats_css', css_bundle)
    assets.register('fudousan_stats_js', js_bundle)
    # if app.config['FLASK_ENV'] == 'development':
    css_bundle.build()
    js_bundle.build()
