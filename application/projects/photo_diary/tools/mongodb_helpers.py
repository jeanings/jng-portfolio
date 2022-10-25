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
                'lens': { '$addToSet': '$lens' },
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
                'lens': '$lens',
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


def get_image_counts(docs):
    """
    Iterates through docs and counts occurances of each month,
    returning an object with image counts through the entire year.    
    """

    counter = {'all': 0}
    month_num_map = {
        '1': 'jan', '2': 'feb', '3': 'mar', '4': 'apr',
        '5': 'may', '6': 'jun', '7': 'jul', '8': 'aug',
        '9': 'sep', '10': 'oct', '11': 'nov', '12': 'dec'
    }

    for doc in docs:
        month_num = doc['date']['month']
        month_str = month_num_map[str(month_num)]

        try:
            count = counter[month_str]
            counter[month_str] = count + 1
        except (KeyError): 
            counter[month_str] = 1

        counter['all'] = counter['all'] + 1
        
    return counter


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


def build_geojson_collection(docs):
    """
    Build geojson collection for source in Mapbox.
    """

    feature_collection = {
        "type": "FeatureCollection",
        "features": []
    }

    # Build each doc into geojson schema.
    for doc in docs:
        feature = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [
                    float(doc['gps']['lng']),
                    float(doc['gps']['lat'])
                ]
            },
            "properties": {
                "id": doc['_id'],
                "name": doc['filename'],
                "date": {
                    "year": doc['date']['year'],
                    "month": doc['date']['month']
                }
            }
        }
        feature_collection["features"].append(feature)

    return feature_collection


def get_bounding_box(docs):
    """
    Calculate bounding box for set of docs.
    """
    
    coordinates = {
        'lng': [],
        'lat': []
    }

    # Group all coordinates.
    for doc in docs:
        coordinates['lng'].append(doc['gps']['lng'])
        coordinates['lat'].append(doc['gps']['lat'])
        
    # Get bounding box coordinates.
    bounding_box = {
        'lng': [
            float(min(coordinates['lng'])), 
            float(max(coordinates['lng']))
        ], 
        'lat': [
            float(min(coordinates['lat'])),
            float(max(coordinates['lat']))
        ]
    }

    return bounding_box