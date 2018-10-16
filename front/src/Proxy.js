import Assistant from "./Assistant";

class Proxy  {
    constructor() {
        this.url = "http://localhost:3000/api"//"http://mataco2.herokuapp.com/api"
       
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
             }).then(function(res) {return res.json()})
              .then(function(result) {
                var department;
                if ("department_administrators" in result.user.rolesDescriptions)
                  department = result.user.rolesDescriptions["department_administrators"].department_name;
                else
                  department = "NO DEPARTMENT,DUDE. GTFO.";

                Assistant.setField("token", result.token);
                Assistant.setField("username", result.user.username);
                Assistant.setField("name", result.user.username);
                Assistant.setField("email", result.user.email);
                Assistant.setField("department", department);
                Assistant.setField("roles", result.user.roles.join(","));
                Assistant.isProfessor() ? Assistant.setField("mode", "professor") : Assistant.setField("mode", "department_admin");
                return result;
             })
            
      }

      getDepartmentSubjects() {
        return fetch(this.url + "/materias?departamento=" + Assistant.getField("department"), {
            method: 'GET',
            headers: {
              'Authorization': 'bearer ' + Assistant.getField("token")
            },
        }).then(res => res.json())
          .then(
            (result) => {
                Assistant.setField("token", result.token);
                return this.removeDuplicates(result.subjects);
            },
            (error) => {
                console.log(error)
            }
          )
      }

      removeDuplicates(subjects) {
        var i;
        var uniqueSubjects = [subjects[0]];
        var first = subjects[0];
        for (i = 1; i < subjects.length; i++) {
            if (subjects[i].name != first.name) {
                uniqueSubjects.push(subjects[i]);
                first = subjects[i];
            }
        }
        uniqueSubjects.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
        return uniqueSubjects;
    }

      getProfessorCourses() {
        return fetch(this.url + "/cursos?profesor=" + Assistant.getField("username"), {
                method: 'GET',
                headers: {
                  'Authorization': 'bearer ' + Assistant.getField("token")
                },
             }).then(res => res.json()) 
            .then(
              (result) => {
                  Assistant.setField("token", result.token);
                  return result.courses;
              },
              (error) => {
                  console.log(error)
              }
            )

      }

      getSubjectCourses(department_code, subject_code) {
        return fetch(this.url + "/cursos?cod_departamento=" + department_code + "&cod_materia=" + subject_code, {
                method: 'GET',
                headers: {
                  'Authorization': 'bearer ' + Assistant.getField("token")
                },
             }).then(res => res.json())
             .then(
                (result) => {
                    Assistant.setField("token", result.token);
                    return result.courses;
                },
                (error) => {
                    console.log(error)
                }
            )

      }

      getCourseStudents(courseId) {
        return fetch(this.url + "/cursadas?curso=" + courseId , {
                method: 'GET',
                headers: {
                  'Authorization': 'bearer ' + Assistant.getField("token")
                },
                
             }).then(res => res.json())
             .then(
              (result) => {
                  var studentsList = result.courseInscriptions.map(inscription => {
                      var data = {};
                      data.estado = inscription.accepted ? "Regular" : "Condicional";
                      data.nombre = inscription.student.name;
                      data.apellido = inscription.student.surname;
                      data.prioridad = Math.floor(Math.random() * 120) + 1;
                      data.id = inscription.student.username;
                      return data;
                  })
                  Assistant.setField("token", result.token);
                  return studentsList;
              },
              (error) => {
                  console.log(error)
              }
          ) 

      }

      addCourse(course){
        return fetch(this.url + "/cursos" , {
          method:"POST",
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'bearer ' + Assistant.getField("token")
          },
          body: JSON.stringify(course),
        })
      }

      addProfessor(courseId, professor){
        return fetch(this.url + "/cursos/" + courseId + "/docentes" , {
          method:"POST",
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'bearer ' + Assistant.getField("token")
          },
          body: JSON.stringify(professor),
        })
      }

      addSchedule(courseId, schedule){
        return fetch(this.url + "/cursos/" + courseId + "/horarios" , {
          method:"POST",
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'bearer ' + Assistant.getField("token")
          },
          body: JSON.stringify(schedule),
        })
      }

      deleteCourse(courseId){
        return fetch(this.url + "/cursos/" + courseId , {
          method:"DELETE",
          headers: {
            'Authorization': 'bearer ' + Assistant.getField("token")
          }
        });
      }

      deleteSchedule(courseId, scheduleId){
        return fetch(this.url + "/cursos/" + courseId + "/horarios/" + scheduleId , {
          method:"DELETE",
          headers: {
            'Authorization': 'bearer ' + Assistant.getField("token")
          }
        });
      }

      deleteProfessor(courseId, professorId){
        return fetch(this.url + "/cursos/" + courseId + "/docentes/" + professorId , {
          method:"DELETE",
          headers: {
            'Authorization': 'bearer ' + Assistant.getField("token")
          }
        });
      }

      changeCourse(courseId, body) {
        return fetch(this.url + "/cursos/" + courseId, {
          method: 'PUT',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'bearer ' + Assistant.getField("token")
          },
          body: JSON.stringify(body),
       });
      }

      putAcceptConditionalStudent(course, username) {
        return fetch(this.url + "/cursadas/" + course + '-' + username, {
                method: 'PUT',
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                  'Authorization': 'bearer ' + Assistant.getField("token")
                },
                body: JSON.stringify({
                  accepted: true
                }),
             })
             .then(() => this.getCourseStudents(course),
              (error) => {
                  console.log(error)
              }
          ) 
      }

      getCourseExams(department_code, subject_code, professor) {
        return fetch(this.url + "/finales?cod_departamento=" + department_code + "&cod_materia=" + subject_code + "&docente=" + professor , {
          method: 'GET',
          headers: {
            'Authorization': 'bearer ' + Assistant.getField("token")
          },
          
          }).then(res => res.json())
          .then(
            (result) => {            
                Assistant.setField("token", result.token);
                return result.exams;
                
            },
            (error) => {
                console.log(error)
            }
          )  
        }
      
      addExam(exam) {
        return fetch(this.url + "/finales" , {
          method:"POST",
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'bearer ' + Assistant.getField("token")
          },
          body: JSON.stringify(exam),
        })
      }

      logout() {
        Assistant.clearData();
      }

  }
  
  export default new Proxy();
