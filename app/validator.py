from eve.io.mongo import Validator
import warnings


class MyValidator(Validator):

    # In order to filter no validation schema warning from MyValidator
    warnings.filterwarnings("ignore", message="No validation schema")

    def _validate_documentation(self, documentation, field, value):
        if documentation:
            return

    def _validate_formType(self, formType, field, value):
        if formType:
            return

    def _validate_order(self, order, field, value):
        if order:
            return
