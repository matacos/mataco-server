import React, { Component } from 'react';
import '../App.css';
import Proxy from '../Proxy';
import { Modal, Button } from 'react-bootstrap';
import { Glyphicon, Alert, DropdownButton, MenuItem, Tooltip, OverlayTrigger } from 'react-bootstrap';
import Assistant from "../Assistant";
import ReactFileReader from 'react-file-reader';
import BootstrapTable  from 'react-bootstrap-table-next';
import ToolkitProvider, { CSVExport } from 'react-bootstrap-table2-toolkit';
import paginationFactory from 'react-bootstrap-table2-paginator';
import cellEditFactory from 'react-bootstrap-table2-editor';
import { DatePickerInput } from 'rc-datepicker';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import 'react-bootstrap-table2-toolkit/dist/react-bootstrap-table2-toolkit.min.css';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';
import 'moment/locale/es.js';

class Exam extends Component {
    constructor(props) {
        super(props);

        this.state = {
            students: [],
            columns: [],
            data: null,
            wait: true,
            showCancelModal: false,
            showImportModal: false,
            showModifyExam: false,
            selectedFile: false,
            file: null,
            errors: null,
            ok: false,
            examData: null,
            inputError: false,
            errorMsg: '',
        };
    }

    getStudents() {
        let examId = this.props.match.params.idExamen;
        return Proxy.getExamStudents(examId)
        .then(students => this.setState({students: students, wait: false}));
    }

    getExamData() {
        let subject = this.props.match.params.idMateria;
        let departmentCode = subject.slice(0,2);
        let subjectCode = subject.slice(2,4);
        let examId = this.props.match.params.idExamen;

        return Proxy.getExamData(departmentCode, subjectCode, Assistant.getField("username"), examId)
        .then(result => {
            let parts = result.exam_date.substring(0, 10).match(/(\d+)/g);
            let date = new Date(parts[0], parts[1] - 1, parts[2]);

            let examData = {
                classroom: result.classroom_code,
                place: result.classroom_campus,
                date: date,
                beginning: result.beginning.substring(0, 5),
                ending: result.ending.substring(0, 5)
            };

            this.setState({data: result, examData: examData});
        });
    }

    componentDidMount() {
        this.getStudents();
        this.getExamData();
    }

    componentDidUpdate(prevProps){
        if (this.props.match.params.idExamen != prevProps.match.params.idExamen) {
            this.getStudents();
            this.getExamData();
        }
    }

    showModal(modal) {
        if (modal == "cancel")
            this.setState({showCancelModal: true});
        else if (modal == "import")
            this.setState({showImportModal: true});
        else
            this.setState({showModifyExam: true})
    }

    cancelExam() {
        if (this.state.showCancelModal) {
            // Delete exam
            Proxy.deleteExam(this.props.match.params.idExamen)
            .then(() => {
                this.props.update(true);
                this.props.history.push('/home')
            });
        }
        this.handleHide("cancel");
    }

    handleHide(modal) {
        if (modal == "cancel") 
            this.setState({showCancelModal: false});
        else if (modal == "import")  {
            this.setState({showImportModal: false, selectedFile: false, file: null, errors: null, ok: false});
        }
        else {
            let parts = this.state.data.exam_date.substring(0, 10).match(/(\d+)/g);
            let date = new Date(parts[0], parts[1] - 1, parts[2]);
            let clearData = {
                classroom: this.state.data.classroom_code,
                place: this.state.data.classroom_campus,
                date: date,
                beginning: this.state.data.beginning.substring(0, 5),
                ending: this.state.data.ending.substring(0, 5)
            };
    
            this.setState({showModifyExam: false, examData: clearData, errorMsg: '', inputError: false});
        }
    }

    getDate() {
        var date = new Date();
        return date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate();
    }

    changeDateFormat(date, separator = "/") {
        var parts = date.match(/(\d+)/g);
        return (parts[2] + separator + parts[1] + separator + parts[0]);
    }
    
    assignGrade(student, grade) {
        let examId = this.props.match.params.idExamen;
        let now = new Date();
        let date = now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + now.getDate();
        Proxy.putStudentExamGrade(examId, student.id, grade, date);
    }

