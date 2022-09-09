#---------------------------------------
#   Helper scripts for MongoDB queries. 
#---------------------------------------

def create_pipeline(query, target_field):
    """
    Script to create pipelines for aggregate method.
    Takes request from front-end and document field to search in.
    """

    # Sets and subsets will be different depending on target data field.
    if target_field == 'date.month':
        operator = '$eq'
        comparand_a = query
        comparand_b = "$" + target_field
    elif target_field == 'tags':
        operator = '$setIsSubset'
        comparand_a = query                   # subset
        comparand_b = "$" + target_field        # set
    else:
        operator = '$setIsSubset'
        comparand_a = "$" + target_field        # subset
        comparand_b = query                   # set

    pipeline = [
        { 
            '$project': {
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
            }
        }
    ]


    return pipeline