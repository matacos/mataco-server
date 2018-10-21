select 'drop table if exists "' || tablename || '" cascade;' from pg_tables;


create table tabla_prueba2 (
 texto text 
);
insert into tabla_prueba2 (texto) values ('Hola desde setup.sql');


/**********************
LOGIN
***********************/
create table users (
    username varchar(10),
    password varchar(30),
    email varchar(100),
    name text,
    surname text,
    token varchar(30),
    token_expiration timestamp,

    primary key (username),
    unique (token)
);

insert into users (name,surname,username,password,email,token,token_expiration) values
    ('José Ignacio','Sbruzzi','jose','jojo','jose.jose@gmail.com','78',now()+'5 minutes'),
    ('José Ignacio','Sbruzzi','97452','jojo','jose.jose@gmail.com','79',now()+'5 minutes'),
    ('Andorid No. 9','Cell','99999','9','nina.niner@gmail.com','99',now()+'5 minutes'),
    ('Sebastian','Grynberg','gryn','777','sebas@fi.uba.ar','18',now()+'5 minutes'),
    ('José Ignacio','Sbru','39287287','287','jose.sb@gmail.com','19',now()+'5 minutes');

/******************************************
ROLES
*******************************************/
create table students(
    username varchar(10),
    priority decimal,
    primary key (username),
    foreign key (username) references users(username)
);

create table administrators(
    username varchar(10),
    primary key (username),
    foreign key (username) references users(username)
);


create table professors(
    username varchar(10),
    primary key (username),
    foreign key (username) references users(username)
);

insert into students (username,priority) values ('jose',24),('97452',13),('99999',99);
insert into professors (username) values ('gryn'), ('39287287');

/*********************************************
MATERIAS
**********************************************/
create table degrees(
    id varchar(10),
    name text,
    primary key (id)
);
insert into degrees (id,name) values
    ('1','Ingeniería CIVIL'),
    ('2','Ingeniería INDUSTRIAL'),
    ('3','Ingeniería NAVAL Y MECÁNICA'),
    ('4','AGRIMENSURA'),
    ('5','Ingeniería MECÁNICA'),
    ('6','Ingeniería ELECTRICISTA'),
    ('7','Ingeniería ELECTRÓNICA'),
    ('8','Ingeniería QUÍMICA'),
    ('9','Licenciatura en ANÁLISIS DE SISTEMAS'),
    ('10','Ingeniería en INFORMÁTICA'),
    ('11','Ingeniería de ALIMENTOS');

create table degree_enrollments (
    degree varchar(10),
    student varchar(10),
    foreign key (degree) references degrees(id),
    foreign key (student) references students(username)
);
insert into degree_enrollments( degree, student) values 
    ('10','jose'),
    ('10','97452'),
    ('1','99999'),
    ('2','99999'),
    ('3','99999');


create table departments(
    code varchar(10),
    name text,
    primary key (code)
);

create table subjects(
    name text,
    code varchar(10),
    department_code varchar(10),
    primary key (code, department_code),
    foreign key (department_code) references departments(code)
);

create table credits(
    subject_code varchar(10),
    department_code varchar(10),

    degree varchar(10),
    amount int,
    primary key (degree,subject_code,department_code),
    foreign key (subject_code,department_code) references subjects(code,department_code)
);

create table requires_credits(
    department_code varchar(10),
    subject_code varchar(10),
    amount int,
    degree varchar(10),
    primary key (department_code,subject_code,degree),
    foreign key (department_code,subject_code) references subjects(department_code,code),
    foreign key (degree) references degrees(id)

);

create table requires (
    department_code varchar(10),
    subject_code varchar(10),
    dept_required varchar(10),
    code_required varchar(10),
    degree varchar(10),
    primary key (department_code, subject_code, dept_required, code_required, degree),
    foreign key (department_code, subject_code) references subjects(department_code,code),
    foreign key (dept_required,code_required) references subjects(department_code,code),
    foreign key (degree) references degrees(id)
);