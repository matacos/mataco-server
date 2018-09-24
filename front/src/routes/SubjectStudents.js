import React, { Component } from 'react';
import '../App.css';
import logoFIUBA from '../images/logo.png';
import { Modal, Button } from 'react-bootstrap';

class SubjectStudents extends Component {
    constructor(props) {
        super(props);

        this.state = {
            subject: "Algoritmos y Programación III",
            selectedCourses: false,
            students: [],
            coursesText: "> Mis Cursos",
            conditional: false
        };
    }

    componentDidMount() {
        // TODO: Llamada a proxy: GET /cursos?dado_por=<id de docente>
        // Luego con id de curso hago GET /cursadas?con_nota=false
        // Con el id de cada alumno debería obtener su nombre para la tabla
        this.setState({students: [{id: "98557", apellido: "Rodriguez", nombre: "Roberto", estado: "Regular"},
                        {id: "87445", apellido: "Herrera", nombre: "Candela", estado: "Regular"},
                        {id: "94333", apellido: "Pérez", nombre: "Julieta", estado: "Regular"},
                        {id: "96421", apellido: "Dominguez", nombre: "Juan", estado: "Condicional"},
                        {id: "98765", apellido: "Álvarez", nombre: "Maria", estado: "Regular"},
                        {id: "93242", apellido: "Pazzini", nombre: "Rodrigo", estado: "Regular"},
                        {id: "91872", apellido: "Marconi", nombre: "Luciano", estado: "Condicional"}]})
    }

    handleSelectedCourses() {
        if (this.state.selectedCourses) 
            this.setState({selectedCourses: false, coursesText: "> Mis Cursos"})
        
        else 
            this.setState({selectedCourses: true, coursesText: "v Mis Cursos"})
        
    }

    acceptConditional() {
        this.setState({conditional: true})
    }

    handleHide() {
        this.setState({ conditional: false });
    }

    render() {
        return (
        <div>
            <div className="row">
            <div className="panel panel-default col-md-3" style={{margin: "0", padding: "0"}}>
            <div className="panel-heading" style={{width: "auto"}}>
                <img className="img-responsive center-block" alt="logo" src={logoFIUBA} height="50%" width="50%" style={{marginLeft: "auto", marginRight: "auto", width: "50%", paddingTop: "1em"}}/>
                <h3 className="panel-title text-center" style={{padding: "1em"}}>Carlos Fontela</h3>
            </div>

            <div className="panel-body" style={{height: "100vh"}}>
                <div style={{padding: "1em"}}>
                <button className="text-primary" style={{background: "none", border: "none"}} onClick={this.handleSelectedCourses.bind(this)}> {this.state.coursesText} </button>
                {this.state.selectedCourses && 
                <p className="text-primary" style={{padding: "1em", paddingLeft: "2em"}}> Soy curso </p>}
                </div>
            </div>
            </div>
            <div className="col-md-9" style={{padding: "4em"}}>
            <h1 className="App" style={{paddingBottom: "1em"}}> Sistema de Gestión Académica </h1>
            <h2 style={{paddingBottom: "1em"}}> {this.state.subject} </h2>
            <table className="table table-striped table-hover ">
            <thead>
                <tr>
                <th>#</th>
                <th>Padrón</th>
                <th>Apellido</th>
                <th>Nombre</th>
                <th>Estado</th>
                <th></th>
                </tr>
            </thead>
            <tbody>
                {this.state.students.map(function(student, idx){
                    return (
                        <tr key={student.id}>
                            <td>{idx + 1}</td>
                            <td>{student.id}</td>
                            <td>{student.apellido}</td>
                            <td>{student.nombre}</td>
                            <td>{student.estado}</td>
                            {(student.estado == "Condicional") && <td><a href="#" className="btn btn-primary" onClick={this.acceptConditional.bind(this)}>Aceptar</a></td>}
                            {(student.estado != "Condicional") && <td></td>}
                        </tr>
                    )
                }, this)}
                
            </tbody>
            </table>
            
            {this.state.conditional &&  <Modal
            show={this.state.conditional}
            onHide={this.handleHide.bind(this)}
            container={this}
            aria-labelledby="contained-modal-title"
            >
            <Modal.Header>
                <Modal.Title id="contained-modal-title">
                Aceptar alumno condicional
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                ¿Estás seguro que deseas aceptar a este alumno?
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={this.handleHide.bind(this)}>Cancelar</Button>
                <Button bsStyle="primary" onClick={this.handleHide.bind(this)}>Aceptar</Button>
            </Modal.Footer>
            </Modal>}

        </div>
        </div>
        </div>

        );
    }
}

export default SubjectStudents;