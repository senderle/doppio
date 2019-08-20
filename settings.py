from app.eve_tokenauth.auth.token import TokenAuthentication
from schema import main_schema
import os

# MONGO_HOST used for docker
MONGO_HOST = "mongo"

MONGO_PORT = 27017
MONGO_DBNAME = "Playbill"
RESOURCE_METHODS = ['GET', 'POST']
ITEM_METHODS = ['GET', 'PATCH', 'PUT', 'DELETE']
DATE_FORMAT = "%Y-%m-%d"
IF_MATCH = True
DEBUG = True
JSONRenderer = True
XMLRenderer = False
HATEOAS = False
MONGO_QUERY_BLACKLIST = ['$where']
PAGINATION_LIMIT = 5
TOKEN_SECRET = 'secret'
MONGO_USERNAME = os.environ['EVE_MONGO_USER']
MONGO_PASSWORD = os.environ['EVE_MONGO_PASSWORD']
MONGO_AUTHDBNAME = 'admin'
EVE_MAIN_COLLECTION = 'ephemeralRecord'
STATIC_URL_PATH = os.path.join(os.getcwd(),'static')

geoschema = {
    'placename': {
        'type': 'string',
        'required': True,
        'unique': True
    },
    'coordinates': {
        'type': 'dict',
        'schema': {
            'lat': {
                'type': 'number',
                'required': True,
            },
            'lon': {
                'type': 'number',
                'required': True,
            }
        }
    }
}

ephemeralRecord = {
    'authentication': TokenAuthentication(),
    'public_methods': ['GET'],
    'public_item_methods': ['GET'],
    'item_title': 'record',
    'allowed_roles': ['superuser', 'admin', 'user'],
    'schema': main_schema,
    'pagination': False
}

geocodes = {
    'authentication': TokenAuthentication(),
    'public_methods': ['GET'],
    'public_item_methods': ['GET'],
    'item_title': 'geocode',
    'allowed_roles': ['superuser', 'admin', 'user'],
    'schema': geoschema
}

DOMAIN = {
    EVE_MAIN_COLLECTION:  ephemeralRecord,
    'geocodes': geocodes
}
