#---------------------------------------
#   Helper scripts for MongoDB queries. 
#---------------------------------------

def get_selectables_pipeline():
    """
    Set up pipeline to get all unique selectables for filter component.
    Group stage adds fields (except for 'tags') to their sets, while
    project stage collates all unique tags into 'tags' array.
    """

    pipeline = [
        {
            '$group': {
                '_id': 0,
                'format_medium': { '$addToSet': '$format.medium' }, 
                'format_type': { '$addToSet': '$format.type' },
                'film': { '$addToSet': '$film' },
                'camera': { 
                    '$addToSet': {
                        '$concat': [
                            '$make', ' ', '$model' 
                        ]
                    }
                },
                'lenses': { '$addToSet': '$lens' },
                'focal_length': { '$addToSet': '$focal_length_35mm' },
                'tags': { '$push': '$tags' }
            }
        },
        {
            '$project': {
                '_id': 0,
                'formatMedium': '$format_medium', 
                'formatType': '$format_type',
                'film': '$film',
                'camera': '$camera',
                'lenses': '$lenses',
                'focalLength': '$focal_length',
                'tags': { 
                    '$setIntersection': [{
                        '$reduce': {
                            'input': '$tags',
                            'initialValue': [],
                            'in': { 
                                '$concatArrays': [ 
                                    '$$value', '$$this' 
                                ] 
                            }
                        }
                    }]
                }
            }
        }
    ]

    return pipeline


def get_facet_pipeline(query, target_field):
    """
    Set up pipelines for aggregate method.
    Takes get requests from front-end and matches to documents' fields.
    'tags' is subtractive, where more tags in query will narrow results.
    'month' is equivalent, and the rest are additive where queries broaden results.
    """

    # Sets and subsets will be different depending on target data field.
    if target_field == 'date.month':
        operator = '$eq'
        comparand_a = query
        comparand_b = "$" + target_field
    elif target_field == 'tags':
        operator = '$setIsSubset'
        comparand_a = query                     # subset
        comparand_b = "$" + target_field        # set
    else:
        operator = '$setIsSubset'
        comparand_a = ["$" + target_field]      # subset
        comparand_b = query                     # set

    pipeline = [
        { 
            '$project': {
                '_id': 1,
                'filename': 1,
                'date': 1,
                'make': 1,
                'model': 1,
                'focal_length_35mm': 1,
                'format': 1,
                'film': 1,
                'iso': 1,
                'aperture': 1,
                'shutter_speed': 1,
                'gps': 1,
                'tags': 1,
                'url': 1,
                'title': 1,
                'description': 1,
                'isSubset': {
                    operator: [
                        comparand_a,
                        comparand_b 
                    ]
                }
            }
        },
        {
            '$match': {
                'isSubset': True
            }
        }
    ]

    return pipeline


def create_facet_stage(queries, query_field):
    """
    Build individual facet stage for each query to be used in aggregate method.
    """

    # Build facet stage.
    facet_stage = {
        '$facet': {}
    }

    for keyword, query in queries.items():
        key = 'get_' + query_field[keyword].replace('.', '_')
        facet_stage['$facet'].update({
            key: get_facet_pipeline(query, query_field[keyword])
        })

    return facet_stage


def create_projection_stage(facet_stage):
    """
    Build projection stage to only return intersecting results between all facets.
    """
    
    # Build projection stage.
    projection_stage = {
        '$project': {
            'intersect': {
                '$setIntersection': []
            }
        }
    }

    for facet in facet_stage['$facet'].keys():
        projection_stage['$project']['intersect']['$setIntersection'].append(
            '$' + facet
        )

    return projection_stage