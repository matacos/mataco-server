
create or replace view courses_with_data(
    department_code,
    subject_code,
    course,
    name,
    total_slots,
    professors,
    time_slots,
    semester
) as
with
professors_full as (
    select course, role, username, email, name, surname
    from professors_roles pr
        join users u on (pr.professor=u.username)
),
professors_partial_data as (
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
all_courses_ids as (
    select id from courses
),
professors_data as (
    select acid.id as course, coalesce(pd.data,'[]') as data
    from professors_partial_data as pd
        right outer join all_courses_ids acid on (acid.id=pd.course)
),
some_classroom_data as (
    select course, json_agg(json_build_object(
        'id',id,
        'classroom_code',classroom_code,
        'classroom_campus',classroom_campus,
        'beginning',beginning,
        'ending',ending,
        'day_of_week',day_of_week,
        'description',description
    )) as data
    from classroom_uses 
    group by course
),
classroom_data as (
    select acid.id as course, coalesce(cd.data, '[]') as data
    from some_classroom_data as cd
        right outer join all_courses_ids acid on (acid.id = cd.course)
),
some_slots_data as (
    select course, count(distinct student) as occupied_slots 
    from course_enrollments 
    group by course
),
slots_data as (
    select acid.id as course, coalesce(sd.occupied_slots, 0) as occupied_slots
    from some_slots_data as sd
        right outer join all_courses_ids acid on (acid.id = sd.course)
)
select 
    c.department_code as department_code,
    c.subject_code as subject_code,
    c.id as course,
    c.name as name,
    c.total_slots as total_slots,
    pd.data as professors,
    cd.data as time_slots,
    c.semester as semester,
    sd.occupied_slots as occupied_slots,
    c.total_slots - sd.occupied_slots as free_slots
from courses as c,
    professors_data as pd,
    classroom_data as cd,
    slots_data as sd
where
    c.id=pd.course
and c.id=cd.course
and c.id=sd.course
;
