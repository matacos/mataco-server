
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
    ('75','52','2c2018','Taller Calónico 2c18',218),
    ('75','52','1c2018','Taller Calónico 1c18',118),
    ('75','52','2c2017','Taller Calónico 2c17',217);
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
    (2,'200','Las Heras','16:30','19:30','vie','Práctica Obligatoria');

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
    (1,'97452',now(),'false',-1,'2018-01-05');





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
    ('1c2018','75','07','12345678','200','Paseo Colón','19:00','22:00','2018-03-17'),
    ('1c2018','75','07','12345678','200','Paseo Colón','19:00','22:00','2018-03-24'),
    ('1c2018','75','07','12345678','200','Paseo Colón','19:00','22:00','2018-03-31'),
    ('1c2018','75','07','12345678','200','Paseo Colón','19:00','22:00','2018-04-5'),
    ('1c2018','75','07','12345678','200','Paseo Colón','19:00','22:00','2018-04-12');

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
    (3,'97452',NOW(),-1,NOW(),'libre');