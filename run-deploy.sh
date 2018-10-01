cd app
heroku login
heroku container:login
heroku container:push web -a mataco2
heroku container:release web -a mataco2
heroku open -a mataco2