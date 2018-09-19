create table tabla_prueba2 (
 texto text 
);
insert into tabla_prueba2 (texto) values ('Hola desde setup.sql');

create table users (
    username varchar(10),
    password varchar(30),
    email varchar(30),
    token varchar(30),
    token_expiration timestamp,

    primary key (username),
    unique (token)
);

insert into users (username,password,email,token,token_expiration) values
    ('jose','jojo','jose.jose@gmail.com','78',now()+'5 minutes');