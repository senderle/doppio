from .auth.basic import BasicAuthentication
from .auth.token import TokenAuthentication

accounts = {
    'authentication': TokenAuthentication(),
    'datasource': {
        'projection': {'password': 0}  # hides password
    },
    'public_methods': [],
    'public_item_methods': [],
    'resource_methods': ['POST','GET'],
    'item_methods': ['GET', 'PUT', 'PATCH', 'DELETE'],
    'schema': {
        'username': {
            'type': 'string',
            'unique' : True
        },
        'password': {
            'type': 'string'
        },
    }
}

tokens = {
    'authentication': BasicAuthentication(),
    'datasource': {
        'projection': {'token': 1},  # todo test this
        'default_sort': [("expiration", 1)]  # todo test this
    },
    'public_methods': ['DELETE'],
    'public_item_methods': ['DELETE'],
    'resource_methods': ['GET', 'DELETE'],
    'item_methods': ['GET', 'DELETE'],
    'schema': {
        'expiration': {
            'type': 'datetime'
        },
        'token': {
            'type': 'string'
        },
        'account': {
            'type': 'objectid',
            'data_relation': {
                'resource': 'accounts',
                'field': '_id'
            }
        }
    }
}

DOMAIN = {
    'accounts': accounts,
    'tokens': tokens
}
