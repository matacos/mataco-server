import React, { Component } from 'react';
import '../App.css';
import Proxy from '../Proxy';
import { Alert, Glyphicon, Tabs, Tab, PageHeader, OverlayTrigger, Tooltip, Modal, Button } from 'react-bootstrap';
import BootstrapTable  from 'react-bootstrap-table-next';
import ToolkitProvider, { CSVExport } from 'react-bootstrap-table2-toolkit';
import cellEditFactory from 'react-bootstrap-table2-editor';
import paginationFactory from 'react-bootstrap-table2-paginator';
import ReactFileReader from 'react-file-reader';
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
            wait: true,
            selectedFile: false,
            file: null,
            errors: null,
            ok: false,
            showImportModal: false
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
        this.setState({conditional: student});
    }

    showImportModal() {
        this.setState({showImportModal: true});
    }

    acceptConditional() {
        if (this.state.conditional) {
            let courseId = this.props.match.params.idCurso.substr(4);
            Proxy.putAcceptConditionalStudent(courseId, this.state.conditional.id)
            .then(students => this.setState({students: students}));
        }
        this.handleHide("conditional");
    }

    assignGrade(student, grade) {
        let courseId = this.props.match.params.idCurso.substr(4);
        Proxy.putStudentCourseGrade(courseId, student.id, grade);
    }

    handleHide(modal) {
        if (modal == "conditional") 
            this.setState({conditional: null});
        else {
            this.setState({showImportModal: false, selectedFile: false, file: null, errors: null, ok: false});
        }

    }

    handleSelect() {
        if (this.state.key == 1) {
            this.setState({key: 2})
        }
        else {
            this.setState({key: 1})
        }
    }

    selectFiles(files) {
        this.setState({selectedFile: true, file: files[0], errors: null, ok: false});
        var reader = new FileReader();
            reader.onload = function(e) {
                // Use reader.result
                alert(reader.result);
                console.log(files[0]);
            }
        reader.readAsText(files[0]);
    }

    handleFiles() {
        this.setState({errors: null, ok: false});
        if (!this.state.selectedFile) {
            alert("Debe seleccionar un archivo para poder importar alumnos");
        }
        else {
            let courseId = this.props.match.params.idCurso.substr(4);
            Proxy.uploadFile("/inscripciones_cursos/" + courseId + "/csv_notas", this.state.file)
            .then(res => {
                if (res) {
                    console.log(res)
                    let errors = res.errors.map((error, idx) => {
                        return (
                            <div key={idx}>
                                <ul>
                                    <li><strong>{"Línea " + (error.lineNumber + 1) + ":"} </strong></li>
                                    <ul>
                                        <li><strong>Datos: </strong> {" " + error.line} </li>
                                        <li><strong>Error: </strong> {" " + error.error} </li>
                                    </ul>
                                </ul>
                            </div>);
                    });
                    this.setState({errors: errors});
                }
                else {
                    this.setState({ok: true});
                }
            });
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
            editable: false,
            csvType: Number
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
            },
            csvType: Number
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
                        <button type="button" className="btn btn-primary pull-right" style={{marginBlockStart: "0.5em", marginInlineStart: "0.5em"}} onClick={this.showImportModal.bind(this)}><Glyphicon glyph="upload" /> Subir archivo de notas</button>
                        <ExportCSVButton { ...props.csvProps } type="button" className="btn btn-primary pull-right" style={{marginTop: "0.5em", marginBottom: "2em"}}> <Glyphicon glyph="download" /> Descargar listado de alumnos</ExportCSVButton>                    
                        <BootstrapTable striped hover bordered={ false } { ...props.baseProps } cellEdit={ cellEdit } pagination={ paginationFactory() } />
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
            onHide={this.handleHide.bind(this, "conditional")}
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
                <Button onClick={this.handleHide.bind(this, "conditional")}>Cancelar</Button>
                <Button bsStyle="primary" onClick={this.acceptConditional.bind(this)}>Aceptar</Button>
            </Modal.Footer>
            </Modal>}

            {this.state.showImportModal &&  <Modal
            show={this.state.showImportModal}
            onHide={this.handleHide.bind(this, "import")}
            container={this}
            aria-labelledby="contained-modal-title"
            >
            <Modal.Header>
                <Modal.Title id="contained-modal-title">
                Importar notas de cursada
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="row" style={{paddingTop: "0.7em"}}>
                    <div className="col-lg-3">
                        <ReactFileReader handleFiles={this.selectFiles.bind(this)} fileTypes={'.csv'}>
                            <button id="exampleInputFile" className="form-control-file" aria-describedby="file" style={{color: "black"}}> Examinar... </button>
                        </ReactFileReader>
                    </div>
                    <div className="col-lg-9">
                        <p id="fileInfo" className="text-primary" style={{marginLeft: "-2em", paddingTop: "0.2em"}}> {this.state.selectedFile ? this.state.file.name : "No se seleccionó un archivo."}</p>
                    </div>
                </div>
                {(this.state.errors != null) && <Alert bsStyle="danger" style={{marginTop: "2em"}}>
                <h3 className="text-danger" style={{paddingBottom: "1em"}}> Errores encontrados </h3>
                {this.state.errors}
                </Alert>}

                {this.state.ok && <Alert bsStyle="success" style={{marginTop: "2em"}}>
                    <p className="text-center">Las notas fueron importadas exitosamente!</p>
                </Alert>}
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={this.handleHide.bind(this)}>Volver</Button>
                <Button bsStyle="primary" onClick={this.handleFiles.bind(this)}><Glyphicon glyph="upload" /> Importar notas</Button>
            </Modal.Footer>
            </Modal>}

        </div>

        );
    }
}

export default SubjectStudents;