#--------------------------
# Flask app initialization.
#--------------------------

from flask import Flask, make_response, render_template

# 404 error handler.
def page_not_found(e):
  return render_template('404.html', title="Page Not Found!"), 404

def create_app():
    """ Initiate Flask application factory. """
    app = Flask (__name__)

    # Import blueprints, routes for application.
    with app.app_context():
        from .index import routes as index
        from .gallery import routes as gallery
        from .projects import routes as projects

        app.register_blueprint(index.index_bp)
        app.register_blueprint(gallery.gallery_bp)
        app.register_blueprint(projects.projects_bp)
        app.register_error_handler(404, page_not_found)

        return app
