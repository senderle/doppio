# playbill-database

Originally forked from https://github.com/annamarion/playbill-database


First open mongodb shell and do:
db.createUser({user: "user", pwd: "user", roles: ["readWrite"]})
User and pwd is set up in schema.py(MONGO_USERNAME and MONGE_PASSWORD) which can be changed. The default authrization db is admin.

Then create some accounts using normal sign up process. Then modify js code to hide the signup page for non-login user.