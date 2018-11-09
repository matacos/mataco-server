import React, { Component } from 'react';
import '../App.css';
import Proxy from '../Proxy';
import { Glyphicon, Tabs, Tab, PageHeader, OverlayTrigger, Tooltip, Modal, Button } from 'react-bootstrap';
import BootstrapTable  from 'react-bootstrap-table-next';
import ToolkitProvider, { CSVExport } from 'react-bootstrap-table2-toolkit';
import cellEditFactory from 'react-bootstrap-table2-editor';
import paginationFactory from 'react-bootstrap-table2-paginator';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import 'react-bootstrap-table2-toolkit/dist/react-bootstrap-table2-toolkit.min.css';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';

class SubjectStudents extends Component {
    constructor(props) {
        super(props);

        this.state = {
            students: [],
            columns: [],
            conditional: null,
            key: 1,
            wait: true
        };
    }

    getStudents() {
        let courseId = this.props.match.params.idCurso.substr(4);
        Proxy.getCourseStudents(courseId)
        .then(students => {
            this.setState({students: students, wait: false});
        });
    }

    componentDidMount() {
        this.getStudents();
    }

    componentDidUpdate(prevProps){
        if (this.props.match.params.idMateria != prevProps.match.params.idMateria) {
            this.getStudents();
        }
    }

    getSubjectName() {
        return this.props.match.params.nombreMateria.replace(/-/g, " ");
    }

    showConditionalModal(student) {
        this.setState({conditional: student})
    }

    acceptConditional() {
        if (this.state.conditional) {
            let courseId = this.props.match.params.idCurso.substr(4);
            Proxy.putAcceptConditionalStudent(courseId, this.state.conditional.id)
            .then(students => this.setState({students: students}));
        }
        this.handleHide();
    }

    assignGrade(student, grade) {
        let courseId = this.props.match.params.idCurso.substr(4);
        Proxy.putStudentCourseGrade(courseId, student.id, grade);
    }

    handleHide() {
        this.setState({conditional: null})
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
            sort: true,
            editable: false
        },
        {
            dataField: 'apellido',
            text: 'Apellido',
            sort: true,
            editable: false
        },
        {
            dataField: 'nombre',
            text: 'Nombre',
            sort: true,
            editable: false
        },
        {
            dataField: 'estado',
            text: 'Estado',
            editable: false
        },
        {
            dataField: 'prioridad',
            text: 'Prioridad',
            sort: true,
            editable: false
        },
        {
            dataField: 'nota',
            text: 'Nota de cursada',
            validator: (newValue, row, column) => {
                if (newValue == "-")
                    return true;
                if (isNaN(newValue)) {
                  return {
                    valid: false,
                    message: 'La nota debe ser un número o "-" en caso de no existir'
                  };
                }
                if (newValue < 1 || newValue > 10) {
                  return {
                    valid: false,
                    message: 'La nota debe ser un valor entre 1 y 10'
                  };
                }
                return true;
            }
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

        const tooltip = (
            <Tooltip id="tooltip">
              Cantidad de alumnos inscriptos
            </Tooltip>
        );

        const { ExportCSVButton } = CSVExport;
        const cellEdit = cellEditFactory({ 
            mode: 'click', 
            blurToSave: true,
            beforeSaveCell: (oldValue, newValue, row, column) => { this.assignGrade(row, newValue) }
        });

        return (
        <div>  
            <div className="jumbotron" style={{backgroundColor: "#C0C0C0"}}>
                <h1>Sistema de <br/> Gestión Académica</h1>
            </div>
            
            <PageHeader style={{marginBottom: "4em"}}> {this.getSubjectName()} </PageHeader>
            
            {!this.state.wait && ((regularStudents.length == 0 && <h3 className="text-primary text-center">No hay alumnos inscriptos en este curso </h3>) || <div>
            <Tabs activeKey={(conditionalStudents.length > 0 && this.state.key) || 1}
                onSelect={this.handleSelect.bind(this)}
                id="controlled-tab">
            <Tab eventKey={1} title={<h4 className={(this.state.key == 1 && "text-primary") || ""}>Alumnos Regulares</h4>}>
                <div style={{paddingTop: "1.5em", paddingBottom: "0.25em"}}>
                <h3> Listado de alumnos regulares
                    <OverlayTrigger placement="right" overlay={tooltip}>
                    <span className="badge" style={{marginLeft: "1em"}}> {regularStudents.length} </span>
                    </OverlayTrigger>
                    <hr />
                </h3>

                <ToolkitProvider 
                    keyField="idx" 
                    data={ regularStudents.map(function(student, idx){ 
                        student.idx = idx + 1;
                        student.padron = parseInt(student.padron);
                        student.prioridad = parseInt(student.prioridad);
                        return student;}, this) }
                    columns={ columns }
                    exportCSV={{
                        fileName: 'alumnos_' + this.props.match.params.idCurso.substr(0, 4) + '.csv'
                    }} >
                {
                    props => (
                    <div>
                        <BootstrapTable striped hover bordered={ false } { ...props.baseProps } cellEdit={ cellEdit } pagination={ paginationFactory() } />
                        <ExportCSVButton { ...props.csvProps } className="btn btn-primary pull-right" style={{marginTop: "0.5em"}}> <Glyphicon glyph="download" /> Descargar listado</ExportCSVButton>
                    </div>
                    )
                }
                </ToolkitProvider>

                </div>
            </Tab>

            {conditionalStudents.length > 0 &&
            <Tab eventKey={2} title={<h4 className={(this.state.key == 2 && "text-primary") || ""}>Alumnos Condicionales</h4>}>
            
            <div style={{paddingTop: "1.5em"}}>
            <h3 style={{paddingBottom: "1em"}}> Listado de alumnos condicionales 
                <OverlayTrigger placement="right" overlay={tooltip}>
                    <span className="badge" style={{marginLeft: "1em"}}> {conditionalStudents.length} </span>
                </OverlayTrigger>
            </h3>
            <BootstrapTable keyField='idx' striped hover bordered={ false } key='idx' data={ conditionalStudents.map(function(student, idx){ 
                    student.idx = idx + 1;
                    student.padron = parseInt(student.padron);
                    student.prioridad = parseInt(student.prioridad);
                    student.aceptar = <button type="button" className="btn btn-primary pull-right" onClick={this.showConditionalModal.bind(this, student)}><Glyphicon glyph="ok" /> Aceptar</button>;
                    return student;}, this) } columns={ conditionalColumns } />
            </div>
            </Tab>}
            </Tabs>
            </div>)}
            
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

        );
    }
}

export default SubjectStudents;