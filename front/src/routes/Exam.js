import React, { Component } from 'react';
import '../App.css';
import Proxy from '../Proxy';
import { Modal, Button } from 'react-bootstrap';
import { Glyphicon, Tabs, Tab, PageHeader } from 'react-bootstrap';
import Assistant from "../Assistant";
import BootstrapTable  from 'react-bootstrap-table-next';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';

class Exam extends Component {
    constructor(props) {
        super(props);

        this.state = {
            students: [],
            columns: [],
            data: null,
            wait: true
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
        .then(result => this.setState({data: result}))
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

    /*

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

    handleHide() {
        this.setState({conditional: null})
    }
    */

    render() {

        const columns = [
        {
            dataField: 'id',
            text: 'Padrón',
            sort: true
        },
        {
            dataField: 'surname',
            text: 'Apellido',
            sort: true
        },
        {
            dataField: 'name',
            text: 'Nombre',
            sort: true
        },
        {
            dataField: 'condition',
            text: 'Condición',
            sort: true
        },
        {
            dataField: 'priority',
            text: 'Prioridad',
            sort: true
        }
        ];
        console.log(this.state.data)
        return (
        <div>  
            <div className="jumbotron" style={{backgroundColor: "#C0C0C0"}}>
                <h1>Sistema de <br/> Gestión Académica</h1>
            </div>
            
            {this.state.data != null && <div><PageHeader style={{marginBottom: "2em"}}> {"Final " + this.state.data.subject.name } <br /> <span className="text-primary">{this.state.data.exam_date.substring(0, 10)} </span></PageHeader>
            <div className="well" style={{marginBottom: "2em"}}>
            <h4 style={{color: "#696969"}}> {"Aula: " + this.state.data.classroom_code }</h4>
            <h4 style={{color: "#696969"}}> {"Sede: " + this.state.data.classroom_campus }</h4>
            <h4 style={{color: "#696969"}}> {"Inicio: " + this.state.data.beginning.substring(0, 5) }</h4>
            <h4 style={{color: "#696969"}}> {"Finalización: " + this.state.data.ending.substring(0, 5) }</h4>
            <h4 style={{color: "#696969"}}> {"Cuatrimestre: " + this.state.data.semester_code }</h4>
            </div>
            </div>}
            
            {!this.state.wait && ((this.state.students.length == 0 && <h3 className="text-primary text-center">No hay alumnos inscriptos en este final </h3>) || <div>
            <h3 style={{paddingBottom: "1em"}}> Listado de alumnos inscriptos <span className="badge"> {this.state.students.length} </span></h3>
            <BootstrapTable keyField='idx' striped hover bordered={ false } data={ this.state.students.map(function(student, idx){ 
                student.idx = idx + 1;
                student.id = parseInt(student.id);
                student.priority = parseInt(student.priority);
                return student;
                }, this)} columns={ columns } />
            </div>)}
            
            {/*(this.state.conditional != null) &&  <Modal
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
            </Modal>*/}
                
        </div>

        );
    }
}

export default Exam;