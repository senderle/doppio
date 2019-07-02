from eve.flaskapp import Eve
from settings import STATIC_URL_PATH
from app.validator import MyValidator
import logging, os


def create_app():

        logging.basicConfig(format='%(asctime)s %(message)s', level=logging.DEBUG)
        log = logging.getLogger(__name__)

        settings = os.path.join(os.path.dirname(os.path.dirname(os.path.realpath(__file__))),
                                'settings.py')

        app = Eve(__name__, static_url_path=STATIC_URL_PATH,
                  settings=settings, validator=MyValidator)

        def log_every_get(resource, request, payload):
            # custom INFO-level message is sent to the log file
            app.logger.info('We just answered to a GET request!')

        def log_every_post(resource, request, payload):
            # custom INFO-level message is sent to the log file
            app.logger.info('We just answered to a POST request!')

        def log_every_patch(resource, request, payload):
            # custom INFO-level message is sent to the log file
            app.logger.info('We just answered to a PATCH request!')

        def log_every_put(resource, request, payload):
            # custom INFO-level message is sent to the log file
            app.logger.info('We just answered to a PUT request!')

        def log_every_delete(resource, request, payload):
            # custom INFO-level message is sent to the log file
            app.logger.info('We just answered to a DELETE request!')


        app.on_post_POST += log_every_post
        app.on_post_PATCH += log_every_patch
        app.on_post_PUT += log_every_put
        app.on_post_DELETE += log_every_delete


        # Register the blueprints
        from app.main import bp as main_bp
        app.register_blueprint(main_bp)

        from app.auth import bp as auth_bp
        app.register_blueprint(auth_bp)


        #enable logging to 'app.log' file
        app_logging_handler = logging.FileHandler('app.log')

        # set a custom log format, and add request
        # metadata to each log line
        app_logging_handler.setFormatter(logging.Formatter(
            '%(asctime)s %(levelname)s: %(message)s '
            '[in %(filename)s:%(lineno)d] -- ip: %(clientip)s, '
            'url: %(url)s, method:%(method)s'))

        app.logger.setLevel(logging.INFO)

        # append the handler to the default application logger
        app.logger.addHandler(app_logging_handler)

        return app
