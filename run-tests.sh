docker build -t mataco-app-env -f app/env.Dockerfile app
docker build -t mataco-test-env -f test/env.Dockerfile test
cd db
python generate_destroyer.py
cd ..
docker-compose down
docker rmi mataco-server_app mataco-server_db mataco-server_test
docker-compose build
ENVIRONMENT_MODE=TEST docker-compose up --exit-code-from test