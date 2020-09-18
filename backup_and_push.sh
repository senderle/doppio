# Move most recent data to archive.
mv -f data/backups/latest/* data/backups/dated/

# Run the backup routine in a disposable container.
docker-compose -f production.yml run --rm eve flask exportjson data/backups/latest/`date +'%Y-%m-%d'`

# Commit and push changes to git.
git add data/backups/latest data/backups/dated
git commit -m "latest backup"
git push
