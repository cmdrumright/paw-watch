#!/bin/bash
set -euo pipefail

echo "Deleting database..."
rm -f db.sqlite3

echo "Removing existing migrations..."
find . -path "*/migrations/0*.py" -delete

echo "Running makemigrations..."
pipenv run python manage.py makemigrations

echo "Running migrations..."
pipenv run python manage.py migrate

echo "Loading fixtures..."
pipenv run python manage.py loaddata users posts labels post_labels

echo "Done. Database is clean and ready."
