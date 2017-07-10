with open('schema.py', 'r') as f:
    exec(f.read())

accountschema =  {
    'userid': {
        'type': 'string',
        'required': True,
        'unique': True,
        },
    'secret_key': {
        'type': 'string',
        'required': True,
        'unique': True
        },
    'roles': {
        'type': 'list',
        'allowed': ['user', 'superuser', 'admin'],
        'required': True,
         },

}

ephemeralRecord = {
    'public_methods': ['GET'],
    'public_item_methods': ['GET'],
    'item_title' : 'record',
    #'additional_lookup': {
    #    'url': 'regex("[\w]+")',
    #    'field': 'callNumber',
    #},
    'allowed_roles': ['superuser', 'admin', 'user'],
    'schema': schema
}


accounts = {
    'item_title' : 'account',
#    'public_methods': ['GET','POST'],
#    'public_item_methods': ['GET','PUT'],
    'additional_lookup': {
        'url': 'regex("[\w]+")',
        'field': 'userid',
    },

    # We also disable endpoint caching as we don't want client apps to
    # cache account data.
    'cache_control': '',
    'cache_expires': 0,
    'allowed_roles': ['admin'],
    'schema': accountschema
}


DOMAIN = {
    'ephemeralRecord': ephemeralRecord,
    'accounts': accounts,

    }
