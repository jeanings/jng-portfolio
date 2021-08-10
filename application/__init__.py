#--------------------------
# Flask app initialization.
#--------------------------

from flask import Flask, make_response, render_template
from flask_cors import CORS, cross_origin
from flask_sqlalchemy import SQLAlchemy
from config import Config

db = SQLAlchemy()


def page_not_found(e):
  """ 404 error handler. """
  return render_template('404.html', title="Page Not Found!"), 404


def create_app():
    """ Initiate Flask application factory. """
    app = Flask(__name__)
    app.config.from_object(Config)
    db.init_app(app)
    cors = CORS(app)


    # Import blueprints, routes for application.
    with app.app_context():
        from .index import routes as index
        from .gallery import routes as gallery
        from .projects import routes as projects
        from .projects.tokaido import routes as tokaido
        from .projects.fudousan import routes as fudousan
        from .projects.fudousan_stats import routes as fudousan_stats   # change for react?

        db.create_all()

        app.register_blueprint(index.index_bp)
        app.register_blueprint(gallery.gallery_bp)
        app.register_blueprint(projects.projects_bp)
        app.register_blueprint(tokaido.tokaido_bp, url_prefix="/projects")
        app.register_blueprint(fudousan.fudousan_bp, url_prefix="/projects")
        app.register_blueprint(fudousan_stats.fudousan_stats_bp, url_prefix="/projects/")
        app.register_error_handler(404, page_not_found)

        return app
