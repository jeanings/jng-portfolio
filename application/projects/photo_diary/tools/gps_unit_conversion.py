#-----------------------------------------------------------
#   Tool to convert GPS coordinates.
#   Degrees-minutes-seconds to decimal degree, vice-versa. 
#-----------------------------------------------------------

def dms_to_deci_deg(dms_coord):
    """ 
    Helper function to convert degrees/minutes/seconds to decimal degree coordinates.
    https://docs.microsoft.com/en-us/office/troubleshoot/excel/convert-degrees-minutes-seconds-angles
    """
    degrees = dms_coord[0]
    minutes = dms_coord[1]
    seconds = dms_coord[2]

    deci_coord = degrees + (minutes / 60) + (seconds / 100 / 3600)
    return float(deci_coord)


def deci_deg_to_dms(deci_deg_coord):
    """ 
    Helper function to convert decimal degree coordinates to degrees/minutes/seconds.
    https://docs.microsoft.com/en-us/office/troubleshoot/excel/convert-degrees-minutes-seconds-angles
    """

    degrees = int(deci_deg_coord)
    minutes = (deci_deg_coord - degrees) * 60.0
    seconds = (minutes - int(minutes)) * 60.0
    dms_coord = ((abs(degrees), 1), (abs(int(minutes)), 1), (abs(int(seconds*100)), 100))

    return dms_coord