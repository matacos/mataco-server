FROM postgres
COPY destroy.sql /docker-entrypoint-initdb.d/1-destroy.sql
COPY setup.sql /docker-entrypoint-initdb.d/2-setup.sql
COPY setup.sql /docker-entrypoint-initdb.d/3-materias.sql
