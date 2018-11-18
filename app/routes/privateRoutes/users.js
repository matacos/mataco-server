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
        }})
    })
}

module.exports={
    mountRoutes:mountRoutes,
}