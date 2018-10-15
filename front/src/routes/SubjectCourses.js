import React, { Component } from 'react';
import '../App.css';
import Proxy from '../Proxy';
import Panel from '../components/Panel';
import { Modal, Button } from 'react-bootstrap';
import { Glyphicon, PageHeader } from 'react-bootstrap';

class SubjectCourses extends Component {
    constructor(props) {
        super(props);

        this.state = {
            code: this.props.match.params.idMateria,
            showAddSchedule: false,
            showRemovechedule: false,
            showAddTeacher: false,
            showRemoveTeacher: false,
            showAddCourse: false,
            showRemoveCourse: false,
            showChangeSlot: false,
            courses: null,
            selectedData: null,
            slots: '',
            'id': '',
            place: '',
            classroom: '',
            day: '',
            begin: '',
            end: '',
            type: '',
            inputError: false,
            errorMsg: ''
        };
    }

    setCoursesInformation(){
        let subject = this.props.match.params.idMateria;
        let departmentCode = subject.slice(0,2);
        let subjectCode = subject.slice(2,4);

        Proxy.getSubjectCourses(departmentCode, subjectCode)
        .then(courses => this.setState({courses: courses}));
        
    }

    componentDidUpdate(prevProps){
        if (this.props.match.params.idMateria != prevProps.match.params.idMateria){
            this.setCoursesInformation();
        }
    }

    componentDidMount() {
        this.setCoursesInformation();
    }

    getSubjectName() {
        return this.props.match.params.nombreMateria.replace(/-/g, " ");
    }

    showModal(modalType, data) {
        this.setState({selectedData: data});

        switch(modalType) {
            case "add_schedule":
                this.setState({showAddSchedule: true})
                break;
            case "remove_schedule":
                this.setState({showRemoveSchedule: true})
                break;
            case "add_teacher":
                this.setState({showAddTeacher: true})
                break;
            case "remove_teacher":
                this.setState({showRemoveTeacher: true})
                break;
            case "add_course":
                this.setState({showAddCourse: true})
                break;
            case "remove_course":
                this.setState({showRemoveCourse: true})
                break;
            case "change_slot":
                this.setState({showChangeSlot: true})
                break;
        }
    }

    handleHide(modalType) {
        this.setState({selectedData: null, inputError: false, errorMsg: '', slots: '', 'id': '', place: '', classroom: '', day: '', begin: '', end: '', type: ''});

        switch(modalType) {
            case "add_schedule":
                this.setState({showAddSchedule: false})
                break;
            case "remove_schedule":
                this.setState({showRemoveSchedule: false})
                break;
            case "add_teacher":
                this.setState({showAddTeacher: false})
                break;
            case "remove_teacher":
                this.setState({showRemoveTeacher: false})
                break;
            case "add_course":
                this.setState({showAddCourse: false})
                break;
            case "remove_course":
                this.setState({showRemoveCourse: false})
                break;
            case "change_slot":
                this.setState({showChangeSlot: false})
                break;
        }
        
    }

    validSlot(slot) {
        return (slot <= 300 && slot >= 5);
    }

    changeTotalSlot() {
        var value = parseInt(this.state.slots);
        if (this.validSlot(value)) {
            let body = {
                total_slots: value
            }
            
            Proxy.changeCourse(this.state.selectedData.course, body)
            .then(this.setCoursesInformation());
            this.handleHide("change_slot");
        }

        else {
            this.setState({inputError: true, errorMsg: "Debe ingresar un valor numérico entre 5 y 300"})
        }

    } 

    validSchedule(schedule) {
        var errorMsg = "Debe completar todos los campos para agregar un horario"
        if (schedule == null)
            return [false, errorMsg];

        if (schedule.classroomCode.length <= 0)
            return [false, errorMsg];
        
        if ((schedule.beginningHour < schedule.endingHour) || ((schedule.beginningHour == schedule.endingHour) && (schedule.beginningMinutes < schedule.endingMinutes))) 
            return [true, ""];
        return [false, "Recuerde que el horario de finalización debe ser posterior al horario de inicio"];
    }

