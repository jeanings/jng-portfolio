#--------------------------
# SQL models for flask.
#--------------------------

from . import db


class Journal(db.Model):
    """ Model for journal entries. """
        
    __tablename__ = 'journal'
    id = db.Column(
        db.Integer,
        primary_key=True
    )
    day = db.Column(
        db.Integer,
        index=True,
        unique=True,
        nullable=True
    )
    date = db.Column(
        db.String(50),
        index=False,
        unique=True,
        nullable=True
    )
    route = db.Column(
        db.VARCHAR(75),
        index=False,
        unique=False,
        nullable=False
    )
    weather = db.Column(
        db.String(50),
        index=False,
        unique=False,
        nullable=True
    )
    weather_data = db.Column(
        db.VARCHAR(100),
        index=False,
        unique=False,
        nullable=True
    )
    temp = db.Column(
        db.Integer,
        index=False,
        unique=False,
        nullable=True
    )
    distance = db.Column(db.DECIMAL(4,2),
        index=False,
        unique=False,
        nullable=True
    )
    distance_percent = db.Column(
        db.DECIMAL(4,2),
        index=False,
        unique=False,
        nullable=True
    )
    distance_percent_cum = db.Column(
        db.DECIMAL(5,2),
        index=False,
        unique=False,
        nullable=True
    )
    moving = db.Column(
        db.String(20),
        index=False,
        unique=False,
        nullable=True
    )                       
    lodging = db.Column(
        db.DECIMAL(6,2),
        index=False,
        unique=False,
        nullable=True
    )
    food = db.Column(
        db.DECIMAL(6.2),
        index=False,
        unique=False,
        nullable=True
    )
    strava = db.Column(
        db.VARCHAR(85),
        index=False,
        unique=False,
        nullable=True
    )
    entry = db.Column(
        db.Text,
        index=False,
        unique=False,
        nullable=True
    )
       
    def __repr__(self):
        return "<Entry {}>".format(self.day)
