
create or replace view exam_enrolments_with_data(
    exams_with_data,
    student,
    exam_id,
    student_username,
    creation,
    grade,
    grade_date,
    enrolment_type
) as
select
    row_to_json(e) as exams_with_data,
    row_to_json(u) as student,
    ee.exam_id,
    ee.student_username,
    ee.creation,
    ee.grade,
    ee.grade_date,
    ee.enrolment_type
from
    exams_with_data as e,
    (select username,email,name,surname from users) as u,
    exam_enrolments as ee
where
    ee.exam_id = e.id
and u.username = ee.student_username
;