    validTime(beginningHour, beginningMinutes, endingHour, endingMinutes) {
        return beginningHour.length > 0 && beginningMinutes.length > 0 && endingHour.length > 0 && endingMinutes.length > 0;
    }

    addSchedule() {
        var begin = this.state.begin.split(":");
        var end = this.state.end.split(":");
        var newSchedule = null;
        if (this.validTime(begin[0], begin[1], end[0], end[1])) {
            newSchedule = {
                classroomCode: this.state.classroom,
                classroomCampus: this.state.place.length == 0 ? "Paseo Colón" : this.state.place,
                beginningHour: parseInt(begin[0]),
                beginningMinutes: parseInt(begin[1]),
                endingHour: parseInt(end[0]),
                endingMinutes: parseInt(end[1]),
                dayOfWeek: this.state.day.length == 0 ? "lun" : this.state.day,
                description: this.state.type.length == 0 ? "Teórica Obligatoria" : this.state.type
            };
        }
        
        var validationResult = this.validSchedule(newSchedule);
        if (validationResult[0]) {
            Proxy.addSchedule(this.state.selectedData.course, newSchedule)
            .then(this.setCoursesInformation())
            this.handleHide("add_schedule");
        }
        else {
            this.setState({inputError: true, errorMsg: validationResult[1]})
        }
    } 

    addProfessor() {
        if ((this.state.id.length > 4) && (this.state.id.length <= 8)) {
            var newProfessor = {
                username: this.state.id,
                rol: this.state.type.length == 0 ? "Jefe de Cátedra" : this.state.type
            } 
            
            Proxy.addProfessor(this.state.selectedData.course, newProfessor)
            .then(res => {
                if (res.status == 500) {
                    this.setState({inputError: true, errorMsg: "Debe ingresar el DNI de un docente que no se encuentre en el curso"})
                } 
                else {
                    this.setCoursesInformation();
                    this.handleHide("add_teacher");
                }
            })
        }
        else {
            this.setState({inputError: true, errorMsg: "Recuerde que debe ingresar el DNI de un docente válido"})
        }
        
    } 

    addCourse() {
        var value = parseInt(this.state.slots);
        if (this.validSlot(value) && this.state.id.length > 0) {
            var newCourse = {
                cod_departamento: this.state.code.substr(0, 2),
                cod_materia: this.state.code.substr(2, 2),
                nombre: this.state.id,
                vacantes_totales: value
            }

            Proxy.addCourse(newCourse)
            .then(this.setCoursesInformation());
            this.handleHide("add_course");
        }

        else {
            this.setState({inputError: true, errorMsg: "Recuerde que la vacante es un valor numérico entre 5 y 300 y que el nombre del curso no puede exceder los 100 caracteres"})
        }

    } 

    removeCourse() {
        Proxy.deleteCourse(this.state.selectedData.course)
        .then(this.setCoursesInformation());
        this.handleHide("remove_course");
    }

    removeTeacher() {
        Proxy.deleteProfessor(this.state.selectedData.course, this.state.selectedData.professor.username)
        .then(this.setCoursesInformation());
        this.handleHide("remove_teacher");
    }

    removeSchedule() {
        Proxy.deleteSchedule(this.state.selectedData.course, this.state.selectedData.schedule.id)
        .then(this.setCoursesInformation());
        this.handleHide("remove_schedule");
    }

