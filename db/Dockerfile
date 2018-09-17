FROM postgres
COPY setup.sql /docker-entrypoint-initdb.d/2-setup.sql
COPY destroy.sql /docker-entrypoint-initdb.d/1-destroy.sql