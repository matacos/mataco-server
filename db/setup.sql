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

create table students(
    username varchar(10),
    degree varchar(10),
    primary key (username),
    foreign key (username) references users(username)
);

create table administrators(
    username varchar(10),
    primary key (username),
    foreign key (username) references users(username)
);

create table department_administrators(
    username varchar(10),
    primary key (username),
    foreign key (username) references users(username)
);

create table professors(
    username varchar(10),
    primary key (username),
    foreign key (username) references users(username)
);

insert into users (username,password,email,token,token_expiration) values
    ('jose','jojo','jose.jose@gmail.com','78',now()+'5 minutes');
insert into users (username,password,email,token,token_expiration) values
    ('97452','jojo','jose.jose@gmail.com','79',now()+'5 minutes');
insert into users (username,password,email,token,token_expiration) values
    ('gryn','777','sebas@fi.uba.ar','18',now()+'5 minutes');

insert into students (username,degree) values ('jose','1');
insert into students (username,degree) values ('97452','1');
insert into professors (username) values ('gryn');
insert into department_administrators (username) values ('gryn');