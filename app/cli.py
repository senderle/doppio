import click, json, os, shutil, pymongo
from settings import EVE_MAIN_COLLECTION, STATIC_URL_PATH
from bson import json_util, ObjectId


# Command Line Management Commands #

# Create user to access website
def init_cli(app):

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
    def dumptojson():

        dir = 'dumps'

        if not os.path.exists(dir):
            os.mkdir(dir)
        else:
            shutil.rmtree(dir)
            os.makedirs(dir)


        collection = app.data.driver.db[EVE_MAIN_COLLECTION]
        docs = collection.find()

        i = 0;

        for doc in docs:

            # Enumerate the filenames
            #filename = '%s/item%d.json' % (dir,i)

            # Use object id as filename
            filename = dir + '/' + str(doc['_id']) + '.json'

            with open(filename, 'w') as outfile:
                json.dump(json.loads(json_util.dumps(doc)), outfile)

            i += 1

        click.echo("Dumped %d objects into the dumps directory" % (i,))


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
            filename = dir + '/' + os.fsdecode(file)

            if filename.endswith(".json"):
                with open(filename, 'r') as f:
                    try:
                        item_json = json_util.loads(f.read())
                        collection.insert_one(item_json)
                        i += 1
                    except pymongo.errors.DuplicateKeyError:
                        continue

        click.echo("Read %d objects from " % (i,) + dir + " to the database.")
