
/******************
CURSOS
*************************************/
create table classrooms(
    code varchar(100),
    campus varchar(100),
    primary key (code,campus)
);
insert into classrooms(code,campus) values
    ('200','Paseo Colón'),
    ('200','Las Heras'),
    ('400','Las Heras'),
    ('400','Paseo Colón'),
    ('L4','Paseo Cólón');

create table semesters(
    
    academic_offer_release_date date,/* 1 */
    course_enrollment_beginning_date date,/* 2 */
    course_enrollment_ending_date date,/* 3 */
    classes_beginning_date date,/* 4 */
    course_disenrollment_ending_date date,/* 5 */
    exam_offer_release_date date,/* 6 */
    classes_ending_date date,/* 7 */
    exams_ending_date date,/* 8 */

    code varchar(10),/* 9 */

    primary key (code)
);
insert into semesters(
    code,

    academic_offer_release_date,
    course_enrollment_beginning_date,
    course_enrollment_ending_date,
    classes_beginning_date,
    course_disenrollment_ending_date,
    exam_offer_release_date,
    classes_ending_date,
    exams_ending_date
) values
    (
        '1c2019',

        '2019-02-01',
        '2019-03-01',
        '2019-03-08',
        '2019-03-10',
        '2019-03-17',
        '2019-05-05',
        '2019-05-08',
        '2019-06-08'
    ),(
        '1c2018',

        '2018-02-01',
        '2018-03-01',
        '2018-03-08',
        '2018-03-10',
        '2018-03-17',
        '2018-05-05',
        '2018-05-08',
        '2018-06-08'
    ),(
        '2c2018',

        '2018-07-01',
        '2018-08-01',
        '2018-08-08',
        '2018-08-10',
        '2018-08-17',
        '2018-10-05',
        '2018-10-08',
        '2019-02-28'
    ),(
        '2c2017',

        '2017-07-01',
        '2017-08-01',
        '2017-08-08',
        '2017-08-10',
        '2017-08-17',
        '2017-10-05',
        '2017-10-08',
        '2017-11-08'
    );

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
insert into courses(department_code,subject_code,semester,name,total_slots) values
    ('75','06','1c2018','Organización de Datos',200),
    ('75','07','1c2018','Algoritmos y Programacion III',120),
    ('75','52','2c2018','Taller Calónico 2c18',219),
    ('75','52','1c2018','Taller Calónico 1c18',119),
    ('75','52','2c2017','Taller Calónico 2c17',218),
    ('75','52','2c2017','Taller Calónico 2c17',218),
    ('75','52','2c2017','Taller Calónico 2c17',218),
    ('75','52','2c2017','Taller Calónico 2c17',218),
    ('75','52','2c2017','Taller Calónico 2c17',218),
    ('75','52','2c2017','Taller Calónico 2c17',218);
create table professors_roles(
    professor varchar(10),
    foreign key (professor) references professors(username) on delete cascade,

    course serial,
    foreign key (course) references courses(id) on delete cascade,

    role text,
    primary key (professor,course)
);
insert into users (name,surname,username,password,email,token,token_expiration) values
    ('Luis','Argerich','39111222','arar','cdetrincheria@gmail.com','2',now()+'5 minutes'),
    ('Carlos','Fontela','12345678','font','sofimorseletto@gmail.com','1',now()+'5 minutes'),
    ('Santiago','Gandolfo','98765432','ayu','santiago.v.gandolfo@gmail.com','3',now()+'5 minutes');

insert into professors(username) values
    ('39111222'),
    ('12345678'),
    ('98765432');

insert into professors_roles(professor,course,role) values 
    ('39111222',1,'Jefe de Cátedra'),
    ('12345678',2,'Jefe de Cátedra'),
    ('98765432',1,'JTP'),
    ('98765432',2,'Ayudante de cátedra'),
    ('39111222',3,'Jefe de Cátedra'),
    ('12345678',4,'Jefe de Cátedra'),
    ('12345678',5,'Jefe de Cátedra'),
    ('12345678',6,'Jefe de Cátedra'),
    ('12345678',7,'Jefe de Cátedra'),
    ('12345678',8,'Jefe de Cátedra'),
    ('12345678',9,'Jefe de Cátedra'),
    ('12345678',10,'Jefe de Cátedra');

