#------------------------------------------
# Route for projects page.
#------------------------------------------

from flask import Blueprint, render_template
from flask import current_app as app


# Blueprint config.
projects_bp = Blueprint('projects_bp', __name__, 
                        static_folder='static', 
                        template_folder='templates')


# Projects route.
@projects_bp.route("/projects", methods=['GET'])
def projects():
    return render_template("projects.html", title="Projects")
