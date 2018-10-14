
create or replace view exams_with_data(
    semester_code,
    department_code,
    subject_code,
    examiner_username,
    id,
    classroom_code,
    classroom_campus,
    beginning,
    ending,
    exam_date,
    subject,
    examiner
) as
select 
    e.semester_code,
    e.department_code,
    e.subject_code,
    e.examiner_username,
    e.id,
    e.classroom_code,
    e.classroom_campus,
    e.beginning,
    e.ending,
    e.exam_date,
    row_to_json(s) as subject,
    row_to_json(u) as examiner
    
from 
    exams as e,
    subjects_with_data as s,
    (select username,email,name,surname from users) as u
where
        e.subject_code=s.code
    and e.department_code=s.department_code
    and e.examiner_username=u.username
;