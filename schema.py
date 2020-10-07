#PYTHON SCHEMA
main_schema = {
    # The top-level field. This must be the same as the
    # value of `EVE_MAIN_COLLECTION` in `settings.py`.
    'book' : {
        'type': 'dict',
        'schema': {
            # There must be at least one nested field to serve
            # as the `FILENAME_FIELD` specified in `settings.py`.
            'callNumber': {
                'type': 'string',
                'required': True,
                'maxlength': 100,
                'documentation': ("The call number of the book as specified by "
                                  "the holding institution.")
            }
        }
    }
}
