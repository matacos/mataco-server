DO $$
DECLARE course_id integer;
BEGIN
    delete from courses where id in(
        select c.id from professors_roles pr, courses as c where pr.professor ='12345678' and c.id=pr.course and c.department_code='75' and c.subject_code='07'
    );
    


insert into courses(department_code,subject_code,semester,name,total_slots) values
    ('75','07','1c2018','Algoritmos y Programacion III',120)
    returning id into course_id;

insert into users (name,surname,username,password,email,token,token_expiration) values
    ('Carlos','Fontela','12345678','font','sofimorseletto@gmail.com','1',now()+'5 minutes'),
    ('Santiago','Gandolfo','98765432','ayu','santiago.v.gandolfo@gmail.com','3',now()+'5 minutes')
    
    on conflict do nothing;

insert into professors_roles(professor,course,role) values 
    ('98765432',course_id,'Ayudante de cátedra'),
    ('12345678',course_id,'Jefe de Cátedra') on conflict do nothing;

delete from exams where examiner_username='12345678';

insert into exams (semester_code,department_code,subject_code,examiner_username,classroom_code,classroom_campus,beginning,ending,exam_date) values
    ('1c2018','75','07','12345678','200','Paseo Colón','19:00','22:00','2018-05-09'),
    ('1c2018','75','07','12345678','200','Paseo Colón','19:00','22:00','2018-05-16'),
    ('1c2018','75','07','12345678','200','Paseo Colón','19:00','22:00','2018-05-23'),
    ('1c2018','75','07','12345678','200','Paseo Colón','19:00','22:00','2018-05-24'),
    ('1c2018','75','07','12345678','200','Paseo Colón','19:00','22:00','2018-05-30');
END $$;