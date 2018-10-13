import React, { Component } from 'react';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import './App.css';
import Login from "./routes/Login";
import Home from "./routes/Home";
import SubjectStudents from "./routes/SubjectStudents";
import SubjectCourses from "./routes/SubjectCourses";
import Error from "./routes/Error";
import Assistant from './Assistant';

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <div>
          <Switch>
            <Route path="/login" render={ () => Assistant.isLoggedIn() ? <Redirect to="/home" /> : <Login/> } />
            <Route path="/home" render={ () => Assistant.isLoggedIn() ? <Home /> : <Redirect to="/login" /> } />
            <Route path="/cursos/:nombreMateria/:idCurso" component={SubjectStudents} />
            <Route path="/materias/:idMateria/:nombreMateria" component={SubjectCourses} />
            
            <Redirect from="/" exact to="/login" />
            <Route component={Error} />
          </Switch>
        </div>
      </BrowserRouter>
    );
  }
}

export default App;
