import React, { Component } from 'react';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import './App.css';
import Login from "./routes/Login";
import Home from "./routes/Home";
import Panel from './components/Panel';
import SubjectStudents from "./routes/SubjectStudents";
import SubjectCourses from "./routes/SubjectCourses";
import Error from "./routes/Error";
import Assistant from './Assistant';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
        selected: this.getClearSelection(),
        mode: Assistant.getField("mode")
    };

  }

  getClearSelection() {
    return {
        "subjects": false,
        "exams": false
    };
  }

  setSelected(value, bool) {
      var updatedSelection = this.getClearSelection();

      updatedSelection[value] = bool;
      this.setState({selected: updatedSelection});
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
    //window.location.reload();
  }

  render() {
    return (
      <BrowserRouter>
      <div className="row">
      {Assistant.isLoggedIn() && <Panel selected={this.state.selected} setSelected={this.setSelected.bind(this)} mode={this.state.mode}/>}
      <div className={Assistant.isLoggedIn() ? "col-md-9" : "col-md-12"}>
        <div>
          <Switch>
            <Route path="/login" render={ () => Assistant.isLoggedIn() ? <Redirect to="/home" /> : <Login/> } />
            <Route path="/home" render={ () => Assistant.isLoggedIn() ? <Home changeMode={this.changeMode.bind(this)} /> : <Redirect to="/login" /> } />
            <Route path="/cursos/:nombreMateria/:idCurso" component={SubjectStudents} />
            <Route path="/materias/:idMateria/:nombreMateria" component={SubjectCourses} />
            
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
