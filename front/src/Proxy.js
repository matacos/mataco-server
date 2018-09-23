class Proxy  {
    constructor() {
        this.url = "http://mataco.herokuapp.com"
        this.local = "http://localhost:3000/api"
    }

    login(dni, password) {
        return fetch(this.local + "/login", {
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