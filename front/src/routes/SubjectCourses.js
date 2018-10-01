import React, { Component } from 'react';
import '../App.css';
import Proxy from '../Proxy';
import Panel from '../components/Panel';
import { Modal, Button } from 'react-bootstrap';
import Assistant from '../Assistant';
import { Glyphicon, PageHeader } from 'react-bootstrap';

class SubjectCourses extends Component {
    constructor(props) {
        super(props);

        this.state = {
            subject: "Algoritmos y Programación III",
            code: this.props.match.params.idMateria,
            selectSubjects: false,
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

    componentDidMount() {
        Proxy.getSubjectCourses("75", "06")
        .then(
            (result) => {
                this.setState({courses: result.courses})
                Assistant.setField("token", result.token);
            },
            (error) => {
                console.log(error)
            }
        ) 
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

    setSelectedSubjects(bool) {
        this.setState({selectSubjects: bool});
    }

    changeTotalSlot() {
        var updatedCourses = this.state.courses;
        var value = parseInt(this.state.slots);
        if (value <= 300 && value >= 5) {
            for (var i = 0; i < updatedCourses.length; i++) {
                if (updatedCourses[i].name == this.state.selectedData.name) {
                    updatedCourses[i].total_slots = this.state.slots;
                
                }
            }
            this.setState({courses: updatedCourses});
            this.handleHide("change_slot");
        }

        else {
            this.setState({inputError: true, errorMsg: "Debe ingresar un valor numérico entre 5 y 300"})
        }

    } 

    addSchedule() {
        var updatedCourses = this.state.courses;
        var value = parseInt(this.state.slots);
        if ((value <= 300 && value >= 5) && this.state.id.length > 0) {
            var newCourse = {
                department_code: this.state.code.substr(0, 2),
                subject_code: this.state.code.substr(2, 2),
                name: this.state.id,
                total_slots: this.state.slots,
                professors: [],
                time_slots: []
            }
            updatedCourses.push(newCourse)
            this.setState({courses: updatedCourses});
            this.handleHide("add_course");
        }

        else {
            this.setState({inputError: true, errorMsg: "Recuerde que la vacante es un valor numérico entre 5 y 300 y que el nombre del curso no puede exceder los 100 caracteres"})
        }

    } 

    addCourse() {
        var updatedCourses = this.state.courses;
        var value = parseInt(this.state.slots);
        if ((value <= 300 && value >= 5) && this.state.id.length > 0) {
            var newCourse = {
                department_code: this.state.code.substr(0, 2),
                subject_code: this.state.code.substr(2, 2),
                name: this.state.id,
                total_slots: this.state.slots,
                professors: [],
                time_slots: []
            }
            updatedCourses.push(newCourse)
            this.setState({courses: updatedCourses});
            this.handleHide("add_course");
        }

        else {
            this.setState({inputError: true, errorMsg: "Recuerde que la vacante es un valor numérico entre 5 y 300 y que el nombre del curso no puede exceder los 100 caracteres"})
        }

    } 

    removeCourse() {
        var updatedCourses = this.state.courses.filter(course => course.name != this.state.selectedData.name);
        this.setState({courses: updatedCourses});
        this.handleHide("remove_course");
    }

    removeTeacher() {
        var updatedCourses = this.state.courses;
        updatedCourses[this.state.selectedData.idx].professors = updatedCourses[this.state.selectedData.idx].professors.filter(professor => professor.username != this.state.selectedData.username);
        this.setState({courses: updatedCourses});
        this.handleHide("remove_teacher");
    }

    removeSchedule() {
        var updatedCourses = this.state.courses;
        updatedCourses[this.state.selectedData.idx].time_slots = updatedCourses[this.state.selectedData.idx].time_slots.filter(schedule => schedule != this.state.selectedData.schedule);
        this.setState({courses: updatedCourses});
        this.handleHide("remove_schedule");
    }

    render() {
        window.scrollTo(0, 0);
        
        return (
        <div>
            <div className="row">
            <Panel selectedSubjects={this.state.selectSubjects} setSelectedSubjects={this.setSelectedSubjects.bind(this)}/>
            
            <div className="jumbotron col-md-9" style={{backgroundColor: "#C0C0C0"}}>
                <h1>Sistema de <br/> Gestión Académica</h1>
            </div>
            <div className="col-md-9">
            
            {this.state.courses && <div>
            <div style={{paddingBottom:"4em"}}>
            <PageHeader style={{marginBottom: "1.2em"}}> Cursos de {this.state.subject} </PageHeader>
            
            
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
                        var data = professor;
                        data.idx = idx;
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
                    {course.time_slots.map(function(schedule, idx){
                        var data = {}
                        data.schedule = schedule;
                        data.idx = idx;
                        return (
                            <tr key={idx}>
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
                    <select value={this.state.place} className="form-control" id="sede">
                    <option>Paseo Colón</option>
                    <option>Las Heras</option>
                    <option>Ciudad Universitaria</option>
                    </select>
                </div>
                </div>

                <div className="form-group">
                <label htmlFor="inputAula" className="col-lg-2 control-label">Aula</label>
                <div className="col-lg-10">
                    <input type="text" value={this.state.classroom} className="form-control" id="inputAula"/>
                </div>
                </div>
            
                
                <div className="form-group">
                <label htmlFor="select" className="col-lg-2 control-label">Día</label>
                <div className="col-lg-10">
                    <select value={this.state.day} className="form-control" id="dia">
                    <option>Lunes</option>
                    <option>Martes</option>
                    <option>Miércoles</option>
                    <option>Jueves</option>
                    <option>Viernes</option>
                    <option>Sábado</option>
                    </select>
                </div>
                </div>

                <div className="form-group">
                <label htmlFor="inputInicio" className="col-lg-2 control-label">Horario de inicio</label>
                <div className="col-lg-3">
                    <input type="time" value={this.state.begin} className="form-control" id="inputInicio"/>
                </div>
                </div>

                <div className="form-group">
                <label htmlFor="inputFin" className="col-lg-2 control-label">Horario de fin</label>
                <div className="col-lg-3">
                    <input type="time" value={this.state.end} className="form-control" id="inputFin"/>
                </div>
                </div>

                <div className="form-group">
                <label htmlFor="tipo" className="col-lg-2 control-label">Tipo</label>
                <div className="col-lg-10">
                    <select value={this.state.type} className="form-control" id="tipo">
                    <option>Teórica Obligatoria</option>
                    <option>Práctica Obligatoria</option>
                    <option>Teórico Práctica Obligatoria</option>
                    <option>Teórica</option>
                    <option>Práctica</option>
                    <option>Teórico Práctica</option>
                    <option>Desarrollo y Consulta</option>
                    </select>
                </div>
                </div>


            </fieldset>
            </form>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={this.handleHide.bind(this, "add_schedule")}>Cancelar</Button>
                <Button bsStyle="primary" onClick={this.handleHide.bind(this)}>Aceptar</Button>
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
                <div className="col-lg-10">
                    <input type="text" className="form-control" id="inputDni"/>
                </div>
                </div>

                <div className="form-group">
                <label htmlFor="select" className="col-lg-2 control-label">Cargo</label>
                <div className="col-lg-10">
                    <select className="form-control" id="cargo">
                    <option>Jefe de Cátedra</option>
                    <option>Jefe de Trabajos Prácticos</option>
                    <option>Ayudante</option>
                    </select>
                </div>
                </div>

            </fieldset>
            </form>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={this.handleHide.bind(this, "add_teacher")}>Cancelar</Button>
                <Button bsStyle="primary" onClick={this.handleHide.bind(this, "add_teacher")}>Aceptar</Button>
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
                <div className="col-lg-10">
                    <input type="text" className="form-control" id="inputDni"/>
                </div>
                </div>

                <div className="form-group">
                <label htmlFor="select" className="col-lg-2 control-label">Cargo</label>
                <div className="col-lg-10">
                    <select className="form-control" id="cargo">
                    <option>Jefe de Cátedra</option>
                    <option>Jefe de Trabajos Prácticos</option>
                    <option>Ayudante</option>
                    </select>
                </div>
                </div>

            </fieldset>
            </form>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={this.handleHide.bind(this, "add_teacher")}>Cancelar</Button>
                <Button bsStyle="primary" onClick={this.handleHide.bind(this, "add_teacher")}>Aceptar</Button>
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
        </div>
        </div>

        );
    }
}

export default SubjectCourses;