import React, { Component } from 'react';
import '../App.css';
import Assistant from '../Assistant';
import Panel from '../components/Panel';
import { Glyphicon } from 'react-bootstrap';

class Home extends Component {
    constructor(props) {
        super(props);

        this.state = {
            professor: Assistant.isProfessor(),
            departmentAdmin: Assistant.isDepartmentAdmin(),
            selectSubjects: false
        };

    }

    obtainMode() {
        return this.inProfessorMode() ? "Modo docente" : "Modo administrador de departamento";
    }

    changeMode() {
        if (this.inProfessorMode()) {
            this.setState({selectSubjects: false})
            Assistant.setField("mode", "department_admin");
        }
        else {
            this.setState({selectSubjects: false})
            Assistant.setField("mode", "professor");
        }
        
    }

    otherMode() {
        if (this.inProfessorMode()) {
            return "Modo administrador de departamento";
        }
        else 
            return "Modo docente";
        
    }

    goToCourse(courseId) {
        this.props.history.push('/cursos/' + courseId);
    }

    goToSubject(subjectId) {
        this.props.history.push('/materias/' + subjectId);
    }

    inProfessorMode() {
        return Assistant.getField("mode") == "professor";
    }

    setSelectedSubjects(bool) {
        this.setState({selectSubjects: bool});
    }

    render() {
        window.scrollTo(0, 0);
        return (
        <div>
            <div className="row">
            <Panel selectedSubjects={this.state.selectSubjects} setSelectedSubjects={this.setSelectedSubjects.bind(this)}/>
            <div className="jumbotron col-md-9" style={{backgroundColor: "#C0C0C0"}}>
                <h1>Sistema de <br/> Gestión Académica</h1>
                <h3 style={{paddingTop: "1em"}}> Bienvenido {Assistant.getField("email")}!</h3>
                {this.state.professor && this.state.departmentAdmin && 
                <div><p style={{paddingTop: "1em", paddingBottom: "1em"}}> 
                {this.inProfessorMode() && <Glyphicon glyph="apple" /> }
                {!this.inProfessorMode() && <Glyphicon glyph="briefcase" /> }
                <span>  Estás conectado en </span><strong>{this.obtainMode()}</strong>.</p> 
                <p className="text-right"><a className="btn btn-primary btn-lg" onClick={this.changeMode.bind(this)}>{this.otherMode()}</a></p></div>}
                </div>
            </div>
        </div>

        );
    }
}

export default Home;