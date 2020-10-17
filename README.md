# doppio

### Doppio is a data prototyping tool for humanities research.

**Data in the humanities** is often complex, ambiguous, and richly interlinked.
One of the simplest relationships relevant to humanists is the relation
of author to book. In a traditional relational database, this already
requires not two but three tables to represent, because one book can 
have many authors, and one author can write many books; a third table
is needed to track the *is-an-author-of* relation between the other two.

Now suppose that you want to represent not books but theatrical
performances. There may be 

* stagehands
* actors
* prop managers
* playwrights
* set designers
* directors
* makeup artists

...and many other contributors, all working together to produce just
a single performance. Most of these individuals contribute to multiple 
performances, sometimes in one role, sometimes in another. A faithful 
representation of these connections in a relational database would 
require an exceptionally complex schema that would require extensive
revision before it could do its job well.

Doppio speeds up that revision process. Using a NoSQL database 
([MongoDB](https://www.mongodb.com/)) combined with a flexible schema 
validation framework and API generator 
([Eve](https://docs.python-eve.org/en/stable/)), Doppio accelerates the 
process of developing a richly expressive data model suitable for 
humanities data. Doppio schemas are easy to modify and update, so that
researchers, as they learn more about their data, can accommodate new
findings quickly. Doppio schemas are also self-documenting; the data 
entry form is automatically rendered in a way that makes the structure 
of the underlying schema self-evident, even to users who have never 
worked with a database.

In short, the constraints that Doppio imposes target a middle ground
between structured and unstructued data. Humanists will find it just
unstructured enough for their work, and technologists will find it 
just structured enough for theirs.

Once the schema reaches a stable point, it can be used as-is with the 
provided database and API, or it can be used as the basis for a more 
structured relational database. Either way, the API makes it easy to 
access the underlying data for analysis, visualization, exploration, 
export, and preservation.

## The Doppio philosophy (WIP)

Doppio was written with a few core principles in mind.

### Put data first

Humanists have used databases produced by third parties for many decades
now, and as we create datasets of our own, we often look to familiar
interfaces for inspiration. In other words, we tend to take an 
**interface-first** approach to database design. But the interfaces of 
most databasees familiar to humanists rarely provide any useful 
information about the underlying data structures they use. As a result, 
interface-first approaches can lead to awkward data modeling decisions. 

To avoid the problems that result, it is useful to take a **data-first**
approach. But data-first approaches often require an abstract view of data 
that can become disconnected from the concrete questions that researchers 
want to answer. Staying focused on those questions while also keeping track 
of all the details required to maintain fifteen different many-to-many 
relations in a SQL schema is a challenge.

Doppio makes data-first approaches easier by guaranteeing a one-to-one
relationship between interfaces and data structures. This means that the
problem of designing a usable *interface* and the problem of designing
an effective *data model* are one and the same. The interface options that
Doppio provides are less flexible than those provided by generic web form
frameworks. This can impose frustrating constraints on researchers. The
trade-off is that every interface option that Doppio provides corresponds
to a reasonable data modeling decision. Once an acceptable interface is
found, the task of data modeling is done.

### Make data transparent

* Use human-readable JSON/YAML representations for input and output
* Match those representations to interface features and database structures
  in a one-to-one way
* Provide a built-in API, allowing the data to be used in flexible ways that
  are decoupled from the core data representation.
* ... more features in the future?

### Use self-documenting systems

* Ensure that if something doesn't make sense internally, it won't make sense
  in the interface either.
* Force JSON/YAML keys to be descriptive by using them as the basis for the
  data entry form field names.
* Put documentation strings in schemas and use them in the interface.

### Bake in good data practices

More to come...

### Create isomorphic data representations

More to come...

# Getting Started

## Local Setup

In all the following instructions, a value between square braces
(like this: `[some_value]`) is a placeholder for a value of your choice.
In some cases, this value should be a long random string generated by 
a cryptographically secure random number generator (CSRNG). Even
though this is a local testing set-up, we recommend that these be at
least 32 characters long, if only to establish good security habits!

### Settings

To begin with, you'll need appropriate `schema.py` and `setttings.py`
files. We recommend starting out by copying the provided template 
files, which you can then modify as you like. (For information about
creating customized schemas, [see here](https://docs.python-eve.org/en/stable/config.html#schema-definition).)
Inside the project root, run the following commands:

    $ cp settings-template.py settings.py
    $ cp schema-template.py schema.py

### Environment files

To strike a balance between convenience and security, Doppio currently
stores secrets and other environment-specific information in environment
variables, which are themselves read by `docker-compose` from environment
files. These reside in a hidden folder called `.envs`. To create that folder, 
run this command:

    $ mkdir .envs

Inside that folder, create a `.dockerignore` file to ensure that the secrets 
aren't recorded inside built docker images.

    $ cd .envs
    $ touch .dockerignore

Now, create another directory called `.local`:

    $ mkdir .local

In it, create three files, `.caddy`, `.eve` and `.mongo`:

    $ cd .local
    $ touch .caddy
    $ touch .eve
    $ touch .mongo

#### Caddy

Open the `.caddy` file in your preferred text editor, and paste the 
following line:

    DOMAIN_NAME=localhost

#### Mongo

In the `.mongo` file, paste the following lines:

    MONGO_INITDB_ROOT_USERNAME=root
    MONGO_INITDB_ROOT_PASSWORD=[root_password]

Then replace `[root_password]` with a random string generated
by a CSRNG. If you use a password manager like LastPass, you can 
use its password generator to create a suitable string.

#### Eve

In the `.eve` file, paste the following lines:

    EVE_MONGO_USER=[eve_user]
    EVE_MONGO_PASSWORD=[eve_password]
    EVE_TOKEN_SECRET=[eve_token_secret]
    EVE_DATABASE_NAME=[your_db_name]
    
Then make the following replacements:

* Replace `[eve_user]` with the database username that Eve should use. (Most likely something simple like `eve`.) 
* Replace `[eve_password]` with another random string. (This is the password for the Eve database account.)
* Replace `[eve_token_secret]` with another random string. (This is a random seed for authentication token generation.)
* Replace `[your_db_name]` with the name of the mongo database you'd like to use. This can be anything, but 
  it's a good idea to use a memorable, descriptive name.

At this point, your directory structure should look like this:

    doppio
    ├── .envs
    │   ├── .local
    │   │   ├── .mongo
    │   │   ├── .eve
    │   │   ├── .caddy
    │   ├── .dockerignore
    │
    ├── the rest of the app

### Building and launching the app

Now you can use `docker-compose` from the root directory.

    $ docker-compose build

Before launching the server, you'll also need to create a docker volume 
called `playbill-db`. This is where the database itself will be stored.
Creating it manually this way tells `docker-compose` not to delete it
automatically when `docker-compose down` is run!

    $ docker volume create --name=doppio-db

Now you can launch the server with:

    $ docker-compose up

The server should be up and running, and you can see the main form
as rendered here: https://localhost/home

To run the server in the background, stop it by hitting CTRL-C, and 
then restart it using the `-d` flag:

    $ docker-compose up -d

When the server is running in the background, you can view the logs
with this command:

    $ docker-compose logs

### Initializing the database

Although the server runs and displays a data entry form, the underlying database
still needs to be initialized. To do so, first find the MongoDB container.
While the server is running, use this command:

    $ docker ps

This will display get the list of running containers. Look for the container named
`doppio_mongo` and copy the container id, which will look something like `c1fb7f2a2b45`.

Then run the following command, replacing `[container_id]` with the id you copied:

    $ docker exec -it [container_id] /bin/sh

This will open a shell inside the MongoDB container. From there you can launch the
MongoDB client with this command: 

    # mongo -u root

You will be prompted for a password. Enter the password assigned to 
`MONGO_INITDB_ROOT_PASSWORD` inside the `.mongo` environment file.

Inside the shell, create the Eve database with this command, replacing
`[your_db_name]` with the name you assigned to `EVE_DATABASE_NAME`
inside the `.eve` environment file.

    '> use [your_db_name]

Next, create a new user with this command, replacing `[eve_user]` with 
the name you assigned to `EVE_MONGO_USER` and `[eve_password]` with 
the password you assigned to `EVE_MONGO_PASSWORD` (both inside the `.eve`
environment file).

    '> db.createUser({user: "[eve_user]", pwd: "[eve_password]", roles: ["readWrite"]})

You can exit the MongoDB client by pressing CTRL-D, and the MongoDB container shell
by pressing CTRL-D again.

### Creating admin users

Once you've initialized the database, you will need create a admin user for
the Doppio app itself. (Currently, there are only two kinds of users: public 
users with read-only access, and admin users with full access to the database. 
In the future, we hope to implement a more secure, permissions-based system.)

To create an admin user, run the following command:

    $ docker-compose run --rm eve flask createsuperuser

You will be prompted for a username and password, and the user will be created
automatically. You can then use the given username and password to log in to the 
website (by clicking on `Login` on the home page).

To create additional admin users, you can re-run the above command as many times 
as you like.

### Exporting and importing records

#### Exporting records from the database

This command will save each entry currently residing in the database as
its own .json file at the location specified by `[output_folder]`:

    $ docker-compose run --rm eve flask exportjson [output_folder]

#### Importing records into the database

This command will load json files into the database from the location
specified by `[input_folder]`:

    $ docker-compose run --rm eve flask readjson [input_folder]

### Creating database indices

To ensure that records are uniquely identified in a human-readable way,
you'll need to impose a database constraint on the field identified in 
`settings.py` for that purpose: `FILENAME_FIELD = 'myIdField`. (It's called
`FILENAME_FIELD` since this is also the field that will be used as the filename
when records are saved.) To do this, log into the MongoDB client as described
above in **Initializing the database**. Then create a unique index on `myIdField`
using the instructions here: https://docs.mongodb.com/manual/core/index-unique/

In the future we will add keyword searching, which will require a text search
index as well. Instructions for creating a text search index are 
here: https://docs.mongodb.com/manual/text-search/

## Production Setup

The process for creating a production server is almost identical to the above. 
There are only two real differences.

1. In the `.caddy` environemnt file, replace `DOMAIN_NAME=localhost` with
   your actual domain name. In production, Doppio must run on a domain
   or subdomain that you control. Running it on a server with a bare 
   IP address is not supported.
2. All commands starting with `docker-compose run` must start instead with
   `docker-compose run -f production.yml`. 

## Acknowledgements:

This repository contains code from the following repositories:
* https://github.com/senderle/playbill-database-arch
* https://github.com/senderle/pbdb-eve
* https://github.com/senderle/pbdb
* https://github.com/kingtimm/Eve-TokenAuth

And written by the following github users:
* https://github.com/annamarion
* https://github.com/scye09
* https://github.com/SiyuZheng
* https://github.com/ayhanefe
* https://github.com/kingtimm
* https://github.com/senderle

Doppio was created with support from the University of Pennsylvania Libraries, 
the Price Lab for Digital Humanities, and the Andrew W. Mellon Foundation
