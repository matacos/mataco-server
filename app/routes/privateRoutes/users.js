function mountRoutes(app,db,schemaValidation){
    app.get("/me",async (req,res,next)=>{
        console.log("###############")
        console.log(req.user);
        console.log("###############")
        let u = req.user
        res.json({"me":{
            username:u.username,
            password:u.password,
            email:u.email,
            name:u.name,
            surname:u.surname,
            roles:u.roles,
            regular:true
        }})
        next()
    })
    const putMeBody={required:[
        "password",
        "email",
        "name",
        "surname"
    ]}
    app.put("/me",schemaValidation({body:putMeBody}), async(req,res,next)=>{
        const {
            password,
            email,
            name,
            surname
        } = req.body;
        const query=`
        update users
        set
            password=$1,
            email=$2,
            name=$3,
            surname=$4
        where
            username=$5
        ;`
        await db.query(query,[
            password,
            email,
            name,
            surname,
            req.user.username
        ])
        let u=req.user
        u.password=password
        u.email=email
        u.name=name
        u.surname=surname
        
        res.json({"me":{
            username:u.username,
            password:u.password,
            email:u.email,
            name:u.name,
            surname:u.surname,
            roles:u.roles,
        }})
        res.status(201)
        next()
    })
}

module.exports={
    mountRoutes:mountRoutes,
}