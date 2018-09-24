import React, { Component } from 'react';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import './App.css';
import Login from "./routes/Login";
import Home from "./routes/Home";
import SubjectStudents from "./routes/SubjectStudents";
import SubjectCourses from "./routes/SubjectCourses";
import Error from "./routes/Error";

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <div>
          <Switch>
            <Route path="/login" component={Login} />
            <Route path="/home" component={Home} />
            <Route path="/cursos/:idCurso" component={SubjectStudents} />
            <Route path="/materias/:idMateria" component={SubjectCourses} />
            <Redirect from="/" to="/login" exact/>
            <Route component={Error} />
          </Switch>
        </div>
      </BrowserRouter>
    );
  }
}

export default App;
