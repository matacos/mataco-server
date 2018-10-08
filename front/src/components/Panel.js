import React, { Component } from 'react';
import logoFIUBA from '../images/logo.png';
import Assistant from '../Assistant';
import Proxy from '../Proxy';
import { withRouter } from 'react-router-dom';
import { Glyphicon } from 'react-bootstrap';

class Panel extends Component {
    constructor(props) {
        super(props);

        this.state = {
            text: '',
            subjects: [],
            courses: []
        };

    }

    componentDidMount() {
        if (Assistant.isProfessor())
            Proxy.getProfessorCourses().then(courses => this.setState({courses: courses}));	
    
        if (Assistant.isDepartmentAdmin())
            Proxy.getDepartmentSubjects().then(subjects => this.setState({subjects: subjects}));

        /*
        this.setState({courses: [{department_code: "75", subject_code: "07", name: "Algoritmos y Programación III", course: "2"},
                                    {department_code: "75", subject_code: "44", name: "Admin. y Control de Desarrollo de Proy. Informáticos II", course: "4"},
                                    {department_code: "75", subject_code: "47", name: "Taller de Desarrollo de Proyectos II", course: "3"}]})
        */       
        // DEPTO
        /*this.setState({subjects: [{department_code: "75", code: "07", name: "Algoritmos y Programación III"},
                                {department_code: "75", code: "44", name: "Admin. y Control de Desarrollo de Proy. Informáticos II"},
                                {department_code: "75", code: "47", name: "Taller de Desarrollo de Proyectos II"},
                                {department_code: "75", code: "40", name: "Algoritmos y Programación I"},
                                {department_code: "75", code: "41", name: "Algoritmos y Programación II"}]})*/
    }

    obtainMode() {
        return Assistant.inProfessorMode() ? "modo docente" : "modo administrador de departamento";
    }

    handleSelectedCourses() {
        if (this.props.selectedSubjects) {
            this.props.setSelectedSubjects(false);
        }
        else {
            this.props.setSelectedSubjects(true);
        }
        
    }

    goToCourse(courseId, subjectName) {
        this.props.history.push('/cursos/' + subjectName + '/' + courseId);
        this.handleSelectedCourses();
    }

    goToSubject(subjectId, subjectName) {
        this.props.history.push('/materias/' + subjectId + '/' + subjectName);
        this.handleSelectedCourses();
    }

    goToHome() {
        this.props.history.push('/home');
    }

    logout() {
        Proxy.logout();
        this.props.history.push('/login');
    }

    render() {
        var listItems;
        if (Assistant.inProfessorMode())
            listItems = this.state.courses.map((d) => <div key={d.department_code + d.subject_code} style={{marginLeft: "2em"}}><button className="text-primary text-left" style={{background: "none", border: "none", padding: "0"}} onClick={this.goToCourse.bind(this, d.department_code + d.subject_code + d.course, d.name.replace(/ /g, "-"))}>{d.name}</button><hr /></div>);
        else
            listItems = this.state.subjects.map((d) => <div key={d.department_code + d.code} style={{marginLeft: "2em"}}><button className="text-primary text-left" style={{background: "none", border: "none", padding:"0"}} onClick={this.goToSubject.bind(this, d.department_code + d.code, d.name.replace(/ /g, "-"))}>{d.name}</button><hr /></div>);
        return (
        <div className="panel panel-default col-md-3" style={{margin: "0", padding: "0"}}>
            <div className="panel-heading" style={{width: "auto"}}>
                <img className="img-responsive center-block" alt="logo" src={logoFIUBA} height="50%" width="50%" style={{marginLeft: "auto", marginRight: "auto", width: "50%", paddingTop: "1em"}}/>
                <h3 className="text-center" style={{color: "#696969"}}>{Assistant.inProfessorMode() ? Assistant.getField("name") : "Departamento de " + Assistant.getField("department")}</h3>
            </div>

            <div className="panel-body" style={this.props.selectedSubjects ? {height: "auto"} : {height: "100vh"}}>
                <div style={{padding: "1em"}}>
                <div ><button style={{background: "none", border: "none"}} onClick={this.goToHome.bind(this)}><h4 className="text-primary"> Home</h4> </button></div>
                <button style={{background: "none", border: "none"}} onClick={this.handleSelectedCourses.bind(this)}><h4 className="text-primary"> 
                {(this.props.selectedSubjects) && <Glyphicon style={{fontSize:"0.75em"}} glyph="minus" />}
                {!(this.props.selectedSubjects) && <Glyphicon style={{fontSize:"0.75em"}} glyph="plus" />}
                {Assistant.inProfessorMode() ? " Mis Cursos" : " Mis Materias"}</h4></button>
                {(this.props.selectedSubjects) && 
                <div style={{marginTop: "1em"}}>{listItems}</div>}
                <p><button className="text-primary" style={{background: "none", border: "none"}} onClick={this.logout.bind(this)}><h4 className="text-primary">  Cerrar sesión </h4></button></p>
                </div>
            </div>
        </div>);
    }
}

export default withRouter(Panel);