    selectFiles(files) {
        this.setState({selectedFile: true, file: files[0], errors: null, ok: false});
        var reader = new FileReader();
            reader.onload = function(e) {
                // Use reader.result
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
            let examId = this.props.match.params.idExamen;
            Proxy.uploadFile("/inscripciones_final/" + examId + "/csv_notas", this.state.file)
            .then(res => {
                if (res) {
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

    validInput() {
        var errorMsg = "Debe completar todos los campos para modificar un examen";
        var begin = this.state.examData.beginning.split(":");
        var end = this.state.examData.ending.split(":");

        if (this.state.examData.classroom.length == 0)
            return [false, errorMsg];

        let dateValidation = this.validDate();
        if (!dateValidation[0])
            return dateValidation;

        return this.validTime(begin[0], begin[1], end[0], end[1]);
    }

    validTime(beginningHour, beginningMinutes, endingHour, endingMinutes) {
        if (beginningHour.length > 0 && beginningMinutes.length > 0 && endingHour.length > 0 && endingMinutes.length > 0) 
            if ((beginningHour < endingHour) || ((beginningHour == endingHour) && (beginningMinutes < endingMinutes))) {
                if (parseInt(beginningHour) < 7 || parseInt(endingHour) > 23 || (parseInt(endingHour) == 23 && parseInt(endingMinutes) != 0))
                    return [false, "Recuerde que el horario debe ser entre las 7 hs y las 23 hs"];
                return [true, ""];
            }
            else
                return [false, "Recuerde que el horario de finalización debe ser posterior al horario de inicio"];
        return [false, "Debe completar todos los campos para agregar un examen"];
    }

    validDate() {
        let date = new Date(this.state.examData.date);
        console.log(date.getDate());
        let currentDate = new Date();
        if (!this.isDateInExamsPeriod(date))
            return [false, "No es posible crear un examen fuera del período de exámenes"];
        if (date.getDay() == 0)
            return [false, "No es posible crear un examen para un domingo"];
        if (date.getFullYear() < currentDate.getFullYear())
            return [false, "No es posible crear un examen para un año anterior al actual"];
        if ((date.getFullYear() == currentDate.getFullYear()) && (date.getMonth() < currentDate.getMonth()))
            return [false, "No es posible crear un examen para un mes que ya pasó"];
        if ((date.getMonth() == currentDate.getMonth()) && (date.getDate() < currentDate.getDate()))
            return [false, "No es posible crear un examen para un día que ya pasó"];
        if ((date.getMonth() == currentDate.getMonth()) && (date.getDate() < currentDate.getDate() + 2))
            return [false, "No es posible crear un examen con menos de 48 hs de anticipación"];
        return [true, ""];
    }

    modifyExam() {
        if (this.state.showModifyExam) {
            var newExam = null;
            var date = new Date(this.state.examData.date);
            let validationResult = this.validInput();
            if (validationResult[0]) {
                let subject = this.props.match.params.idMateria;
                let departmentCode = subject.slice(0,2);
                let subjectCode = subject.slice(2,4);
                let examId = this.props.match.params.idExamen;
                newExam = {
                    semester_code: Assistant.getField("code"),
                    department_code: departmentCode,
                    subject_code: subjectCode,
                    examiner_username: Assistant.getField("username"),
                    classroom_code: this.state.examData.classroom,
                    classroom_campus: this.state.examData.place.length == 0 ? "Paseo Colón" : this.state.examData.place,
                    beginning: this.state.examData.beginning,
                    ending: this.state.examData.ending,
                    exam_date: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() 
                }
                
                Proxy.modifyExam(examId, newExam)
                .then(this.getExamData());
                this.handleHide("modify");
                this.props.update(true);
            }
            else {
                this.setState({inputError: true, errorMsg: validationResult[1]})
            }
        }
    }

    canPutGrades() {
        let date = new Date();
        if (this.state.data != null) {
            let parts = this.state.data.exam_date.substring(0, 10).match(/(\d+)/g);
            let examDate = new Date(parts[0], parts[1] - 1, parts[2]);
            let examEnd = this.state.examData.ending.split(":");
            if (date > examDate)
                return true;
            else if ((date.getFullYear() == examDate.getFullYear()) && (date.getMonth() == examDate.getMonth()) && (date.getDate() == examDate.getDate())) {
                if (date.getHours() > examEnd[0])
                    return true;
                if ((date.getHours() == examEnd[0]) && (date.getMinutes() > examEnd[1]))
                    return true;
            }
            return false;  
        }
        else 
            return false;  
    }

    isDateInExamsPeriod(examDate){
        let leftLimit = new Date(Assistant.getField("classes_ending_date"));
        let rightLimit = new Date(Assistant.getField("exams_ending_date"));
        console.log("leftLimit: " + leftLimit);
        console.log("rightLimit: " + rightLimit);
        console.log("examDate: " + examDate);
        return examDate >= leftLimit && examDate <= rightLimit;
    }

    render() {
        const columns = [
        {
            dataField: 'id',
            text: 'Padrón',
            sort: true,
            editable: false
        },
        {
            dataField: 'surname',
            text: 'Apellido',
            sort: true,
            editable: false
        },
        {
            dataField: 'name',
            text: 'Nombre',
            sort: true,
            editable: false
        },
        {
            dataField: 'condition',
            text: 'Condición',
            sort: true,
            editable: false
        },
        {
            dataField: 'priority',
            text: 'Prioridad',
            sort: true,
            editable: false,
            csvType: Number
        },
        {
            dataField: 'grade',
            text: 'Nota de final',
            editable: this.canPutGrades(),   
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
            <h1 style={{color: "#696969"}}>Sistema de Gestión Académica</h1>
            <hr/>
            {this.state.data != null && <div><h2> {"Final " + this.state.data.subject.name } <br /> 
            <span className="text-primary">{this.changeDateFormat(this.state.data.exam_date.substring(0, 10))} </span></h2>
            <div className="well" style={{marginBottom: "2em"}}>
                <div className="row">
                <div className="col-md-3" style={{borderRight: "0.5px solid #cccccc"}}>
                    <h4 style={{color: "#696969"}}> {"Aula: " + this.state.data.classroom_code } </h4>
                    <h4 style={{color: "#696969"}}> {"Sede: " + this.state.data.classroom_campus }</h4>
                </div>
                <div className="col-md-9" style={{paddingLeft: "2.5em"}}>
                    <h4 style={{color: "#696969"}}> {"Horario: " + this.state.data.beginning.substring(0, 5) + " a " + this.state.data.ending.substring(0, 5) } <DropdownButton
                    title="Opciones"
                    bsStyle="primary pull-right"
                    id="dropdown-menu"
                    >
                    {/*
                    <MenuItem eventKey="1">Modificar final</MenuItem>
                    <MenuItem eventKey="2">Descargar listado de alumnos</MenuItem>*/}
                    <MenuItem eventKey="1" onClick={this.showModal.bind(this, "modify")}>Modificar final</MenuItem>
                    <MenuItem divider />
                    <MenuItem eventKey="2" onClick={this.showModal.bind(this, "cancel")}><h5 style={{color: "red"}}>Cancelar final</h5></MenuItem>
                    </DropdownButton></h4>
                    <h4 style={{color: "#696969"}}> {"Cuatrimestre: " + this.state.data.semester_code }</h4>
                </div>
                </div>
            </div>
            </div>}
            
            {!this.state.wait && ((this.state.students.length == 0 && <h3 className="text-primary text-center">No hay alumnos inscriptos en este final </h3>) || <div>
        
            <ToolkitProvider 
                    keyField="idx" 
                    data={ this.state.students.map(function(student, idx){ 
                        student.idx = idx + 1;
                        student.id = parseInt(student.id);
                        student.priority = parseInt(student.priority);
                        return student;
                        }, this) }
                    columns={ columns }
                    exportCSV={{
                        fileName: 'alumnos_final_' + (this.state.data ? this.changeDateFormat(this.state.data.exam_date.substring(0, 10), "-") : this.props.match.params.idMateria) + '.csv'
                    }} >
                {
                    props => (
                        
                    <div>
                        {this.canPutGrades() &&
                        <button type="button" className="btn btn-primary pull-right" style={{marginBlockStart: "-0.2em", marginInlineStart: "0.5em"}} onClick={this.showModal.bind(this, "import")}><Glyphicon glyph="upload" /> Subir archivo de notas</button>}
                        <ExportCSVButton { ...props.csvProps } type="button" className="btn btn-primary pull-right" style={{marginTop: "-0.2em"}}> <Glyphicon glyph="download" /> Descargar listado de alumnos</ExportCSVButton>                    
                        
                        <h3> Listado de alumnos inscriptos
                            <OverlayTrigger placement="right" overlay={tooltip}>
                            <span className="badge" style={{marginLeft: "1em"}}> {this.state.students.length} </span>
                            </OverlayTrigger>
                        </h3>
                        <hr />
                        <BootstrapTable striped hover bordered={ false } { ...props.baseProps } cellEdit={ cellEdit } pagination={ paginationFactory() } />
                    </div>
                    )
                }
                </ToolkitProvider>
            </div>)}
            
            {this.state.showCancelModal &&  <Modal
            show={this.state.showCancelModal}
            onHide={this.handleHide.bind(this, "cancel")}
            container={this}
            aria-labelledby="contained-modal-title"
            >
            <Modal.Header>
                <Modal.Title id="contained-modal-title">
                Cancelar examen
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                ¿Estás seguro que deseas cancelar este examen? <br /><br />
                <small className="text-muted">Se enviará una notificación a los alumnos inscriptos.</small>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={this.handleHide.bind(this, "cancel")}>Cancelar</Button>
                <Button bsStyle="primary" onClick={this.cancelExam.bind(this)}>Aceptar</Button>
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
                Importar notas de final
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
                <Button onClick={this.handleHide.bind(this, "import")}>Volver</Button>
                <Button bsStyle="primary" onClick={this.handleFiles.bind(this)}><Glyphicon glyph="upload" /> Importar notas</Button>
            </Modal.Footer>
            </Modal>}

            {this.state.showModifyExam &&  <Modal
            show={this.state.showModifyExam}
            onHide={this.handleHide.bind(this, "modify")}
            container={this}
            aria-labelledby="contained-modal-title"
            >
            <Modal.Header>
                <Modal.Title id="contained-modal-title">
                Agregar final
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
            <form className="form-horizontal">
            <fieldset>
                <div className="form-group">
                <label htmlFor="select" className="col-lg-2 control-label">Sede</label>
                <div className="col-lg-10">
                    <select value={this.state.examData.place} className="form-control" id="sede" onChange={ e => {
                        var newData = this.state.examData;
                        newData.place = e.target.value;
                        this.setState({ examData : newData });
                        }}>
                    <option>Paseo Colón</option>
                    <option>Las Heras</option>
                    </select>
                </div>
                </div>

                <div className="form-group">
                <label htmlFor="inputAula" className="col-lg-2 control-label">Aula</label>
                <div className="col-lg-3">
                    <input type="text" value={this.state.examData.classroom} className="form-control" id="inputAula" onChange={ e => {
                        const re = /^[a-zA-Z0-9]+$/;

                        if ((e.target.value == "" || re.test(e.target.value)) && (e.target.value.length < 100)) {
                            var newData = this.state.examData;
                            newData.classroom = e.target.value;
                            this.setState({examData: newData});
                        }
                    } }/>
                </div>
                </div>        
                
                <div className="form-group">
                <label htmlFor="select" className="col-lg-2 control-label">Fecha</label>
                <div className="col-lg-3">
                    <DatePickerInput
                    onChange={value => {
                        var newData = this.state.examData;
                        newData.date = value;
                        this.setState({ examData : newData });
                        }}
                    value={this.state.examData.date}
                    className='my-custom-datepicker-component'
                    />
                </div>
                </div>

                <div className="form-group">
                <label htmlFor="inputInicio" className="col-lg-2 control-label">Horario de inicio</label>
                <div className="col-lg-3">
                    <input type="time" value={this.state.examData.beginning} className="form-control" id="inputInicio" onChange={ e => {
                        var newData = this.state.examData;
                        newData.beginning = e.target.value;
                        this.setState({ examData : newData });
                        }}/>
                </div>
                </div>

                <div className="form-group">
                <label htmlFor="inputFin" className="col-lg-2 control-label">Horario de fin</label>
                <div className="col-lg-3">
                    <input type="time" value={this.state.examData.ending} className="form-control" id="inputFin" onChange={ e => {
                        var newData = this.state.examData;
                        newData.ending = e.target.value;
                        this.setState({ examData : newData });
                        }}/>
                </div>
                </div>

            </fieldset>
            </form>
            {this.state.inputError && 
                        <div className="alert alert-dismissible alert-danger" >
                            <button type="button" className="close" data-dismiss="alert" onClick={ e => this.setState({ inputError : false }) }>&times;</button>
                            <a href="#" className="alert-link"/>{this.state.errorMsg}
                        </div>}
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={this.handleHide.bind(this, "modify")}>Cancelar</Button>
                <Button bsStyle="primary" onClick={this.modifyExam.bind(this)}>Aceptar</Button>
            </Modal.Footer>
            </Modal>}
                
        </div>

        );
    }
}

export default Exam;