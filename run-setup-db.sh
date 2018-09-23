cd db
heroku login
python generate_destroyer.py
sudo su - postgres -c "psql $(heroku config:get DATABASE_URL -a mataco)" < destroy.sql
sudo su - postgres -c "psql $(heroku config:get DATABASE_URL -a mataco)" < setup.sql
sudo su - postgres -c "psql $(heroku config:get DATABASE_URL -a mataco)" < materias_deptos.sql