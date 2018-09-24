
create or replace view courses_with_data(
    department_code,
    subject_code,
    course,
    name,
    total_slots,
    professors,
    time_slots
) as
with
professors_full as (
    select course, role, username, email, name, surname
    from professors_roles pr
        join users u on (pr.professor=u.username)
),
professors_data as (
    select course, json_agg(json_build_object(
        'role', role,
        'username', username,
        'email', email,
        'name', name,
        'surname',surname
    )) as data
    from professors_full
    group by course
),
classroom_data as (
    select course, json_agg(json_build_object(
        'classroom_code',classroom_code,
        'classroom_campus',classroom_campus,
        'beginning',beginning,
        'ending',ending,
        'day_of_week',day_of_week,
        'description',description
    )) as data
    from classroom_uses 
    group by course
)
select 
    c.department_code as department_code,
    c.subject_code as subject_code,
    c.id as course,
    c.name as name,
    c.total_slots as total_slots,
    pd.data as professors,
    cd.data as time_slots
from courses as c,
    professors_data as pd,
    classroom_data as cd
where
    c.id=pd.course
and c.id=cd.course;
