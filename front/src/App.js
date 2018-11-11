import React, { Component } from 'react';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import './App.css';
import Login from "./routes/Login";
import Home from "./routes/Home";
import Panel from './components/Panel';
import SubjectStudents from "./routes/SubjectStudents";
import SubjectCourses from "./routes/SubjectCourses";
import Exam from "./routes/Exam";
import StudentsUpload from "./routes/StudentsUpload";
import Error from "./routes/Error";
import Assistant from './Assistant';
import Semesters from "./routes/Semesters";

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
        selected: this.getClearSelection(),
        mode: Assistant.getField("mode"),
        update: false
    };

  }

  getClearSelection() {
    return {
        "subjects": false,
        "exams": false,
        "semesters": false
    };
  }

  setSelected(value, bool) {
      var updatedSelection = this.getClearSelection();

      updatedSelection[value] = bool;
      this.setState({selected: updatedSelection});
  }

  setUpdate(bool) {
    this.setState({update: bool});
  }

  changeMode() {
    if (Assistant.inProfessorMode()) {
      this.setState({selected: this.getClearSelection(), mode: "department_administrator"})
      Assistant.setField("mode", "department_administrator");
    }
    else {
        this.setState({selected: this.getClearSelection(), mode: "professor"})
        Assistant.setField("mode", "professor");
    }
  }

  render() {
    return (
      <BrowserRouter>
      <div className="row">
      {Assistant.isLoggedIn() && <Panel selected={this.state.selected} setSelected={this.setSelected.bind(this)} mode={this.state.mode} update={this.state.update} setUpdate={this.setUpdate.bind(this)} />}
      <div className={Assistant.isLoggedIn() ? "col-md-9" : "col-md-12"}>
        <div>
          <Switch>
            <Route path="/login" render={ () => Assistant.isLoggedIn() ? <Redirect to="/home" /> : <Login/> } />
            <Route path="/home" render={ () => Assistant.isLoggedIn() ? <Home changeMode={this.changeMode.bind(this)} /> : <Redirect to="/login" /> } />
            <Route path="/cursos/:nombreMateria/:idCurso" render={ (props) => Assistant.isRole("professor") ? <SubjectStudents {...props} /> : <Redirect to="/login" /> }/>
            <Route path="/materias/:idMateria/:nombreMateria" render={ (props) => Assistant.isRole("department_administrator") ? <SubjectCourses {...props} /> : <Redirect to="/login" /> } />
            <Route path="/finales/:idMateria/:idExamen" render={ (props) => Assistant.isRole("professor") ? <Exam {...props} update={this.setUpdate.bind(this)} /> : <Redirect to="/login" /> }/>
            <Route path="/estudiantes" render={ (props) => Assistant.isRole("administrators") ? <StudentsUpload {...props} /> : <Redirect to="/login" /> } />
            <Route path="/periodos" render={ (props) => Assistant.isRole("administrators") ? <Semesters {...props} /> : <Redirect to="/login" /> } />
            <Redirect from="/" exact to="/login" />
            <Route component={Error} />
          </Switch>
        </div>
        </div>
        </div>
      </BrowserRouter>
    );
  }
}

export default App;
