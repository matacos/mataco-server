import React, { Component } from 'react';
import '../App.css';
import Panel from '../components/Panel';
import Proxy from '../Proxy';
import { Modal, Button } from 'react-bootstrap';
import { Glyphicon, Tabs, Tab, PageHeader } from 'react-bootstrap';
import BootstrapTable  from 'react-bootstrap-table-next';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import Assistant from '../Assistant';

class SubjectStudents extends Component {
    constructor(props) {
        super(props);

        this.state = {
            subject: "Algoritmos y Programación III",
            courseId: this.props.match.params.idCurso.substr(4),
            selectSubjects: false,
            students: [],
            columns: [],
            conditional: null,
            key: 1
        };
        console.log(this.state.courseId)
    }

    componentDidMount() {

        Proxy.getCourseStudents(this.state.courseId)
        .then(
            (result) => {
                //this.setState({courses: result.courses})
                console.log(result.courseInscriptions)
                var studentsList = result.courseInscriptions.map(inscription => {
                    var data = {};
                    data.estado = inscription.accepted ? "Regular" : "Condicional";
                    data.nombre = inscription.student.name;
                    data.apellido = inscription.student.surname;
                    data.prioridad = "2";
                    data.id = inscription.student.username;
                    return data;
                })
                Assistant.setField("token", result.token);
                this.setState({students: studentsList})
            },
            (error) => {
                console.log(error)
            }
        ) 
        /*
        this.setState({students: [{id: "98557", apellido: "Rodriguez", nombre: "Roberto", estado: "Regular", prioridad: "1"},
                        {id: "87445", apellido: "Herrera", nombre: "Candela", estado: "Regular", prioridad: "12"},
                        {id: "94333", apellido: "Pérez", nombre: "Julieta", estado: "Regular", prioridad: "3"},
                        {id: "96421", apellido: "Dominguez", nombre: "Juan", estado: "Condicional", prioridad: "6"},
                        {id: "98765", apellido: "Álvarez", nombre: "Maria", estado: "Regular", prioridad: "11"},
                        {id: "93242", apellido: "Pazzini", nombre: "Rodrigo", estado: "Regular", prioridad: "24"},
                        {id: "91872", apellido: "Marconi", nombre: "Luciano", estado: "Condicional", prioridad: "33"}]})

        */
    }

    showConditionalModal(student) {
        this.setState({conditional: student})
    }

    acceptConditional() {
        var updatedList = this.state.students;
        if (this.state.conditional) {
            for (var i = 0; i < updatedList.length; i++) {
                if (updatedList[i].id == this.state.conditional.id) {

                    updatedList[i].estado = "Regular";

                    

                    Proxy.putAcceptConditionalStudent(this.state.courseId, this.state.conditional.id)
                    .then(
                        (result) => {
                            //Assistant.setField("token", result.token);

                            Proxy.getCourseStudents(this.state.courseId)
                            .then(
                                (result) => {
                                    //this.setState({courses: result.courses})
                                    console.log(result.courseInscriptions)
                                    var studentsList = result.courseInscriptions.map(inscription => {
                                        var data = {};
                                        data.estado = inscription.accepted ? "Regular" : "Condicional";
                                        data.nombre = inscription.student.name;
                                        data.apellido = inscription.student.surname;
                                        data.prioridad = "2";
                                        data.id = inscription.student.username;
                                        return data;
                                    })
                                    Assistant.setField("token", result.token);
                                    this.setState({students: studentsList})
                                },
                                (error) => {
                                    console.log(error)
                                }
                            ) 

                        },
                        (error) => {
                            console.log(error)
                        }
                    ) 

                    
                    
                }
            }
        }
        this.setState({students: updatedList});
        this.handleHide();
    }

    handleHide() {
        this.setState({conditional: null})
    }

    setSelectedSubjects(bool) {
        this.setState({selectSubjects: bool});
    }

