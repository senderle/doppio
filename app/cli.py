import click
import json
import os
import shutil
import pymongo
import getpass
import bcrypt
import yaml
import sys

from pathlib import Path

from settings import EVE_MAIN_COLLECTION, STATIC_URL_PATH
from bson import json_util, ObjectId


# Command Line Management Commands #

# Check for existing file and avoid overwriting it
# by appending a number.
def check_filename(f):
    new_f = f
    if os.path.exists(f):
        n = 1
        new_f, ext = os.path.splitext(f)
        new_f_template = new_f + '-{}{}'
        new_f = new_f_template.format(n, ext)
        while os.path.exists(new_f):
            n += 1
            new_f = new_f_template.format(n, ext)
    return new_f

def init_cli(app):

    # Create user to access website
    @app.cli.command()
    def createsuperuser():

        username = input("Username: ")

        if (username == ""):
            click.echo("Username cannot be empty")
            return

        password = getpass.getpass("Password: ")
        confirm_password = getpass.getpass("Confirm Password: ")

        if (password != confirm_password):
            click.echo("Passwords don't match")
            return

        password = bcrypt.hashpw(password.encode('utf8'), bcrypt.gensalt())

        accounts = app.data.driver.db['accounts']
        account = accounts.find_one({'username': username})

        if account is None:
            accounts.insert_one({'username': username, "password" : password})
            click.echo("Successfully created user")
        else:
            click.echo("User already exists")


    # Dump data from mongo to json files
    @app.cli.command()
    @click.argument('dir')
    def exportjson(dir):

        if not os.path.exists(dir):
            click.echo("Folder {} could not be found".format(dir))
            return

        collection = app.data.driver.db[EVE_MAIN_COLLECTION]
        docs = collection.find()

        i = 0;

        for doc in docs:

            # Enumerate the filenames
            #filename = '%s/item%d.json' % (dir,i)

            # Use object id as filename
            # filename = dir + '/' + str(doc['_id']) + '.json'
            filename_field = app.config['FILENAME_FIELD']
            main_collection = app.config['EVE_MAIN_COLLECTION']
            filename = dir + '/' + str(doc[main_collection][filename_field]) + '.yaml'

            with open(filename, 'w') as outfile:
                # outfile.write(json_util.dumps(doc))
                outfile.write(yaml.dump(doc))

            i += 1

        click.echo("Dumped {} objects into {}".format(i, dir))


    # Read data from json dump to the database
    @app.cli.command()
    @click.argument('dir')
    def readjson(dir):

        if not os.path.exists(dir):
            click.echo("Specified file could not be found")
            return

        collection = app.data.driver.db[EVE_MAIN_COLLECTION]

        i = 0

        for file in os.listdir(dir):
            filename = Path(dir) / os.fsdecode(file)

            ext = filename.suffix
            if ext in ('.json', '.yaml', '.yml'):
                item_load = json_util.loads if ext == '.json' else yaml.load
                with open(filename, 'r') as f:
                    try:
                        item_json = item_load(f.read())
                    except (yaml.parser.ParserError, yaml.scanner.ScannerError) as exc:
                        click.echo("Syntax error in this file:")
                        click.echo(str(filename))
                        click.echo(exc)
                        sys.exit(1)
                    except Exception as exc:
                        click.echo("Read %d objects from " % (i,) + dir + " to the database.")
                        click.echo("Error on this file:")
                        click.echo(str(filename))
                        raise exc

                    try:
                        collection.insert_one(item_json)
                    except pymongo.errors.DuplicateKeyError as exc:
                        click.echo("File already loaded; skipping: " + str(filename))
                        continue
                    click.echo(str(filename) + " loaded successfully")
                    i += 1

        click.echo("Read %d objects from " % (i,) + dir + " to the database.")

