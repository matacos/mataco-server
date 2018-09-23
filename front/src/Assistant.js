class Assistant  {

    getField(field) {
        return localStorage.getItem(field);
      }
    
    setField(field, value) {
        localStorage.setItem(field, value);
    }

    isProfessor() {
        return localStorage.getItem("roles").includes("professor");
    }

    isDepartmentAdmin() {
        return localStorage.getItem("roles").includes("department_administrator");
    }
  }
  
  export default new Assistant();