from flask import current_app as app, request
from eve.methods.post import post_internal as eve_post_internal
from eve_tokenauth.auth.token import create_jwt_token
from datetime import datetime, timedelta


def insert_token(account, expiration, token):
    post_payload = dict(
        account=account['_id'],
        expiration=expiration,
        token=token.decode('utf8')
    )
    post_response = eve_post_internal("tokens", post_payload)
    return post_response


def generate_login_token_for_user(response):

    # obtain the auth submitted in the request
    request_auth = request.authorization

    # get our databases
    accounts = app.data.driver.db['accounts']
    tokens = app.data.driver.db['tokens']

    # get our account (at this point we've already checked basic auth through the authorization class.)
    account = accounts.find_one({'username': request_auth.username})

    # generate a token to put into the db for the account
    expiration = datetime.utcnow() + timedelta(days=7)
    token = create_jwt_token(account, expiration)

    # insert the token into the db
    insert_token(account, expiration, token)

    # get tokens from database matching this user
    lookup = {"account": account['_id']}
    account_tokens = tokens.find(lookup)

    # add them to the response, without most keys.
    items = []
    for record in account_tokens:

        record.pop('account')

        items.append(record)

    response['_items'] = items

    return response


