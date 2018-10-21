create or replace view students_with_degrees(
    username,
    email,
    name,
    surname,
    degrees
) as
with
students_data as (
    select u.*
    from 
        users as u,
        students as s
    where
        s.username = u.username
),
students_degrees as (
    select 
        e.student,
        json_agg(row_to_json(d)) as degrees
    from
        degree_enrollments as e,
        degrees as d
    where
        d.id=e.degree
    group by e.student   
)
select 
    data.username,
    data.email,
    data.name,
    data.surname,
    degrees.degrees,
    s.priority
from
    students_data as data,
    students_degrees as degrees,
    students as s
where
    data.username = degrees.student
and data.username = s.username
;