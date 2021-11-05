#------------------------------------------
# Route for projects page.
#------------------------------------------

from flask import Blueprint, render_template
from flask import current_app as app
from .assets import build_assets


# Blueprint config.
projects_bp = Blueprint('projects_bp', __name__, 
                        static_folder='static', 
                        template_folder='templates')
build_assets(app)


# Projects route.
@projects_bp.route("/projects", methods=['GET'])
def projects():
    return render_template("projects.html", title="Some personal projects / jeanings.space")
