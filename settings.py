from eve_tokenauth.auth.token import TokenAuthentication

with open('schema.py', 'r') as f:
    exec(f.read())

ephemeralRecord = {
    'authentication': TokenAuthentication(),
    'public_methods': ['GET'],
    'public_item_methods': ['GET'],
    'item_title' : 'record',
    'allowed_roles': ['superuser', 'admin', 'user'],
    'schema': schema
}

geocodes = {
    'authentication': TokenAuthentication(),
    'public_methods': ['GET'],
    'public_item_methods': ['GET'],
    'item_title' : 'geocode',
    'allowed_roles': ['superuser', 'admin', 'user'],
    'schema': geoschema
}

DOMAIN = {
    'ephemeralRecord':  ephemeralRecord,
    # 'accounts': accounts,
    'geocodes': geocodes
    }
