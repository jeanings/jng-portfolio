#--------------------------
# Flask app initialization.
#--------------------------

from flask import Flask, render_template
from flask_cors import CORS
from config import Config
# from flask_sqlalchemy import SQLAlchemy
# db = SQLAlchemy()
# db.init_app(app)


def error_404(e):
  """ 404 error handler. """
  return render_template('/error_404/templates/error_404.html', 
    title="Oops, you're lost!  ——  jeanings.space"), 404


def create_app():
    """ Initiate Flask application factory. """
    app = Flask(__name__)
    app.config.from_object(Config)
    DEBUG_MODE = app.config['FLASK_DEBUG']
    
    # CORS settings.
    origins = []
    if DEBUG_MODE == False:
      origins.append(app.config['CORS_ORIGIN_PRODUCTION'])
    else:
      origins.append(app.config['CORS_ORIGIN_DEV'])

    app.config['CORS_ORIGIN'] = origins
    CORS(app, origin=origins, supports_credentials=True)


    # Import blueprints, routes for application.
    with app.app_context():
        from .index import routes as index
        from .resume import routes as resume
        from .projects import routes as projects
        from .projects.gallery import routes as gallery
        from .projects.tokaido import routes as tokaido
        from .projects.japan_real_estate_choropleth import routes as japan_real_estate_choropleth
        from .projects.japan_real_estate_dashboard import routes as japan_real_estate_dashboard
        from .projects.photo_diary import routes as photo_diary

        # db.create_all()

        app.register_blueprint(index.index_bp)
        app.register_blueprint(resume.resume_bp)
        app.register_blueprint(projects.projects_bp)
        app.register_blueprint(gallery.gallery_bp, url_prefix="/projects")
        app.register_blueprint(tokaido.tokaido_bp, url_prefix="/projects")
        app.register_blueprint(japan_real_estate_choropleth.japan_real_estate_choropleth_bp, url_prefix="/projects")
        app.register_blueprint(japan_real_estate_dashboard.japan_real_estate_dashboard_bp, url_prefix="/projects")
        app.register_blueprint(photo_diary.photo_diary_bp, url_prefix="/projects")
        app.register_error_handler(404, error_404)

        return app
