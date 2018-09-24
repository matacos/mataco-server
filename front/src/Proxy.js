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
  }
  
  export default new Proxy();