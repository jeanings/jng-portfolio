#------------------------------------------
# Route for resume page.
#------------------------------------------

from flask import Blueprint, render_template
from flask import current_app as app
from .assets import build_assets

DEBUG_MODE = app.config['FLASK_DEBUG']


# Blueprint config.
resume_bp = Blueprint('resume_bp', __name__, 
    static_folder='static', 
    template_folder='templates'
)

if DEBUG_MODE == 'True':
    build_assets(app)


# Projects route.
@resume_bp.route('/resume', methods=['GET'])
@resume_bp.route('/resume/', methods=['GET'])
def resume():
    return render_template('resume.html', 
        title="Résumé  ——  jeanings.space"
    )
