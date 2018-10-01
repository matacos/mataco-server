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
            selectedCourses: false,
            text: '',
            courses:[],
            subjects: []
        };

    }

    componentDidMount() {
        // TODO para docente: Llamada a proxy: GET /cursos?professor=<id de docente>
        // Luego con id de materia hago GET /materias y saco el nombre, codigo y depto
        Proxy.getDepartmentSubjects("Computación")
        .then(
            (result) => {
                console.log(result);
                this.setState({subjects: this.removeDuplicates(result.subjects)});
                Assistant.setField("token", result.token);
            },
            (error) => {
                console.log(error)
            }
        )

        /*Proxy.getProfessorCourses("12345678")
        .then(
            (cousesResult) => {
                console.log(coursesResult);
                //this.setState({courses: result.courses});
                Assistant.setField("token", coursesResult.token);
                Proxy.getDepartmentSubjects("Computación")
                .then(
                    (subjectResult) => {
                        this.setState({courses: this.getCourses(coursesResult.courses, subjectResult.subjects)});
                        Assistant.setField("token", subjectResult.token);

                },
                (error) => {
                    console.log(error)
                })
            },
            (error) => {
                console.log(error)
            }
        )*/

        this.setState({courses: [{department_code: "75", subject_code: "07", name: "Algoritmos y Programación III", course: "2"},
                                    {department_code: "75", subject_code: "44", name: "Admin. y Control de Desarrollo de Proy. Informáticos II", course: "4"},
                                    {department_code: "75", subject_code: "47", name: "Taller de Desarrollo de Proyectos II", course: "3"}]})
        
        // DEPTO
        /*this.setState({subjects: [{department_code: "75", code: "07", name: "Algoritmos y Programación III"},
                                {department_code: "75", code: "44", name: "Admin. y Control de Desarrollo de Proy. Informáticos II"},
                                {department_code: "75", code: "47", name: "Taller de Desarrollo de Proyectos II"},
                                {department_code: "75", code: "40", name: "Algoritmos y Programación I"},
                                {department_code: "75", code: "41", name: "Algoritmos y Programación II"}]})*/
    }

    removeDuplicates(subjects) {
        var i;
        var uniqueSubjects = [subjects[0]];
        var first = subjects[0];
        for (i = 1; i < subjects.length; i++) {
            if (subjects[i].name != first.name) {
                uniqueSubjects.push(subjects[i]);
                first = subjects[i];
            }
        }
        uniqueSubjects.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
        return uniqueSubjects;
    }

    obtainMode() {
        return (Assistant.getField("mode") == "professor") ? "modo docente" : "modo administrador de departamento";
    }

    handleSelectedCourses() {
        if (this.props.selectedSubjects) {
            //this.setState({selectedCourses: false, text: this.state.text.replace("v", ">")});
            this.props.setSelectedSubjects(false);
        }
        else {
            //this.setState({selectedCourses: true, text: this.state.text.replace(">", "v")});
            this.props.setSelectedSubjects(true);
        }
        
    }

    goToCourse(courseId) {
        this.props.history.push('/cursos/' + courseId);
    }

    goToSubject(subjectId) {
        this.props.history.push('/materias/' + subjectId);
    }

    goToHome() {
        this.props.history.push('/home');
    }

    logout() {
        Assistant.clearData();
        this.props.history.push('/login');
    }

    render() {
        if (Assistant.getField("mode") == "professor")
        var listItems = this.state.courses.map((d) => <div key={d.department_code + d.subject_code} style={{marginLeft: "2em"}}><button className="text-primary text-left" style={{background: "none", border: "none", padding: "0"}} onClick={this.goToCourse.bind(this, d.department_code + d.subject_code + d.course)}>{d.name}</button><hr /></div>);
    else
        var listItems = this.state.subjects.map((d) => <div key={d.department_code + d.code} style={{marginLeft: "2em"}}><button className="text-primary text-left" style={{background: "none", border: "none", padding:"0"}} onClick={this.goToSubject.bind(this, d.department_code + d.code)}>{d.name}</button><hr /></div>);
        return (
        <div className="panel panel-default col-md-3" style={{margin: "0", padding: "0"}}>
            <div className="panel-heading" style={{width: "auto"}}>
                <img className="img-responsive center-block" alt="logo" src={logoFIUBA} height="50%" width="50%" style={{marginLeft: "auto", marginRight: "auto", width: "50%", paddingTop: "1em"}}/>
                {/*</div><h3 className="panel-title text-center" style={{padding: "1em"}}>Carlos Fontela</h3>*/}
                {/*<h3 className="text-center" style={{color: "#696969"}}>Carlos Fontela</h3>*/}
                <h3 className="text-center" style={{color: "#696969"}}>{(Assistant.getField("mode") == "professor") ? "Carlos Fontela" : "Departamento de Computación"}</h3>
            </div>

            <div className="panel-body" style={this.props.selectedSubjects ? {height: "auto"} : {height: "100vh"}}>
                <div style={{padding: "1em"}}>
                <div ><button style={{background: "none", border: "none"}} onClick={this.goToHome.bind(this)}><h4 className="text-primary"> Home</h4> </button></div>
                <button style={{background: "none", border: "none"}} onClick={this.handleSelectedCourses.bind(this)}><h4 className="text-primary"> 
                {(this.props.selectedSubjects) && <Glyphicon style={{fontSize:"0.75em"}} glyph="minus" />}
                {!(this.props.selectedSubjects) && <Glyphicon style={{fontSize:"0.75em"}} glyph="plus" />}
                {(Assistant.getField("mode") == "professor") ? " Mis Cursos" : " Mis Materias"}</h4> </button>
                {(this.props.selectedSubjects) && 
                <div style={{marginTop: "1em"}}>{listItems}</div>}
                <p><button className="text-primary" style={{background: "none", border: "none"}} onClick={this.logout.bind(this)}><h4 className="text-primary">  Cerrar sesión </h4></button></p>
                </div>
            </div>
        </div>);
    }
}

export default withRouter(Panel);
