
# Run the backup routine in a disposable container.
docker-compose -f production.yml run --rm eve flask exportjson data/backups/latest/

# Commit and push changes to git.
git add data/backups/latest
git commit -m "latest backup"
git push
