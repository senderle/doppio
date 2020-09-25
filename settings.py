from app.eve_tokenauth.auth.token import TokenAuthentication
from schema import main_schema
import os

# Mongo Config
MONGO_HOST = "mongo"  # Simplified URL for Docker service.
MONGO_PORT = 27017
MONGO_DBNAME = "Playbill"
MONGO_USERNAME = os.environ['EVE_MONGO_USER']
MONGO_PASSWORD = os.environ['EVE_MONGO_PASSWORD']
MONGO_AUTHDBNAME = 'admin'
MONGO_QUERY_BLACKLIST = ['$where']

# Eve config
RESOURCE_METHODS = ['GET', 'POST']
ITEM_METHODS = ['GET', 'PATCH', 'PUT', 'DELETE']
DATE_FORMAT = "%Y-%m-%d"

IF_MATCH = True
DEBUG = True
JSONRenderer = True
XMLRenderer = False
HATEOAS = True

PAGINATION_DEFAULT = 500
PAGINATION_LIMIT = float('inf')

STATIC_URL_PATH = os.path.join(os.getcwd(),'static')

# Eve Tokenauth config
TOKEN_EXPIRATION = None
TOKEN_SECRET = 'secret'

# Custom database config
EVE_MAIN_COLLECTION = 'ephemeralRecord'
FILENAME_FIELD = 'callNumber'

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
    'pagination': True
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
