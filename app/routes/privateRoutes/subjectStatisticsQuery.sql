with 
course_count as (
    select course, count(distinct student) as count
    from course_enrollments
    
    group by course
),
subject_count as (
    select department_code, subject_code, sum(cc.count) as total_students
    from 
        course_count as cc,
        courses as c,
        departments as d
    where
        c.id=cc.course
        /* ACÁ HAY QUE FILTRAR POR PERIODO Y POR DEPTO*/
    and c.semester = $1
    and c.department_code = d.code
    and d.name = $2
    group by department_code, subject_code
),
course_professors_count as (
    select course, count(distinct professor) as profesores
    from professors_roles
    group by course
),
full_course as (
    select 
        c.*, 
        coalesce(e.count,0) as total_students, 
        coalesce(ccc.profesores,0) as total_professors
    from 
        courses_with_data c 
        left outer join 
        course_count e 
        on(c.course=e.course)
        left outer join
        course_professors_count as ccc
        on (c.course=ccc.course),
        departments as d
    /* ACÁ HAY QUE FILTRAR POR PERIODO Y POR DEPTO*/
    where 
        c.semester = $1
    and c.department_code = d.code
    and d.name = $2
),
subjects_with_courses as (
    select department_code, subject_code, json_agg(json_build_object(
        'subject_name',subject_name,
        'course',course,
        'name',name,
        'total_slots',total_slots,
        'professors',professors,
        'time_slots',time_slots,
        'semester',semester,
        'occupied_slots',occupied_slots,
        'free_slots',free_slots,
        'total_students',total_students,
        'total_professors',total_professors
    )) as courses
    from full_course
    group by department_code, subject_code
),
almost_full_subjects as (
    select swd.*, coalesce(swc.courses,'[]'::json) as courses
    from 
        subjects_with_data  swd
        left outer join
        subjects_with_courses swc
        on (
            swd.department_code = swc.department_code
        and swd.code = swc.subject_code
        ),
        departments as d
        where swd.department_code = d.code
        and d.name = $2
        /* ACÁ VA UN WHERE DEPARTMENT_CODE PARA FILTRAR POR DEPTO */
),
professors_per_subject as (
    select c.subject_code, c.department_code, sum(cpc.profesores) as professors
    from 
        courses as c,
        course_professors_count as cpc
    where
        c.id=cpc.course
    group by c.subject_code, c.department_code
),
courses_per_subject as (
    select c.subject_code, c.department_code, count(distinct c.id) as total_courses
    from 
        courses as c
    group by c.subject_code, c.department_code
)
select 
    afs.*, 
    coalesce(pps.professors,0) as total_professors, 
    coalesce(cps.total_courses,0) as total_courses,
    coalesce(sc.total_students,0) as total_students
from
    almost_full_subjects as afs
    left outer join
    professors_per_subject pps on (
        pps.subject_code = afs.code
    and pps.department_code = afs.department_code
    )
    left outer join
    courses_per_subject cps on (
        cps.subject_code = afs.code
    and cps.department_code = afs.department_code
    )
    left outer join
    subject_count sc on (
        sc.subject_code = afs.code
    and sc.department_code = afs.department_code
    )
;