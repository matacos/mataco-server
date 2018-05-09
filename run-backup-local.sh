#sudo su - postgres -c "pg_dump $(heroku config:get DATABASE_URL -a mataco2)" > dump.sql
sudo su - postgres -c "pg_dump -h 127.0.0.1 -p 5444  -d postgres" > dump.sql