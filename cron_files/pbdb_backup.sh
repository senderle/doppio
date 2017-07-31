mongodump --db "eve" --out /backup
bsondump /backup/eve/ephemeralRecord.bson > /backup/ephemeralRecord.json

git add ephemeralRecord.json
git commit -m "backup current playbill database"
#git push https://[username]:[pw]@github.com/[username]/[repository name].git [branch name]
