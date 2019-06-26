#docker exec mycontainer /bin/sh -c "cmd1;cmd2;...;cmdn"

from pymongo import MongoClient

client = MongoClient('mongo:27017')
client.admin.authenticate('root', 'JG*&(VU&6rsdfaeasf')
client.Paybill.add_user('user', 'user', roles=[{'role':'readWrite','db':'testdb'}])

# conn = Mongo();
# db = conn.getDB("Playbill");
#
# # db = connect("localhost:27017");
# db = db.getSiblingDB('Playbill')
# db.add_user('user', 'user', roles=[{'role':'readWrite','db':'testdb'}])
