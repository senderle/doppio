import bcrypt
from flask import current_app as app
from eve.auth import BasicAuth


def check_password(hashed, password):
    return bcrypt.hashpw(password.encode('utf8'), hashed) == hashed


class BasicAuthentication(BasicAuth):

    def check_auth(self, username, password, allowed_roles, resource, method):
        accounts = app.data.driver.db['accounts']
        account = accounts.find_one({'username': username})
        return account and \
            check_password(account['password'], password)