create table days_of_week(
    day varchar(10),
    primary key (day)
);
insert into days_of_week(day) values 
    ('dom'), ('lun'), ('mar'), ('mie'), ('jue'), ('vie'), ('sab');

create table classroom_uses(
    id serial primary key,

    course serial,
    foreign key (course) references courses(id) on delete cascade,

    classroom_code varchar(100),
    classroom_campus varchar(100),
    foreign key (classroom_code,classroom_campus) references classrooms(code,campus),

    beginning time,
    ending time,

    day_of_week varchar(10),
    foreign key (day_of_week) references days_of_week(day),

    description text
);

insert into classroom_uses
(course,classroom_code,classroom_campus,beginning,ending,day_of_week,description) values
    (1,'400','Paseo Colón','19:00','22:00','lun','Teórico-Práctica Obligatoria'),
    (1,'400','Paseo Colón','19:00','22:00','jue','Teórico-Práctica Obligatoria'),
    (2,'200','Paseo Colón','16:00','19:00','lun','Teórica Obligatoria'),
    (2,'200','Las Heras','16:30','19:30','vie','Práctica Obligatoria'),
    (3,'200','Paseo Colón','16:00','19:00','lun','Teórica Obligatoria'),
    (3,'200','Las Heras','16:30','19:30','vie','Práctica Obligatoria'),
    (4,'200','Paseo Colón','16:00','19:00','lun','Teórica Obligatoria'),
    (4,'200','Las Heras','16:30','19:30','vie','Práctica Obligatoria'),
    (5,'400','Paseo Colón','16:00','19:00','lun','Teórica Obligatoria'),
    (5,'400','Las Heras','16:30','19:30','vie','Práctica Obligatoria'),
    (6,'400','Paseo Colón','16:00','19:00','lun','Teórica Obligatoria'),
    (6,'400','Las Heras','16:30','19:30','vie','Práctica Obligatoria'),
    (7,'400','Paseo Colón','16:00','19:00','lun','Teórica Obligatoria'),
    (7,'400','Las Heras','16:30','19:30','vie','Práctica Obligatoria'),
    (8,'400','Paseo Colón','16:00','19:00','lun','Teórica Obligatoria'),
    (8,'400','Las Heras','16:30','19:30','vie','Práctica Obligatoria'),
    (9,'400','Paseo Colón','16:00','19:00','lun','Teórica Obligatoria'),
    (9,'400','Las Heras','16:30','19:30','vie','Práctica Obligatoria'),
    (10,'400','Paseo Colón','16:00','19:00','lun','Teórica Obligatoria'),
    (10,'400','Las Heras','16:30','19:30','vie','Práctica Obligatoria');

/***************************************************
INSCRIPCIONES A CURSOS
****************************************************/
create table course_enrollments(
    course serial,
    foreign key (course) references courses(id) on delete cascade,

    student varchar(10),
    foreign key (student) references students(username),

    creation timestamp,
    accepted boolean,
    grade decimal,
    grade_date date,

    primary key (course,student)
);
insert into course_enrollments(course,student,creation,accepted,grade,grade_date) values
    (1,'99999','2017-06-8','true',9,'2018-01-05'),
    (2,'99999',now(),'true',-1,'2018-01-05'),
    (1,'97452',now(),'false',-1,'2018-01-05'),
    (3,'97452',now(),'false',-1,'2018-01-05'),
    (4,'97452',now(),'false',-1,'2018-01-05'),
    (5,'97452',now(),'false',-1,'2018-01-05'),
    (5,'99999',now(),'false',-1,'2018-01-05'),
    (5,'96107',now(),'false',-1,'2018-01-05'),
    (5,'96800',now(),'false',-1,'2018-01-05'),
    (6,'97452',now(),'false',8,'2018-01-05'),
    (7,'97452',now(),'false',8,'2018-01-05'),
    (8,'97452',now(),'false',8,'2018-01-05'),
    (9,'97452',now(),'false',8,'2018-01-05'),
    (10,'97452',now(),'false',8,'2018-01-05'),

    (6,'96800',now(),'false',8,'2018-01-05'),
    (7,'96800',now(),'false',8,'2018-01-05'),
    (8,'96800',now(),'false',8,'2018-01-05'),
    (9,'96800',now(),'false',8,'2018-01-05'),
    (10,'96800',now(),'false',8,'2018-01-05');



