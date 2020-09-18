# Move most recent data to archive.
mv -f backups/latest/* backups/dated/

# Run the backup routine in a disposable container.
docker-compose -f production.yml run --rm eve flask exportjson backups/latest/`date +'%Y-%m-%d'`

# Commit and push changes to git.
git add backups/latest backups/dated
git commit -m "latest backup"
git push
