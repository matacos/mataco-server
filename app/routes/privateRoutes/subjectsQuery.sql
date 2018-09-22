with 
department_data as (
    select d.code, row_to_json(d) as data
    from departments as d
),
credits_data as (
    select subject_code,
        department_code,
        json_agg(json_build_object('amount',amount,'degree',degree)) as data
    from credits
    where degree = $1
    group by subject_code,department_code
),
common_data as (
    select 
        s.name,
        s.code,
        s.department_code,
        dep.data as department,
        cd.data as credits
    from 
        subjects as s,
        credits_data as cd,
        department_data as dep
    where
            dep.code = s.department_code
        and cd.subject_code=s.code
        and cd.department_code=s.department_code
),
credits_required_data as (
    select 
        subject_code,
        department_code,
        json_agg(json_build_object('amount',amount,'degree',degree)) as data
    from requires_credits
    where degree= $1
    group by subject_code,department_code
),

complete_data as (
    select
        department_code,
        code,
        row_to_json(common_data) as data 
    from common_data
        
),
subjects_requirements_data as (
    select 
        r.subject_code,
        r.department_code,
        json_agg(json_build_object(
            'degree',r.degree,
            'subject_data',cd.data

        )) as data
    from 
        requires as r,
        complete_data as cd
    where
        cd.department_code=r.dept_required
    and cd.code=r.code_required
    and r.degree= $1
    group by r.subject_code, r.department_code

)


select 
    cd.name, 
    cd.code, 
    cd.department_code, 
    cd.department, 
    cd.credits, 
    coalesce(crd.data,'[]') as required_credits,
    coalesce(srd.data,'[]') as required_subjects
from 
    common_data as cd 
        left outer join credits_required_data as crd on (
            cd.code = crd.subject_code
        and cd.department_code = crd.department_code
        )
        left outer join subjects_requirements_data as srd on (
            cd.code = srd.subject_code
        and cd.department_code = srd.department_code
        )
;
