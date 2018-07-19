# playbill-database

Originally forked from https://github.com/annamarion/playbill-database

Set up API for first time: 
First open mongodb shell and do: 
db.createUser({user: "user", pwd: "user", roles: ["readWrite"]})

User and pwd are set up in schema.py(MONGO_USERNAME and MONGE_PASSWORD) which can be changed to what user you create on the last step. The default authrization db is admin.

Then modify eve_tokenauth/domain.py line 9. Add POST method. Now you can create some accounts using normal sign up process. (Since you need to login to add new account, so for the first account, we need to make 'POST' method public).

After creating a few admin accounts, delete POST method in public_methods.
Now you can create new accounts in log in status with token authorization. 

token auth from https://github.com/kingtimm/Eve-TokenAuth