cd db
python generate_destroyer.py
cd ..
docker-compose down
docker-compose build
docker-compose up