    render() {
        window.scrollTo(0, 0);
        return (
        <div>
            
            <div className="jumbotron" style={{backgroundColor: "#C0C0C0"}}>
                <h1>Sistema de <br/> Gestión Académica</h1>
            </div>
            
            {this.state.courses && <div>
            <div style={{paddingBottom:"4em"}}>
            <PageHeader style={{marginBottom: "1.2em"}}> Cursos de {this.getSubjectName()} </PageHeader>
            
            
            <button type="button" className="btn btn-primary pull-right" style={{marginRight: "1.5em"}} onClick={this.showModal.bind(this, "add_course")}><Glyphicon glyph="plus" /> Agregar curso</button>
            </div>
            
            {this.state.courses.map(function(course, idx) {
                return (<div key={idx} className="well">
                <h3 style={{paddingBottom: "0.5em"}}> Curso: {course.name} <button type="button" className="btn btn-danger pull-right" onClick={this.showModal.bind(this, "remove_course", course)}><Glyphicon glyph="minus" /> Eliminar curso</button></h3>
                <p style={{paddingBottom: "3em"}}>Cupo: {course.total_slots}<small><a style={{marginLeft:"0.5em"}} hlink='#' onClick={this.showModal.bind(this, "change_slot", course)}>Modificar cupo</a></small></p>
                <h4 className="text-primary" style={{paddingBottom: "1em"}}> Docentes </h4>
                
                <table className="table table-hover ">
                <thead>
                    <tr>
                    <th>DNI</th>
                    <th>Apellido</th>
                    <th>Nombre</th>
                    <th>Cargo</th>
                    <th></th>
                    </tr>
                </thead>
                <tbody>
                    {course.professors.map(function(professor, idx_professor){
                        var data = {}
                        data.professor = professor;
                        data.idx = idx;
                        data.course = course.course;
                        return (
                            <tr key={idx_professor}>
                                <td>{professor.username}</td>
                                <td>{professor.surname}</td>
                                <td>{professor.name}</td>
                                <td>{professor.role}</td>
                                <td><button type="button" className="btn btn-danger pull-right" onClick={this.showModal.bind(this, "remove_teacher", data)}><Glyphicon glyph="minus" /> Eliminar</button></td>
                            </tr>
                        )
                    }, this)}
                    
                </tbody>
                </table>
                <button type="button" className="btn btn-primary" style={{marginBottom: "4em"}} onClick={this.showModal.bind(this, "add_teacher", course)}><Glyphicon glyph="plus" /> Agregar docente</button>

                <h4 className="text-primary" style={{paddingBottom: "1em"}}> Información del curso </h4>
                <table className="table table-hover ">
                <thead>
                    <tr>
                    <th>Aula</th>
                    <th>Sede</th>
                    <th>Día</th>
                    <th>Horario</th>
                    <th>Tipo</th>
                    <th></th>
                    </tr>
                </thead>
                <tbody>
                    {course.time_slots.map(function(schedule, idx_schedule){
                        var data = {}
                        data.schedule = schedule;
                        data.idx = idx;
                        data.course = course.course;
                        return (
                            <tr key={idx_schedule}>
                                <td>{schedule.classroom_code}</td>
                                <td>{schedule.classroom_campus}</td>
                                <td>{schedule.day_of_week}</td>
                                <td>{schedule.beginning.substr(0, 5) + " a " + schedule.ending.substr(0, 5)}</td>
                                <td>{schedule.description}</td>
                                <td><button type="button" className="btn btn-danger pull-right" onClick={this.showModal.bind(this, "remove_schedule", data)}><Glyphicon glyph="minus" /> Eliminar</button></td>
                            </tr>
                        )
                    }, this)}
                    
                </tbody>
                </table>
                <button type="button" className="btn btn-primary" style={{marginBottom: "1.5em"}} onClick={this.showModal.bind(this, "add_schedule", course)}><Glyphicon glyph="plus" /> Agregar horario</button>

                </div>)
            }, this)}
            </div>}

            
            {this.state.showAddSchedule &&  <Modal
            show={this.state.showAddSchedule}
            onHide={this.handleHide.bind(this, "add_schedule")}
            container={this}
            aria-labelledby="contained-modal-title"
            >
            <Modal.Header>
                <Modal.Title id="contained-modal-title">
                Agregar horario
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
            <form className="form-horizontal">
            <fieldset>
                <div className="form-group">
                <label htmlFor="select" className="col-lg-2 control-label">Sede</label>
                <div className="col-lg-10">
                    <select value={this.state.place} className="form-control" id="sede" onChange={ e => this.setState({ place : e.target.value }) }>
                    <option>Paseo Colón</option>
                    <option>Las Heras</option>
                    </select>
                </div>
                </div>

                <div className="form-group">
                <label htmlFor="inputAula" className="col-lg-2 control-label">Aula</label>
                <div className="col-lg-3">
                    <input type="text" value={this.state.classroom} className="form-control" id="inputAula" onChange={ e => {
                        const re = /^[a-zA-Z0-9]+$/;

                        if ((e.target.value == "" || re.test(e.target.value)) && (e.target.value.length < 100)) {
                            this.setState({classroom: e.target.value});
                        }
                    } }/>
                </div>
                </div>
            
                
                <div className="form-group">
                <label htmlFor="select" className="col-lg-2 control-label">Día</label>
                <div className="col-lg-10">
                    <select value={this.state.day} className="form-control" id="dia" onChange={ e => this.setState({ day : e.target.value }) }>
                    <option>lun</option>
                    <option>mar</option>
                    <option>mie</option>
                    <option>jue</option>
                    <option>vie</option>
                    <option>sab</option>
                    </select>
                </div>
                </div>

                <div className="form-group">
                <label htmlFor="inputInicio" className="col-lg-2 control-label">Horario de inicio</label>
                <div className="col-lg-3">
                    <input type="time" value={this.state.begin} className="form-control" id="inputInicio" onChange={ e => this.setState({ begin : e.target.value }) }/>
                </div>
                </div>

                <div className="form-group">
                <label htmlFor="inputFin" className="col-lg-2 control-label">Horario de fin</label>
                <div className="col-lg-3">
                    <input type="time" value={this.state.end} className="form-control" id="inputFin" onChange={ e => this.setState({ end : e.target.value }) }/>
                </div>
                </div>

                <div className="form-group">
                <label htmlFor="tipo" className="col-lg-2 control-label">Tipo</label>
                <div className="col-lg-10">
                    <select value={this.state.type} className="form-control" id="tipo" onChange={ e => this.setState({ type : e.target.value}) }>
                    <option>Teórica Obligatoria</option>
                    <option>Práctica Obligatoria</option>
                    <option>Teórico-Práctica Obligatoria</option>
                    <option>Teórica</option>
                    <option>Práctica</option>
                    <option>Teórico-Práctica</option>
                    <option>Desarrollo y Consulta</option>
                    </select>
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
                <Button onClick={this.handleHide.bind(this, "add_schedule")}>Cancelar</Button>
                <Button bsStyle="primary" onClick={this.addSchedule.bind(this)}>Aceptar</Button>
            </Modal.Footer>
            </Modal>}

            {this.state.showRemoveSchedule &&  <Modal
            show={this.state.showRemoveSchedule}
            onHide={this.handleHide.bind(this, "remove_schedule")}
            container={this}
            aria-labelledby="contained-modal-title"
            >
            <Modal.Header>
                <Modal.Title id="contained-modal-title">
                Eliminar horario
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                ¿Estás seguro que deseas eliminar este horario?
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={this.handleHide.bind(this, "remove_schedule")}>Cancelar</Button>
                <Button bsStyle="primary" onClick={this.removeSchedule.bind(this)}>Aceptar</Button>
            </Modal.Footer>
            </Modal>}

            {this.state.showAddTeacher &&  <Modal
            show={this.state.showAddTeacher}
            onHide={this.handleHide.bind(this, "add_teacher")}
            container={this}
            aria-labelledby="contained-modal-title"
            >
            <Modal.Header>
                <Modal.Title id="contained-modal-title">
                Agregar docente
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
            <form className="form-horizontal">
            <fieldset>
                <div className="form-group">
                <label htmlFor="inputDni" className="col-lg-2 control-label">DNI</label>
                <div className="col-lg-3">
                    <input type="text" value={this.state.id} className="form-control" id="inputDni" onChange={ e => {
                        const re = /^[0-9]+$/;

                        if (e.target.value == '' || re.test(e.target.value)) {
                            this.setState({id: e.target.value});
                        }
                        } } />
                        
                </div>
                </div>

                <div className="form-group">
                <label htmlFor="select" className="col-lg-2 control-label">Cargo</label>
                <div className="col-lg-10">
                    <select className="form-control" value={this.state.type} id="cargo" onChange={ e => this.setState({ type : e.target.value}) }>
                    <option>Jefe de Cátedra</option>
                    <option>Jefe de Trabajos Prácticos</option>
                    <option>Ayudante</option>
                    </select>
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
                <Button onClick={this.handleHide.bind(this, "add_teacher")}>Cancelar</Button>
                <Button bsStyle="primary" onClick={this.addProfessor.bind(this)}>Aceptar</Button>
            </Modal.Footer>
            </Modal>}


        {this.state.showChangeSlot &&  <Modal
            show={this.state.showChangeSlot}
            onHide={this.handleHide.bind(this, "change_slot")}
            container={this}
            aria-labelledby="contained-modal-title"
            >
            <Modal.Header>
                <Modal.Title id="contained-modal-title">
                Modificar vacantes
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
            <form className="form-horizontal">
            <fieldset>
                <div className="form-group">
                <label htmlFor="inputCupo" className="col-lg-2 control-label">Vacantes</label>
                <div className="col-lg-2">
                    <input type="text" value={this.state.slots} className="form-control" id="inputCupo" onChange={ e => {
                        const re = /^[0-9]+$/;

                        if (e.target.value == '' || re.test(e.target.value)) {
                            this.setState({slots: e.target.value});
                        }
                        } } />
                        
                </div>
                <span className="help-block">Ingresar un valor entre 5 y 300.</span>
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
                <Button onClick={this.handleHide.bind(this, "change_slot")}>Cancelar</Button>
                <Button bsStyle="primary" onClick={this.changeTotalSlot.bind(this)}>Aceptar</Button>
            </Modal.Footer>
            </Modal>}

        
        {this.state.showRemoveTeacher &&  <Modal
            show={this.state.showRemoveTeacher}
            onHide={this.handleHide.bind(this, "remove_teacher")}
            container={this}
            aria-labelledby="contained-modal-title"
            >
            <Modal.Header>
                <Modal.Title id="contained-modal-title">
                Eliminar docente
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                ¿Estás seguro que deseas eliminar a este docente?
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={this.handleHide.bind(this, "remove_teacher")}>Cancelar</Button>
                <Button bsStyle="primary" onClick={this.removeTeacher.bind(this)}>Aceptar</Button>
            </Modal.Footer>
            </Modal>}

        {this.state.showAddCourse &&  <Modal
            show={this.state.showAddCourse}
            onHide={this.handleHide.bind(this, "add_course")}
            container={this}
            aria-labelledby="contained-modal-title"
            >
            <Modal.Header>
                <Modal.Title id="contained-modal-title">
                Agregar curso
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
            <form className="form-horizontal">
            <fieldset>
                <div className="form-group">
                <label htmlFor="inputNombre" className="col-lg-2 control-label">Nombre del curso</label>
                <div className="col-lg-10">
                    <input type="text" value={this.state.id} className="form-control" id="inputNombre" onChange={ e => {
                        if (e.target.value.length < 100) {
                            this.setState({id: e.target.value});
                        }
                    } } />
                </div>
                </div>

                <div className="form-group">
                <label htmlFor="inputCupo" className="col-lg-2 control-label">Vacantes</label>
                <div className="col-lg-3">
                    <input type="text" value={this.state.slots} className="form-control" id="inputCupo" onChange={ e => {
                        const re = /^[0-9]+$/;

                        if (e.target.value == '' || re.test(e.target.value)) {
                            this.setState({slots: e.target.value});
                        }
                        } } />
                </div>
                <span className="help-block">Ingresar un valor entre 5 y 300.</span>
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
                <Button onClick={this.handleHide.bind(this, "add_course")}>Cancelar</Button>
                <Button bsStyle="primary" onClick={this.addCourse.bind(this)}>Aceptar</Button>
            </Modal.Footer>
            </Modal>}

        
        {this.state.showRemoveCourse &&  <Modal
            show={this.state.showRemoveCourse}
            onHide={this.handleHide.bind(this, "remove_course")}
            container={this}
            aria-labelledby="contained-modal-title"
            >
            <Modal.Header>
                <Modal.Title id="contained-modal-title">
                Eliminar curso
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                ¿Estás seguro que deseas eliminar este curso?
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={this.handleHide.bind(this, "remove_course")}>Cancelar</Button>
                <Button bsStyle="primary" onClick={this.removeCourse.bind(this)}>Aceptar</Button>
            </Modal.Footer>
            </Modal>}

        </div>

        );
    }
}

export default SubjectCourses;