import Assistant from "./Assistant";

class Proxy  {
    constructor() {
        this.url = "/api"//"http://mataco2.herokuapp.com/api"
        this.local = "http://localhost:3000/api"
    }

    login(dni, password) {
        return fetch(this.url + "/login", {
                method: 'POST',
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  username: dni,
                  password: password
                }),
             }).then(res => res.json())

      }

      getDepartmentSubjects(department_name) {
        return fetch(this.url + "/materias?departamento=" + department_name, {
            method: 'GET',
            headers: {
              'Authorization': 'bearer ' + Assistant.getField("token")
            },
         }).then(res => res.json()) 
      }

      getProfessorCourses(professorDni) {
        return fetch(this.url + "/cursos?profesor=" + professorDni, {
                method: 'GET',
                headers: {
                  'Authorization': 'bearer ' + Assistant.getField("token")
                },
             }).then(res => res.json()) 

      }

      getSubjectCourses(department_code, subject_code) {
        return fetch(this.url + "/cursos?cod_departamento=" + department_code + "&cod_materia=" + subject_code, {
                method: 'GET',
                headers: {
                  'Authorization': 'bearer ' + Assistant.getField("token")
                },
             }).then(res => res.json()) 

      }

      getCourseStudents(course) {
        return fetch(this.url + "/cursadas?curso=" + course , {
                method: 'GET',
                headers: {
                  'Authorization': 'bearer ' + Assistant.getField("token")
                },
                
             }).then(res => res.json()) 

      }

      /*
      var newCourse = {
                department_code: this.state.code.substr(0, 2),
                subject_code: this.state.code.substr(2, 2),
                name: this.state.id,
                total_slots: this.state.slots,
                professors: [],
                time_slots: []
            }
            */

      addCourse(course){
        return fetch(this.url + "/cursos",{
          method:"POST",
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'bearer ' + Assistant.getField("token")
          },
          body:JSON.stringify({
            "cod_departamento":course.department_code,
            "cod_materia":course.subject_code,
            "nombre":course.name,
            "vacantes_totales":parseInt(course.total_slots)
          })
        }).then((x)=>{
          return x.json()
        }).then((m)=>{
          console.log(m)
          return m
        })
      }

      deleteCourse(course){
        return fetch(this.url + "/cursos/"+course,{
          method:"DELETE",
          headers: {
            'Authorization': 'bearer ' + Assistant.getField("token")
          }
        })
      }

      postCourse(department_code, subject_code, department_name, vacancies) {
        return fetch(this.url + "/cursos", {
                method: 'POST',
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  cod_departamento: department_code,
                  cod_materia: subject_code,
                  nombre: department_name,
                  vacantes_totales: vacancies
                }),
             }).then(res => console.log(res.text()))
      }

      putAcceptConditionalStudent(course, username) {
        return fetch(this.url + "/cursadas/"+course+"-"+username, {
                method: 'PUT',
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                  'Authorization': 'bearer ' + Assistant.getField("token")
                },
                body: JSON.stringify({
                  accepted:true
                }),
             })
             .then(res => res.json())
      }

  }
  
  export default new Proxy();
