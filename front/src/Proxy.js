import Assistant from "./Assistant";

class Proxy  {
    constructor() {
        this.url = "http://mataco.herokuapp.com/api"
        this.local = "http://localhost:3000/api"
    }

    login(dni, password) {
        return fetch(this.url + "/login", {
                method: 'POST',
                headers: {
                  //'Accept': 'application/json',
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



  }
  
  export default new Proxy();