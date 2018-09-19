docker-compose down
docker rmi mataco-server_app mataco-server_db mataco-server_test
docker-compose build
docker-compose up --exit-code-from test