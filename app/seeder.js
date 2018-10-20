const fs = require('fs');
const pg = require('pg');

const db=require("./db")
/*
create table users (
    username varchar(10),
    password varchar(30),
    email varchar(30),
    name text,
    surname text,
    token varchar(30),
    token_expiration timestamp,

    primary key (username),
    unique (token)
);
*/
function createUsersSeed(n){
    const Readable = require('stream').Readable;
    const s = new Readable();
    /*
    const str = `1,287,jose.sb@gmail.com,José Ignacio,Sbru,19,2018-10-13 22:35:03.002334
    2,arar,largerich@gmail.com,Luis,Argerich,2,2018-10-13 22:35:03.382083
    3,font,fontela@gmail.com,Carlos,Fontela,1,2018-10-13 22:35:03.382083
    4,ayu,ayudante@gmail.com,Santiago,Gandolfo,3,2018-10-13 22:35:03.382083
    5,9,nina.niner@gmail.com,Andorid No. 9,Cell,37.65133633598554,2018-10-13 22:35:12.295037
    6,jojo,jose.jose@gmail.com,José Ignacio,Sbruzzi,21.46873113619343,2018-10-13 22:35:12.850306
    7,777,sebas@fi.uba.ar,Sebastian,Grynberg,63.25495156653975,2018-10-13 22:35:12.923391
    8,jojo,jose.jose@gmail.com,José Ignacio,Sbruzzi,1.4228502041242708,2018-10-13 22:35:13.140402`
    s.push(str)
    */
    for(let i = 0; i < n; i++){
        s.push(["n"+i,i,i+"@fi.uba.ar","Automático","Automatista","a675"+i/10,"2018-04-15"].join(",")+"\n");
    }
    s.push(null);
    return s
}


console.log("88888888888888888")
console.log("88888888888888888")
console.log("88888888888888888")
console.log("88888888888888888")
console.log("88888888888888888")
console.log("88888888888888888")
console.log("88888888888888888")
setTimeout(doIt, 20000);


function doIt(){
    db.query("select count(*) from users;").then((usersCount)=>{
        console.log("====")
        console.log("====")
        console.log("====")
        console.log(usersCount.rows[0].count)
        console.log("====")
        console.log("====")
        console.log("====")
        console.log("ES LA HORA",new Date())
        if(usersCount.rows[0].count<100){
            db.copyFrom("COPY users FROM STDIN with (format 'csv');").then((stream)=>{
                console.log("####################")
                console.log("####################")
                console.log("####################")
                console.log("####################")
                console.log("####################")
                console.log("####################")
                console.log("####################")
                console.log("####################")
                console.log("####################")
                console.log("####################")
                console.log("####################")
                console.log("####################")
                console.log("####################")
                var fileStream = createUsersSeed(10000)
                fileStream.pipe(stream);
                fileStream.on("end",()=>{
                    console.log("###########")
                    console.log("###########")
                    console.log("###########")
                    console.log("TERMINA LA SUBIDA A LA BASE DE DATOS SQL")
                    console.log("ES LA HORA",new Date())
                    console.log("###########")
                    console.log("###########")
                    console.log("###########")
                })
                console.log("ES LA HORA",new Date())
            })
        }
        

    })
    
    

}
