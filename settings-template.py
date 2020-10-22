from app.eve_tokenauth.auth.token import TokenAuthentication
from schema import main_schema
import os

# Mongo Config
MONGO_HOST = "mongo"  # Simplified URL for Docker service.
MONGO_PORT = 27017
MONGO_DBNAME = os.environ['EVE_DATABASE_NAME']
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
HATEOAS = False
URL_PREFIX = 'api'

PAGINATION_DEFAULT = 500
PAGINATION_LIMIT = float('inf')

STATIC_URL_PATH = os.path.join(os.getcwd(), 'static')

# Eve Tokenauth config
TOKEN_EXPIRATION = None
TOKEN_SECRET = os.environ['EVE_TOKEN_SECRET']

##########################
# Custom database config #
##########################

# The name of the dataset being prototyped.
# E.g. "playbills" or "ephemera." This must
# also be the name of the single, top-level
# field in the schema. (See schema-template.py)
EVE_MAIN_COLLECTION = 'book'

# The name of a field to use as a human-readable
# unique idnetifier for each record in the main
# collection. This must be a subfield of the
# top-level field in the schema; it may not be
# nested further.
FILENAME_FIELD = 'callNumber'

main_collection = {
    'authentication': TokenAuthentication(),
    'public_methods': ['GET'],
    'public_item_methods': ['GET'],
    'item_title': 'record',
    'allowed_roles': ['superuser', 'admin', 'user'],
    'schema': main_schema,
    'pagination': True
}

DOMAIN = {
    EVE_MAIN_COLLECTION: main_collection,
}
