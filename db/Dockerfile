FROM postgres
COPY destroy.sql /docker-entrypoint-initdb.d/1-destroy.sql
COPY setup.sql /docker-entrypoint-initdb.d/2-setup.sql
COPY materias_deptos.sql /docker-entrypoint-initdb.d/3-materias_deptos.sql
COPY setup_postmaterias.sql /docker-entrypoint-initdb.d/4-setup_postmaterias.sql
