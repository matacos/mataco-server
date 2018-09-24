
/******************
CURSOS
*************************************/
create table classrooms(
    code varchar(100),
    campus varchar(10),
    primary key (code,campus)
);
insert into classrooms(code,campus) values
    ('200','PC'),
    ('200','LH'),
    ('400','PC'),
    ('L4','PC');

create table semesters(
    code varchar(10),
    classes_beginning timestamp,
    classes_ending timestamp,
    primary key (code)
);
insert into semesters(code, classes_beginning,classes_ending) values
    ('1c2018','2018-01-01','2018-06-01'),
    ('2c2018','2018-06-02','2019-01-01'),
    ('2c2017','2018-06-02','2019-01-01');

create table courses(
    department_code varchar(10),
    subject_code varchar(10),
    foreign key (department_code,subject_code) references subjects(department_code,code),


    semester varchar(10),
    foreign key (semester) references semesters(code),

    name text,
    total_slots int,
    id serial primary key
);
insert into courses(id,department_code,subject_code,semester,name,total_slots) values
    (1,'75','07','1c2018','Datos Argerich',200),
    (2,'75','06','1c2018','Algoritmos 3 Fontela',120);
create table professors_roles(
    professor varchar(10),
    foreign key (professor) references professors(username) on delete cascade,

    course serial,
    foreign key (course) references courses(id) on delete cascade,

    role text,
    primary key (professor,course)
);
insert into users (name,surname,username,password,email,token,token_expiration) values
    ('Luis','Argerich','39111222','arar','largerich@gmail.com','2',now()+'5 minutes'),
    ('Carlos','Fontela','12345678','font','fontela@gmail.com','1',now()+'5 minutes'),
    ('Santiago','Gandolfo','98765432','ayu','ayudante@gmail.com','3',now()+'5 minutes');

insert into professors(username) values
    ('39111222'),
    ('12345678'),
    ('98765432');

insert into professors_roles(professor,course,role) values 
    ('39111222',1,'Jefe de Cátedra'),
    ('12345678',2,'Jefe de Cátedra'),
    ('98765432',1,'JTP'),
    ('98765432',2,'Ayudante de cátedra');

create table days_of_week(
    day varchar(10),
    primary key (day)
);
insert into days_of_week(day) values 
    ('dom'), ('lun'), ('mar'), ('mie'), ('jue'), ('vie'), ('sab');

create table classroom_uses(
    course serial,
    foreign key (course) references courses(id),

    classroom_code varchar(100),
    classroom_campus varchar(10),
    foreign key (classroom_code,classroom_campus) references classrooms(code,campus),

    beginning time,
    ending time,

    day_of_week varchar(10),
    foreign key (day_of_week) references days_of_week(day),

    description text
);

insert into classroom_uses
(course,classroom_code,classroom_campus,beginning,ending,day_of_week,description) values
    (1,'400','PC','19:00','22:00','lun','teórico-práctica obligatoria'),
    (1,'400','PC','19:00','22:00','jue','teórico-práctica obligatoria'),
    (2,'200','PC','16:00','19:00','lun','teórica obligatoria'),
    (2,'200','LH','16:30','19:30','vie','práctica obligatoria');