function mountRoutes(app,db,schemaValidation){

}

async function getSemesterFromDate(db,date){
    const result = await db.query(`
    select * 
    from semesters
    where 
        course_enrollment_beginning_date < $1
    and $1 < exams_ending_date
    ;
    `,
    [date])
    return result.rows
}

module.exports={
    mountRoutes:mountRoutes,
    getSemesterFromDate:getSemesterFromDate
}