with
my_enrolments as (
    select course from course_enrollments where student like '97452'
),
course_ids as (
    select id from courses
),
enroled_courses as (
    select id, coalesce(course,0) > 0 as enroled
    from
        course_ids as cids
            left outer join my_enrolments as me on (
                cids.id = me.course
            )
),
only_approved_courses as (
    select course 
    from course_enrollments 
    where 
        student like '97452'
    and grade >= 4
),
approved_courses as (
    select id, coalesce(course,0) > 0 as approved_course
    from
        course_ids as cids
            left outer join only_approved_courses as ac on (
                cids.id = ac.course
            )
),
enroled_subjects_part as (
    select 
        c.department_code, 
        c.subject_code as code, 
        bool_or(ec.enroled) as enroled,
        bool_or(ac.approved_course) as approved_course
    from 
        courses as c,
        enroled_courses as ec,
        approved_courses as ac
    where 
        c.id=ec.id
    and c.id=ac.id
    group by c.department_code, c.subject_code
),
approved_subjects_only as (
    select department_code as department_code, subject_code as code, bool_or(enr.grade>=4) as approved_exam
    from exams as ex
        left outer join exam_enrolments as enr on (
            ex.id = enr.exam_id
        )
    where student_username like '97452'
    group by department_code, subject_code
),
enroled_subjects as (
    select 
        s.department_code, 
        s.code, 
        coalesce(esp.enroled,'f') as enroled,
        coalesce(esp.approved_course,'f') as approved_course,
        coalesce(aso.approved_exam,'f') as approved_exam
    from
        subjects as s
            left outer join enroled_subjects_part as esp on (
                    s.department_code = esp.department_code
                and s.code = esp.code
            )
            left outer join approved_subjects_only as aso on (
                    s.department_code = aso.department_code
                and s.code = aso.code
            )
)
select * from enroled_subjects_part;