for f in seeding/*
do
    echo "$f"
    sudo su - postgres -c "psql $(heroku config:get DATABASE_URL -a mataco2)" < $f
done