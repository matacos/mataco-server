cd db
heroku login
sudo su - postgres -c "psql $(heroku config:get DATABASE_URL -a mataco)" < destroy.sql
sudo su - postgres -c "psql $(heroku config:get DATABASE_URL -a mataco)" < materias_deptos.sql
sudo su - postgres -c "psql $(heroku config:get DATABASE_URL -a mataco)" < setup.sql