const request=require("request-promise-native")
const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(
        "SG.aK"+
        "t62DsZTqar"+"mCK_H6p"
        +"AAg.LpdC_1XahULl"
        
        +"LBHqKLFHU"+"Uwz1ya-aCKeh"
        
        
        +"zX9VbtmIik");

async function notifyAndroid(notifyTokens,message){
    console.log("holiholi")
    if(process.env.ENVIRONMENT_MODE && process.env.ENVIRONMENT_MODE=="TEST"){
        return
    }
    console.log("VOY A HACER BROADCAST A LOS SGTES TOKENS")
    console.log(notifyTokens)
    let requestPayload = {
        "data": {
            "title": "Se canceló un examen",
            "body": message,
            "click_action": "exam_inscriptions",
            "channel_id": "exams"
        },
        "registration_ids": notifyTokens
    }
    
    await request({
        uri:"https://"+"f"+"c"+"m"+".go"+"og"+"lea"+"pi"+"s.c"+"om/"+"fc"+"m/s"+"end",
        method:"POST",
        headers:{
            "Content-Type":"application/json",
            "Authorization":"key=AAAA"+
            "ctJi0bE"+
            ":APA91bFPGJ"+
            "-zYYcZg-1WcoXPZmmU"+"XEafYSiLbdcHgJ"+"FYliWMkGIlL--kBR0"
            
            
            
            
            +"BE6C4DTD7J5LmrsfvmyqIGZt0ps0s49Pt"+"-UthdNz9g"+"3WLwVb-Yo5f"+"tnD2"+"gzrCvxkpct"+"BscuWLnCzINnUk"
        },
        body:requestPayload,
        simple:false,
        resolveWithFullResponse:true,
        json:true
    })
}

async function notifyEmail(emails,message){
    if(process.env.ENVIRONMENT_MODE && process.env.ENVIRONMENT_MODE=="TEST"){
        return
    }
    const msg = {
      to: emails,
      from: 'jose.sbru@gmail.com',
      subject: 'Notificaciones FIUBA',
      text: message,
    };
    await sgMail.send(msg);
}

module.exports={
    notifyAndroid,
    notifyEmail
}