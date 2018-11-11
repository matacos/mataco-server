cd db
heroku login
python generate_destroyer.py
sudo su - postgres -c "psql $(heroku config:get DATABASE_URL -a mataco2)" < destroy.sql
sudo su - postgres -c "psql $(heroku config:get DATABASE_URL -a mataco2)" < setup.sql
sudo su - postgres -c "psql $(heroku config:get DATABASE_URL -a mataco2)" < materias_deptos.sql
sudo su - postgres -c "psql $(heroku config:get DATABASE_URL -a mataco2)" < setup_postmaterias.sql

