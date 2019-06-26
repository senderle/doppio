# playbill-database

Originally forked from https://github.com/annamarion/playbill-database

Set up API for first time:
First open mongodb shell and do:
db.createUser({user: "user", pwd: "user", roles: ["readWrite"]})

User and pwd are set up in schema.py(MONGO_USERNAME and MONGE_PASSWORD) which can be changed to what user you create on the last step. The default authrization db is admin.

Cretete first account:

Then modify eve_tokenauth/domain.py line 9. Add POST method and comment line 265(display signup button) in template/functions.js. Now you can create some accounts using normal sign up process. (Since we need to login to add new account, so for the first account, we need to make 'POST' method public).

After creating a few admin accounts, delete POST method in public_methods. Uncomment line 265 in template/functions.js.
Now you can create new accounts in log in status with token authorization.

token auth from https://github.com/kingtimm/Eve-TokenAuth


-------------------
LOCAL SETUP
-------
In the root directory, create a new folder called .envs:

    $ mkdir .envs

Inside, create a .dockerignore file:

    $ touch .dockerignore

Now, create another directory called .local:

    $ mkdir .local

In it, create three files, .caddy, .eve and .mongo:

    $ touch .caddy
    $ touch .eve
    $ touch .mongo

In .caddy, put
```
    DOMAIN_NAME=localhost
```

In .mongo, put
```
    MONGO_INITDB_ROOT_USERNAME=root
    MONGO_INITDB_ROOT_PASSWORD=your_randomized_password
```
`MONGO_INITDB_ROOT_PASSWORD` should be set to a randomized password.

In .eve, put
```
    EVE_MONGO_USER=user
    EVE_MONGO_PASSWORD=user
```

Your current directory in `.envs` should be
```bash
├── .envs
│   ├── .local
│   │   ├── .mongo
│   │   ├── .eve
│   │   ├── .caddy
│   ├── .dockerignore
│
├── the rest of the app
```

Now, build docker-compose from the root directory:

    $ docker-compose build

Before launching the server, we have to create a docker volume called
`playbill-db` as our database with the command below:

    $ docker volume create --name=playbill-db

Now we can launch the server with:

    $ docker-compose up

The server should be up and running. To access the server, use https://localhost.
The homepage is at https://localhost/home


ACCESS TO DATABASE AND SINGUP
-------
Open a new terminal tab. In it, type:

    $ docker ps

to get the list of running containers, and copy the Container ID (the first code)
of the container with the name `pdb_mongo`.

Now, type:

    $ docker exec -it (Container ID) /bin/sh

Where (Container ID) is the id you just copied.

Now, launch the mongo shell inside the docker container as the root user with
the command

    # mongo -u root

You will be prompted for a password. Enter the randomized password you inputted
for `MONGO_INITDB_ROOT_PASSWORD` inside `.mongo`.

Inside the shell, open the relevant database by:

    '> use Playbill

And create a new user with the command :

    '> db.createUser({user: "user", pwd: "user", roles: ["readWrite"]})

You can now close the shell.

In order to add a user to login to the website, first find the container id of
the `pdb_eve` container with the following call:

    $ docker ps

Copy the container id and run the following command:

    $ docker exec -it (Container ID) flask createsuperuser

Enter your username and password and the user will be created. You can create as
many users as desired with this command.

From now on, you should be able to sign in using the username and password(s)
that you created.
