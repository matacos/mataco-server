const request=require("request-promise-native")
const chai = require("chai")
chai.use(require("chai-json-schema-ajv"))
const expect=chai.expect

function url(str){
    return "http://app:3000/api"+str
}


async function login(username,password){
    const body={
        username,
        password
    }
    const response=await request({
        uri:url("/login"),
        body,
        method:"POST",
        json:true
    })
    return response
}
async function requestWithAuth(username,password,verb,uriPart,body){
    const loginResponse=await login(username,password)
    const token=loginResponse.token
    const response=await request({
        uri:url(uriPart),
        method:verb,
        headers:{
            "Authorization":"bearer "+token
        },
        body:body,
        simple:false,
        resolveWithFullResponse:true,
        json:true
    })
    return response

}

describe("Academic history",()=>{
    function get(url){
        return requestWithAuth("97452","jojo","GET",url)
    }
    function post(url,body){
        return requestWithAuth("97452","jojo","POST",url,body)
    }
    function put(url,body){
        return requestWithAuth("97452","jojo","PUT",url,body)
    }

    it("pass a course",async()=>{
        
        await put("/cursadas/5-97452",{
            accepted:"true",
            grade:"8"
        })
        const r = await get("/inscripciones_cursos?estudiante=97452&semester=any")
        /*
        console.log("#####################")
        console.log("#####################")
        console.log(r.body.courseInscriptions.filter((c)=>c.course.course=5)[0])
        console.log("#####################")
        console.log("#####################")
        */
    })

    it("enrol to all exams from 75.52 after the course",async()=>{
        
        const r = await get("/finales?cod_departamento=75&cod_materia=52&since=any")
        let examBodies=r.body.exams.map((x)=>{
            return {
                "exam_id":x.id,
                "enrolment_type":"regular",
                "student":"97452"
            }
        })
        for(let examBody of examBodies){
            await post("/inscripciones_final",examBody)
        }
    })

    it("enrol to all exams from 75.08",async()=>{
        
        const r = await get("/finales?cod_departamento=75&cod_materia=08&since=any")
        let examBodies=r.body.exams.map((x)=>{
            return {
                "exam_id":x.id,
                "enrolment_type":"libre",
                "student":"97452"
            }
        })
        for(let examBody of examBodies){
            await post("/inscripciones_final",examBody)
        }
    })
    it("pass an exam from 2c2017. This is included in academic history.",async()=>{
        //precondición
        const enrolments = await get("/inscripciones_final?estudiante=97452&since=any")
        let chosenExam = null
        for(let e of enrolments.body.exam_enrolments){
            if(e.exam.subject.code=="52" && e.exam.semester_code=="2c2017"){
                chosenExam=e.exam
            }
        }
        await put("/inscripciones_final/"+chosenExam.id+"-"+"97452",{
            grade:8,
            grade_date:"2018-05-10"
        })

        //postcondiciones
        const response = await requestWithAuth("97452","jojo","GET","/97452/historial_academico")
        expect(response.body.history_items).lengthOf(1)
        expect(response.body.history_items[0].grade).to.be.equal("8")

        //deshacer
        await put("/inscripciones_final/"+chosenExam.id+"-"+"97452",{
            grade:-1,
            grade_date:"2018-05-10"
        })
    })

    it("pass an exam from 2c2018. This is included in academic history.",async()=>{
        //precondición
        const enrolments = await get("/inscripciones_final?estudiante=97452&since=any")
        let chosenExam = null
        for(let e of enrolments.body.exam_enrolments){
            if(e.exam.subject.code=="52" && e.exam.semester_code=="2c2018"){
                chosenExam=e.exam
            }
        }
        await put("/inscripciones_final/"+chosenExam.id+"-"+"97452",{
            grade:8,
            grade_date:"2018-05-10"
        })

        //postcondiciones
        const response = await requestWithAuth("97452","jojo","GET","/97452/historial_academico")
        expect(response.body.history_items).lengthOf(1)
        expect(response.body.history_items[0].grade).to.be.equal("8")

        //deshacer
        await put("/inscripciones_final/"+chosenExam.id+"-"+"97452",{
            grade:-1,
            grade_date:"2018-05-10"
        })
    })

    it("fail 2 exams from 2c2017, pass one from 1c2018. This is included in academic history.",async()=>{
        //precondición
        const enrolments = await get("/inscripciones_final?estudiante=97452&since=any")
        let exams2017 = []
        let exam2018=null
        for(let e of enrolments.body.exam_enrolments){
            if(e.exam.subject.code=="52" && e.exam.semester_code=="2c2017"){
                exams2017.push(e.exam)
            }
            if(e.exam.subject.code=="52" && e.exam.semester_code=="1c2018"){
                exam2018 = e.exam
            }
        }
        for(let e of exams2017.slice(0,2)){
            await put("/inscripciones_final/"+e.id+"-"+"97452",{
                grade:2,
                grade_date:"2018-05-10"
            })
        }
        await put("/inscripciones_final/"+exam2018.id+"-"+"97452",{
            grade:5,
            grade_date:"2018-05-10"
        })
        

        //postcondiciones
        const response = await requestWithAuth("97452","jojo","GET","/97452/historial_academico")
        expect(response.body.history_items).lengthOf(1)
        expect(response.body.history_items[0].grade).to.be.equal("5")

        //deshacer
        for(let e of exams2017.concat([exam2018])){
            await put("/inscripciones_final/"+e.id+"-"+"97452",{
                grade:-1,
                grade_date:"2018-05-10"
            })
        }
        
    })

    it("Materia desaprobada en las 3 oportunidades de 2c2017.",async()=>{
        //precondición
        const enrolments = await get("/inscripciones_final?estudiante=97452&since=any")
        let exams2017 = []
        for(let e of enrolments.body.exam_enrolments){
            if(e.exam.subject.code=="52" && e.exam.semester_code=="2c2017"){
                exams2017.push(e.exam)
            }
        }
        for(let e of exams2017){
            await put("/inscripciones_final/"+e.id+"-"+"97452",{
                grade:2,
                grade_date:"2018-05-10"
            })
        }
        

        //postcondiciones
        const response = await requestWithAuth("97452","jojo","GET","/97452/historial_academico")
        expect(response.body.history_items).lengthOf(1)
        expect(response.body.history_items[0].grade).to.be.equal("2")
        expect(response.body.history_items[0].exam.exam_date.includes("2017-12-03")).to.true

        //deshacer
        for(let e of exams2017){
            await put("/inscripciones_final/"+e.id+"-"+"97452",{
                grade:-1,
                grade_date:"2018-05-10"
            })
        }
        
    })

    it("Materia vencida",async()=>{
        //postcondiciones
        const response = await requestWithAuth("97452","jojo","GET","/97452/historial_academico?now=2019-04-08")
        console.log("$$$$$$$$$$$$$$$$$$$$$$$")
        console.log("$$$$$$$$$$$$$$$$$$$$$$$")
        console.log("$$$$$$$$$$$$$$$$$$$$$$$")
        console.log(response.body)
        console.log("$$$$$$$$$$$$$$$$$$$$$$$")
        console.log("$$$$$$$$$$$$$$$$$$$$$$$")
        console.log("$$$$$$$$$$$$$$$$$$$$$$$")
        expect(response.body.history_items).lengthOf(0)
    })

    it("Materia desaprobada 1 vez sola en el plazo, pero vista en noviembre/diciembre 2018.",async()=>{
        //precondición
        const enrolments = await get("/inscripciones_final?estudiante=97452&since=any")
        let exams2017 = []
        for(let e of enrolments.body.exam_enrolments){
            if(e.exam.subject.code=="52" && e.exam.semester_code=="2c2017"){
                exams2017.push(e.exam)
            }
        }
        for(let e of exams2017.slice(0,1)){
            await put("/inscripciones_final/"+e.id+"-"+"97452",{
                grade:2,
                grade_date:"2018-05-10"
            })
        }
        

        //postcondiciones
        const response = await requestWithAuth("97452","jojo","GET","/97452/historial_academico")
        expect(response.body.history_items).lengthOf(0)

        //deshacer
        for(let e of exams2017){
            await put("/inscripciones_final/"+e.id+"-"+"97452",{
                grade:-1,
                grade_date:"2018-05-10"
            })
        }
    })

    it("Materia desaprobada 1 vez sola en el plazo, pero vista en 1c2019.",async()=>{
        //precondición
        const enrolments = await get("/inscripciones_final?estudiante=97452&since=any")
        let exams2017 = []
        for(let e of enrolments.body.exam_enrolments){
            if(e.exam.subject.code=="52" && e.exam.semester_code=="2c2017"){
                exams2017.push(e.exam)
            }
        }
        for(let e of exams2017.slice(0,1)){
            await put("/inscripciones_final/"+e.id+"-"+"97452",{
                grade:2,
                grade_date:"2018-05-10"
            })
        }
        

        //postcondiciones
        const response = await requestWithAuth("97452","jojo","GET","/97452/historial_academico?now=2019-03-15")
        expect(response.body.history_items).lengthOf(1)
        expect(response.body.history_items[0].grade).to.be.equal("2")

        //deshacer
        for(let e of exams2017){
            await put("/inscripciones_final/"+e.id+"-"+"97452",{
                grade:-1,
                grade_date:"2018-05-10"
            })
        }
    })

    it("Rinde libre y aprueba",async()=>{
        //precondición
        const enrolments = await get("/inscripciones_final?estudiante=97452&since=any")
        let examsOs = []
        for(let e of enrolments.body.exam_enrolments){
            if(e.exam.subject.code=="08"){
                examsOs.push(e.exam)
            }
        }
        for(let e of examsOs.slice(0,1)){
            await put("/inscripciones_final/"+e.id+"-"+"97452",{
                grade:10,
                grade_date:"2018-05-10"
            })
        }
        

        //postcondiciones
        const response = await requestWithAuth("97452","jojo","GET","/97452/historial_academico?now=2019-03-15")
        expect(response.body.history_items).lengthOf(1)
        expect(response.body.history_items[0].grade).to.be.equal("10")

        //deshacer
        for(let e of examsOs){
            await put("/inscripciones_final/"+e.id+"-"+"97452",{
                grade:-1,
                grade_date:"2018-05-10"
            })
        }
    })

    it("Rinde libre y desaprueba",async()=>{
        //precondición
        const enrolments = await get("/inscripciones_final?estudiante=97452&since=any")
        let examsOs = []
        for(let e of enrolments.body.exam_enrolments){
            if(e.exam.subject.code=="08"){
                examsOs.push(e.exam)
            }
        }
        for(let e of examsOs.slice(0,1)){
            await put("/inscripciones_final/"+e.id+"-"+"97452",{
                grade:2,
                grade_date:"2018-05-10"
            })
        }
        

        //postcondiciones
        const response = await requestWithAuth("97452","jojo","GET","/97452/historial_academico?now=2019-03-15")
        expect(response.body.history_items).lengthOf(1)
        expect(response.body.history_items[0].grade).to.be.equal("2")

        //deshacer
        for(let e of examsOs){
            await put("/inscripciones_final/"+e.id+"-"+"97452",{
                grade:-1,
                grade_date:"2018-05-10"
            })
        }
    })
})