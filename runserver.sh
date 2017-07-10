#!/bin/bash

# wait for mysql to be ready
nc -z db 27017
n=$?
while [ $n -ne 0 ]; do
    sleep 1
    nc -z db 27017
    n=$?
done

# python manage.py createsuperuser
python run.py runserver 0.0.0.0:5000