/***************************************
ADMINISTRADORES DE DEPARTAMENTO
*********************************************/


create table department_administrators(
    department_name text,

    username varchar(10),
    primary key (username),
    foreign key (username) references users(username)
);
insert into department_administrators (username,department_name) values ('gryn','Matemática'), ('39287287','Matemática'),('12345678','Computación');

/**********************************************
FINALES
**********************************************/
create table exams(
    semester_code varchar(10) references semesters(code),
    department_code varchar(10),
    subject_code varchar(10),
    examiner_username varchar(10) references professors(username),

    id serial primary key,

    classroom_code varchar(100),
    classroom_campus varchar(100),
    foreign key (classroom_code,classroom_campus) references classrooms(code,campus),

    beginning time,
    ending time,
    exam_date date
);
insert into exams (semester_code,department_code,subject_code,examiner_username,classroom_code,classroom_campus,beginning,ending,exam_date) values
    ('1c2018','75','07','12345678','200','Paseo Colón','19:00','22:00','2018-05-09'),
    ('1c2018','75','07','12345678','200','Paseo Colón','19:00','22:00','2018-05-16'),
    ('1c2018','75','07','12345678','200','Paseo Colón','19:00','22:00','2018-05-23'),
    ('1c2018','75','07','12345678','200','Paseo Colón','19:00','22:00','2018-05-24'),
    ('1c2018','75','07','12345678','200','Paseo Colón','19:00','22:00','2018-05-30'),



    ('2c2017','75','52','12345678','200','Paseo Colón','19:00','22:00','2017-12-01'),
    ('2c2017','75','52','12345678','200','Paseo Colón','19:00','22:00','2017-12-02'),
    ('2c2017','75','52','12345678','200','Paseo Colón','19:00','22:00','2017-12-03'),

    ('1c2018','75','52','12345678','200','Paseo Colón','19:00','22:00','2018-05-30'),
    ('2c2018','75','52','12345678','200','Paseo Colón','19:00','22:00','2018-12-01'),

    ('2c2018','75','08','12345678','200','Paseo Colón','19:00','22:00','2018-12-20');

create table exam_enrolments(
    exam_id serial,
    foreign key (exam_id) references exams(id) on delete cascade,

    student_username varchar(10),
    foreign key (student_username) references students(username),

    creation timestamp,
    grade decimal,
    grade_date date,

    primary key (exam_id,student_username),

    enrolment_type text
);
insert into exam_enrolments (exam_id,student_username,creation,grade,grade_date,enrolment_type) values
    (1,'97452',NOW(),-1,NOW(),'regular'),
    (2,'97452',NOW(),-1,NOW(),'libre'),
    (3,'97452',NOW(),-1,NOW(),'libre'),

    (5,'99999',NOW(),-1,NOW(),'regular'),
    (5,'96107',NOW(),-1,NOW(),'regular'),
    (5,'96800',NOW(),-1,NOW(),'regular');


/**********************************************
ENCUESTAS
**********************************************/
create table polls(
    course serial,
    student varchar(10),
    primary key (course,student),
    
    
    q1 integer,
    q2 integer,
    q3 integer,
    q4 integer,
    q5 integer,
    q6 integer,
    q7 integer,
    passed boolean,
    feedback text
);

insert into polls(course,student,passed,q1,q2,q3,q4,q5,q6,q7,feedback) values
    (1,'99999','t',1,2,3,4,5,6,7,'holaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'),
    (2,'99999','f',0,10,9,9,9,9,9,'buen curso'),
    (1,'97452','t',0,0,0,0,0,0,10,'mal curso'),
    (5,'99999','t',1,10,0,0,9,8,9,''),
    (5,'96107','t',1,2,3,4,5,6,7,''),
    (5,'96800','f',1,2,3,4,5,6,7,'');



/**********************************************
NOTIFICACIONES
**********************************************/

create table notifications(
    creation timestamp,
    title text,
    message text
);

insert into notifications(creation,message,title) values
    (NOW(),'titulo 1','mensaje 1'),
    (NOW(),'titulo 2','mensaje 2'),
    (NOW(),'titulo 3','mensaje 3');