with
chosen_courses as (
    select id
    from 
        courses as c,
        departments as d
    where 
        c.department_code = d.code
    and c.semester = $1 /*'1c2018'*/
    and d.name = $2 /*'Computación'*/
),
polls_result as (
    select 
        course, 
        avg(q1) as q1,
        avg(q2) as q2,
        avg(q3) as q3,
        avg(q4) as q4,
        avg(q5) as q5,
        avg(q6) as q6,
        avg(q7) as q7,
        avg(passed::integer) as passed
    from polls
    group by course
),
open_polls as (
    select 'q1' as question, q1 as score, course
    from polls_result
    union
    select 'q2' as question, q2 as score, course
    from polls_result
    union
    select 'q3' as question, q3 as score, course
    from polls_result
    union
    select 'q4' as question, q4 as score, course
    from polls_result
    union
    select 'q5' as question, q5 as score, course
    from polls_result
    union
    select 'q6' as question, q6 as score, course
    from polls_result
    union
    select 'q7' as question, q7 as score, course
    from polls_result
    union
    select 'passed' as question, passed as score, course
    from polls_result
),
grouped_questions as (
    select question, json_agg   (json_build_object(
        'course',course,
        'score',score
    )) as results
    from open_polls
    where course in (select id from chosen_courses)
    group by question
    
),
chosen_courses_with_data as (
    select *
    from courses_with_data
    where course in (select id from chosen_courses)
),
chosen_subjects_with_data as (
    select *
    from 
        subjects_with_data as s,
        courses as c
    where
        c.subject_code=s.code
    and c.department_code=s.department_code
    and c.id in (select id from chosen_courses)
),
chosen_subjects_feedback as (
    select course, json_agg(feedback) as feedback
    from polls
    where
        course in (select id from chosen_courses)
    and feedback is not null
    and not (feedback = '')
    group by course
)

/*select * from grouped_questions*/
/*select * from chosen_courses_with_data*/
/*select * from chosen_subjects_with_data*/
/*select * from chosen_subjects_feedback*/