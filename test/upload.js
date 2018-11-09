const Readable = require('stream').Readable;
const request=require("request-promise-native")
const chai = require("chai")
chai.use(require("chai-json-schema-ajv"))
const expect=chai.expect
const fs=require("fs")

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

async function uploadWithAuth(username,password,verb,uriPart,fileText){
    const loginResponse=await login(username,password)
    const token=loginResponse.token
    const textBuffer = Buffer.from(fileText, 'utf8');
    const readable = new Readable()
    readable.push(textBuffer)
    readable.push(null)

    const response=await request({
        uri:url(uriPart),
        method:verb,
        headers:{
            "Authorization":"bearer "+token
        },
        simple:false,
        resolveWithFullResponse:true,
        json:true,
        formData:{
            csv:{
                value:readable,
                options:{
                    filename:"csv",
                    knownLength: textBuffer.length
                }
            }
        }
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

describe("File uploads to /estudiantes/csv",()=>{
    it("upload",async ()=>{
        const oneLiner = "97452,97452,Jose,Sbrubru,3,jose.sbrubru@gmail.com,11-10"
        console.log("$$$$$$$")
        const response = await uploadWithAuth("jose","jojo","POST","/estudiantes/csv",oneLiner)
        console.log("$$$$$$$")
        console.log(response.body)
    })
})

/*
    (5,'99999',now(),'false',-1,'2018-01-05'),
    (5,'96107',now(),'false',-1,'2018-01-05'),
    (5,'96800',now(),'false',-1,'2018-01-05');
    */
describe("File uploads to /inscripciones_cursos/5/csv_notas",()=>{
    it("upload with errors",async ()=>{
        const file =`99999,9.4\nperon,8`
        const response = await uploadWithAuth("jose","jojo","POST","/inscripciones_cursos/5/csv_notas",file)

        expect(response.body.errors).to.lengthOf(2)
    })

    it("upload good file",async ()=>{
        const reqEnrolmentsBefore=await requestWithAuth("jose","jojo","GET","/inscripciones_cursos?curso=5&semester=any")
        
        for(let e of reqEnrolmentsBefore.body.courseInscriptions){
            if(e.student.username!="97452"){
                expect(e.grade).to.equal("-1")
            }
            
        }
        const file =`99999,10\n96107,-`
        const response = await uploadWithAuth("jose","jojo","POST","/inscripciones_cursos/5/csv_notas",file)

        const reqEnrolmentsAfter=await requestWithAuth("jose","jojo","GET","/inscripciones_cursos?curso=5&semester=any")
        console.log("====================")
        console.log("====================")
        console.log("====================")
        console.log(reqEnrolmentsBefore.body)
        console.log("====================")
        console.log("====================")
        console.log("====================")
        for(let e of reqEnrolmentsAfter.body.courseInscriptions){
            if(e.student.username=="96800"){
                expect(e.grade).to.equal("-1")
            }
            if(e.student.username=="96107"){
                expect(e.grade).to.equal("-1")
            }
            if(e.student.username=="99999"){
                expect(e.grade).to.equal("10")
            }
            
        }
    })
})