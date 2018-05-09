#sudo su - postgres -c "pg_dump $(heroku config:get DATABASE_URL -a mataco2)" > dump.sql
sudo su - postgres -c "psql $(heroku config:get DATABASE_URL -a mataco2)" < dump.sql