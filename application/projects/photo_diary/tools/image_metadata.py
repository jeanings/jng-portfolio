class Metadata(object):
    """
    Image metadata class for a photo-viewing web app.
    """

    def __init__(self):
        self.filename = None
        self.local_path = None
        self.date_taken = None
        self.date_year = None
        self.date_month = None
        self.date_day = None
        self.date_time = None
        self.make = None
        self.model = None
        self.focal_Length_35mm = None
        self.format = None
        self.format_sub = None
        self.iso = None
        self.aperture = None
        self.shutter_speed = None
        self.gps_lat = None
        self.gps_lng = None
        self.tags = None
        self.url = None

    def get_format(self, cameras_dict):
        """
        Takes in dict of cameras used and auto-generate format value with camera make and model.
        """
        cameras = cameras_dict

        for format_type in cameras:
            if self.make in cameras[format_type].keys():
                try:
                    self.format_sub = cameras[format_type][self.make][self.model]
                except IndexError:
                    return None
                
                self.format = format_type