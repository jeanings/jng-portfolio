#---------------------------------------------------------------
#   Script to create facet stages for MongoDB aggregate method. 
#---------------------------------------------------------------

def create_facet(facet_name, query, target_field):
    """
    Takes a facet name, query from front end, and document field to search in.
    """

    # Sets and subsets will be different depending on target data field.
    # Both comparands are required to be lists.
    if facet_name == 'getMonth':
        operator = '$eq'
        comparand_a = query
        comparand_b = "$" + target_field
    elif facet_name == 'getTags':
        operator = '$setIsSubset'
        comparand_a = query                     # subset
        comparand_b = "$" + target_field        # set
    else:
        operator = '$setIsSubset'
        comparand_a = "$" + target_field        # subset
        comparand_b = query                     # set


    # Both requires to be lists.
    subset = query
    in_set = "$" + target_field
    operator = '$setIsSubset'

    facet = { facet_name: [
        { '$project': {
            '_id': 1,
            'filename': 1,
            'date': 1,
            'model': 1,
            'focal_length_35mm': 1,
            'format': 1,
            'iso': 1,
            'aperture': 1,
            'shutter_speed': 1,
            'gps': 1,
            'tags': 1,
            'url': 1,
            'isSubset': {
                operator: [
                    comparand_a,
                    comparand_b 
                ]
            },
            '$match': {
                'isSubset': True
            }
        }}
    ]}

    return facet