# playbill-database

Originally forked from https://github.com/annamarion/playbill-database

Set up API for first time: 
First open mongodb shell and do: 
db.createUser({user: "user", pwd: "user", roles: ["readWrite"]})

User and pwd are set up in schema.py(MONGO_USERNAME and MONGE_PASSWORD) which can be changed to what user you create on the last step. The default authrization db is admin.

Cretete first account:

Then modify eve_tokenauth/domain.py line 9. Add POST method and comment line 305(display signup button) in template/functions.js. Now you can create some accounts using normal sign up process. (Since you need to login to add new account, so for the first account, we need to make 'POST' method public).

After creating a few admin accounts, delete POST method in public_methods. Uncomment line 301 in template/functions.js.
Now you can create new accounts in log in status with token authorization. 

token auth from https://github.com/kingtimm/Eve-TokenAuth


In third party geocode request, modify template/functions in line 151 to change the 'Access-Control-Allow-Origin' to remote domain.