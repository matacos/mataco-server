const Pool = require("pg").Pool;
const copyFrom = require('pg-copy-streams').from;

//base de datos

let pgConfig=null
if(process.env.DATABASE_URL){
    pgConfig={
        connectionString:process.env.DATABASE_URL 
    }
}else{
    pgConfig={
        //host:"127.0.0.1",
        host:"db",
        port:5432,
        user:"postgres",
        database:"postgres",
        connectionTimeoutMillis:20000 //sin esto, puede ser que el server levante antes que postgres y rompa todo
    }
}
const pool = Pool(pgConfig)
//let connection=await pool.connect()

let poolConnection=null;
async function connection(){
    if(poolConnection==null){
        poolConnection=await pool.connect()    
    }
    return poolConnection
}


module.exports={
    query:async (text,params)=>{
        const c=await connection()
        return await c.query(text,params)
    },
    copyFrom:async(text)=>{
        const c=await connection()
        return await c.query(copyFrom(text))
    }

}

console.log("------------------------")
console.log("pgConfig es:")
console.log(pgConfig)