    handleSelect() {
        if (this.state.key == 1) {
            this.setState({key: 2})
        }
        else {
            this.setState({key: 1})
        }
    }

    render() {
        var conditionalStudents = this.state.students.filter(student => student.estado == "Condicional");
        var regularStudents = this.state.students.filter(student => student.estado == "Regular");

        const columns = [
        {
            dataField: 'id',
            text: 'Padrón',
            sort: true
        },
        {
            dataField: 'apellido',
            text: 'Apellido',
            sort: true
        },
        {
            dataField: 'nombre',
            text: 'Nombre',
            sort: true
        },
        {
            dataField: 'estado',
            text: 'Estado'
        },
        {
            dataField: 'prioridad',
            text: 'Prioridad',
            sort: true
        }
        ];
        const conditionalColumns = [
        {
            dataField: 'prioridad',
            text: 'Prioridad',
            sort: true
        },
        {
            dataField: 'id',
            text: 'Padrón',
            sort: true
        },
        {
            dataField: 'apellido',
            text: 'Apellido',
            sort: true
        },
        {
            dataField: 'nombre',
            text: 'Nombre',
            sort: true
        },
        {
            dataField: 'estado',
            text: 'Estado'
        },
        {
            dataField: 'aceptar',
            text: ''
        }];


        return (
        <div>
            <div className="row">
            <Panel selectedSubjects={this.state.selectSubjects} setSelectedSubjects={this.setSelectedSubjects.bind(this)}/>
            
            <div className="jumbotron col-md-9" style={{backgroundColor: "#C0C0C0"}}>
                <h1>Sistema de <br/> Gestión Académica</h1>
            </div>

            <div className="col-md-9">
            
            <PageHeader style={{marginBottom: "4em"}}> {this.state.subject} </PageHeader>
            
            <Tabs activeKey={(conditionalStudents.length > 0 && this.state.key) || 1}
                onSelect={this.handleSelect.bind(this)}
                id="controlled-tab">
            <Tab eventKey={1} title={<h4 className={(this.state.key == 1 && "text-primary") || ""}>Alumnos Regulares</h4>}>
                <div style={{paddingTop: "1.5em"}}>
                <h3 style={{paddingBottom: "1em"}}> Listado de alumnos regulares <span className="badge"> {regularStudents.length} </span></h3>
                <BootstrapTable keyField='idx' striped hover bordered={ false } data={ regularStudents.map(function(student, idx){ 
                    student.idx = idx + 1;
                    student.padron = parseInt(student.padron);
                    student.prioridad = parseInt(student.prioridad);
                    return student;}, this) } columns={ columns } />
                </div>
            </Tab>
            {conditionalStudents.length > 0 &&
            <Tab eventKey={2} title={<h4 className={(this.state.key == 2 && "text-primary") || ""}>Alumnos Condicionales</h4>}>
            
            <div style={{paddingTop: "1.5em"}}>
            <h3 style={{paddingBottom: "1em"}}> Listado de alumnos condicionales <span className="badge"> {conditionalStudents.length} </span></h3>
            <BootstrapTable keyField='idx' striped hover bordered={ false } key='idx' data={ conditionalStudents.map(function(student, idx){ 
                    student.idx = idx + 1;
                    student.padron = parseInt(student.padron);
                    student.prioridad = parseInt(student.prioridad);
                    student.aceptar = <button type="button" className="btn btn-primary pull-right" onClick={this.showConditionalModal.bind(this, student)}><Glyphicon glyph="ok" /> Aceptar</button>;
                    return student;}, this) } columns={ conditionalColumns } />
            </div>
            </Tab>}
            </Tabs>
            
            {(this.state.conditional != null) &&  <Modal
            show={this.state.conditional != null}
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
                <Button bsStyle="primary" onClick={this.acceptConditional.bind(this)}>Aceptar</Button>
            </Modal.Footer>
            </Modal>}

        </div>
        </div>
        </div>

        );
    }
}

export default SubjectStudents;