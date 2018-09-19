cd app
heroku login
heroku container:login
heroku container:push web -a mataco
heroku container:release web -a mataco
heroku open -a mataco