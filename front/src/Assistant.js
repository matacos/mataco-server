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

    clearData() {
        localStorage.clear();
    }

    isLoggedIn() {
        return localStorage.length > 0;
    }

    inProfessorMode() {
        return localStorage.getItem("mode") == "professor";
    }
  }
  
  export default new Assistant();