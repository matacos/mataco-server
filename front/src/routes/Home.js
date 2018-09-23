import React, { Component } from 'react';
import '../App.css';
import Assistant from '../Assistant';
import logoFIUBA from '../images/logo.png';
import Panel from '../components/Panel';

class Home extends Component {
    constructor(props) {
        super(props);

        this.state = {
            professor: Assistant.isProfessor(),
            departmentAdmin: Assistant.isDepartmentAdmin(),
            selectedCourses: false,
            courses:[],
            subjects: [],
            professorMode: Assistant.isProfessor(),
            coursesText: "> Mis Cursos"
        };
    }

    componentDidMount() {
        // TODO para docente: Llamada a proxy: GET /cursos?dado_por=<id de docente>
        // Luego con id de materia hago GET /materias y saco el nombre, codigo y depto
        this.setState({courses: [{departamento: "75", codigo: "07", nombre: "Algoritmos y Programación III"},
                                    {departamento: "75", codigo: "44", nombre: "Admin. y Control de Desarrollo de Proy. Informáticos II"},
                                    {departamento: "75", codigo: "47", nombre: "Taller de Desarrollo de Proyectos II"}]})
        
        // DEPTO
        this.setState({subjects: [{departamento: "75", codigo: "07", nombre: "Algoritmos y Programación III"},
                                {departamento: "75", codigo: "44", nombre: "Admin. y Control de Desarrollo de Proy. Informáticos II"},
                                {departamento: "75", codigo: "47", nombre: "Taller de Desarrollo de Proyectos II"},
                                {departamento: "75", codigo: "40", nombre: "Algoritmos y Programación I"},
                                {departamento: "75", codigo: "41", nombre: "Algoritmos y Programación II"}]})
    }

    obtainMode() {
        return this.state.professorMode ? "modo docente" : "modo administrador de departamento";
    }

    handleSelectedCourses() {
        if (this.state.selectedCourses) {
            this.setState({selectedCourses: false, coursesText: this.state.coursesText.replace("v", ">")});
        }
        else {
            this.setState({selectedCourses: true, coursesText: this.state.coursesText.replace(">", "v")});
        }
    }

    changeMode() {
        if (this.state.professorMode) {
            this.setState({professorMode: false, coursesText: "> Mis Materias", selectedCourses: false})
        }
        else {
            this.setState({professorMode: true, coursesText: "> Mis Cursos", selectedCourses: false})
        }
    }

    otherMode() {
        if (this.state.professorMode) {
            return "modo administrador de departamento";
        }
        else 
            return "modo docente";
        
    }

    render() {
        if (this.state.professorMode)
            var listItems = this.state.courses.map((d) => <p key={d.departamento + d.codigo} className="text-primary" style={{paddingLeft: "2em"}}>{d.nombre}</p>);
        else
            var listItems = this.state.subjects.map((d) => <p key={d.departamento + d.codigo} className="text-primary" style={{paddingLeft: "2em"}}>{d.nombre}</p>);
        return (
        <div>
            <div className="row">
            {/*<div className="panel panel-default col-md-3" style={{margin: "0", padding: "0"}}>
            <div className="panel-heading" style={{width: "auto"}}>
                <img className="img-responsive center-block" src={logoFIUBA} height="50%" width="50%" style={{marginLeft: "auto", marginRight: "auto", width: "50%", paddingTop: "1em"}}/>
                <h3 className="panel-title text-center" style={{padding: "1em"}}>Carlos Fontela</h3>
            </div>

            <div className="panel-body" style={{height: "100vh"}}>
                <div style={{padding: "1em"}}>
                <button className="text-primary" style={{background: "none", border: "none", paddingBottom: "1em"}} onClick={this.handleSelectedCourses.bind(this)}> {this.state.coursesText} </button>
                {this.state.selectedCourses && 
                <div>{listItems}</div>}
                </div>
            </div>
            </div>*/}
            <Panel text={this.state.coursesText} handleSelectedMenu={this.handleSelectedCourses.bind(this)} selectedCourses={this.state.selectedCourses} listItems={listItems}/>
            <div className="jumbotron col-md-9" style={{backgroundColor: "#C0C0C0"}}>
                <h1>Sistema de <br/> Gestión Académica</h1>
                <h3 style={{paddingTop: "1em"}}> Bienvenido {Assistant.getField("email")}!</h3>
                {this.state.professor && this.state.departmentAdmin && 
                <div><p style={{paddingTop: "1em", paddingBottom: "1em"}}> -> Estás conectado en <strong>{this.obtainMode()}</strong>.</p> 
                <p className="text-right"><a className="btn btn-primary btn-lg" onClick={this.changeMode.bind(this)}>Pasar a {this.otherMode()}</a></p></div>}
                </div>
            </div>
        </div>

        );
    }
}

export default Home;