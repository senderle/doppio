from eve_tokenauth.domain import DOMAIN
from eve_tokenauth.controllers import accounts, tokens
from eve_tokenauth.exceptions import DomainConflictException


class EveWithTokenAuth():
    def __init__(self, Eveapp):
        """Patches an eve app to use token auth

        :param Eveapp: An Eve App to modify to use token auth
        """
        self.eveapp = Eveapp
        self.patch_existing_domain()
        self.add_tokenauth_events_to_eve()

    def add_tokenauth_events_to_eve(self):
        """Adds eve Events handlers for crud operations on the db.

        http://python-eve.org/features.html#post-request-event-hooks

        """

        # Upon inserting an account, hash the password for security reasons
        self.eveapp.on_insert_accounts += accounts.hash_passwords

        # Generate a token for a user
        self.eveapp.on_fetched_resource_tokens += tokens.generate_login_token_for_user

    def patch_existing_validator(self):
        """Patches whatever validator class is in use with the following additions

        http://python-eve.org/features.html#data-validation
        """
        cls = self.eveapp.validator

        class EveResthooksValidator(cls):
            pass

        self.eveapp.validator = EveResthooksValidator

    def patch_existing_domain(self):
        """Patches the domain currently in use to add the accounts
        """

        overlap = set(self.eveapp.config["DOMAIN"].keys()).intersection(set(DOMAIN.keys()))

        if not overlap:
            with self.eveapp.app_context():
                self.eveapp.config["DOMAIN"].update(DOMAIN)

            for k in DOMAIN.keys():
                self.eveapp.register_resource(k, DOMAIN[k])
        else:
            raise DomainConflictException()