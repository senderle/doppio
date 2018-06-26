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

# accounts = {
#     'authentication': TokenAuthentication(),

#     'item_title' : 'account',
#     'additional_lookup': {
#         'url': 'regex("[\w]+")',
#         # 'field': 'userid',
#         'field' : 'username'
#     },

#     # We also disable endpoint caching as we don't want client apps to
#     # cache account data.
#     'cache_control': '',
#     'cache_expires': 0,
#      'allowed_roles': ['superuser', 'admin'],
#     # 'schema': accountschema
#     'schema' : userschema
# }


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
