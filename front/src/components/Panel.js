import React, { Component } from 'react';
import logoFIUBA from '../images/logo.png';
import Assistant from '../Assistant';
import Proxy from '../Proxy';
import { withRouter } from 'react-router-dom';
import { Glyphicon, DropdownButton, MenuItem, ButtonGroup, Modal, Button } from 'react-bootstrap';
import "./Panel.css";
import 'moment/locale/es.js';
import { DatePickerInput } from 'rc-datepicker';

import 'rc-datepicker/lib/style.css';

class Panel extends Component {
    constructor(props) {
        super(props);

        this.state = {
            subjects: [],
            courses: [],
            exams: [],
            currentCourse: null,
            showAddExam: false,
            examData: {
                classroom: '',
                place: '',
                date: this.getDate(),
                beginning: '',
                ending: ''
            },
            inputError: false,
            errorMsg: '',
            listItems: []
        };

    }

    getDate() {
        var date = new Date();
        return date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate();
    }

    setExams() {
        let department_code = this.state.currentCourse.department_code;
        let subject_code = this.state.currentCourse.subject_code;
        Proxy.getCourseExams(department_code, subject_code, Assistant.getField("username"))
        .then(exams => {
            this.setState({exams: exams});
            this.props.setUpdate(false);
        });
    } 

    setPanelInformation() {
        if (Assistant.isProfessor()) 
            Proxy.getProfessorCourses().then(courses => {
                this.setState({courses: courses});
                if ((this.state.currentCourse == null) && (this.state.courses.length > 0)) {
                    this.setState({currentCourse: this.state.courses[0]});
                }

                if (this.state.currentCourse != null) {
                    this.setExams();
                }
            });
    
        if (Assistant.isDepartmentAdmin()) 
            Proxy.getDepartmentSubjects().then(subjects => this.setState({subjects: subjects, listItems: this.convertToItemList(subjects)}));
    }

    componentDidMount() {
        this.setPanelInformation();
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.mode != prevProps.mode) {
            this.setPanelInformation();
        }

        if (this.state.currentCourse != prevState.currentCourse) {
            this.setExams();
        }

        if (this.props.update != prevProps.update) {
            this.setExams();
        }
    }

    handleSelectedField(value) {
        if (this.props.selected[value]) {
            this.props.setSelected(value, false);
        }
        else {
            this.props.setSelected(value, true);
        }
    }

    selectCourse(course) {
        this.setState({currentCourse: course});
        this.goToHome(course);
    }

    goToCourse(course) {
        let courseId = course.department_code + course.subject_code + course.course;
        let subjectName = course.subject_name.replace(/ /g, "-");
        this.props.history.push('/cursos/' + subjectName + '/' + courseId);
    }

    goToSubject(subjectId, subjectName) {
        this.props.history.push('/materias/' + subjectId + '/' + subjectName);
    }

    goToHome() {
        this.props.history.push('/home');
    }

    goToUpload(path) {
        this.props.history.push('/' + path);
    }

    logout() {
        Proxy.logout();
        window.location.reload();
    }

    goToExam(examId) {
        this.props.history.push('/finales/' + this.state.currentCourse.department_code + this.state.currentCourse.subject_code + '/' + examId);
    }

    goToSemesters(){
        this.props.history.push('/periodos');
    }

    validInput() {
        var errorMsg = "Debe completar todos los campos para agregar un examen";
        var begin = this.state.examData.beginning.split(":");
        var end = this.state.examData.ending.split(":");

        if (this.state.examData.classroom.length == 0)
            return [false, errorMsg];

        let dateValidation = this.validDate(this.state.examData.date);
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

    validDate(inputDate) {
        let date = new Date(inputDate);
        let currentDate = new Date();
        if (date.getDay() == 0)
            return [false, "No es posible seleccionar un domingo"];
        if (date.getFullYear() < currentDate.getFullYear())
            return [false, "La fecha no puede ser de un año anterior al actual"];
        if ((date.getFullYear() == currentDate.getFullYear()) && (date.getMonth() < currentDate.getMonth()))
            return [false, "La fecha no puede ser de un mes que ya pasó"];
        if ((date.getMonth() == currentDate.getMonth()) && (date.getDate() < currentDate.getDate()))
            return [false, "La fecha no puede ser de un día que ya pasó"];
        if ((date.getMonth() == currentDate.getMonth()) && (date.getDate() < currentDate.getDate() + 2))
            return [false, "No es posible seleccionar una fecha con menos de 48 hs de anticipación"];
        return [true, ""];
    }

    changeDateFormat(date) {
        var parts = date.match(/(\d+)/g);
        return (parts[2] + "/" + parts[1] + "/" + parts[0]);
    }

    formatDateForServer(date) {
        return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate()
    }

    addExam() {
        if (this.state.showAddExam) {
            var newExam = null;
            var date = new Date(this.state.examData.date);
            let validationResult = this.validInput();
            if (validationResult[0]) {
                newExam = {
                    semester_code: Assistant.getField("code"),
                    department_code: this.state.currentCourse.department_code,
                    subject_code: this.state.currentCourse.subject_code,
                    examiner_username: Assistant.getField("username"),
                    classroom_code: this.state.examData.classroom,
                    classroom_campus: this.state.examData.place.length == 0 ? "Paseo Colón" : this.state.examData.place,
                    beginning: this.state.examData.beginning,
                    ending: this.state.examData.ending,
                    exam_date: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() 
                }
                
                Proxy.addExam(newExam)
                .then(this.setExams());
                this.handleHide();
            }
            else {
                this.setState({inputError: true, errorMsg: validationResult[1]})
            }
        }
    }

    search(prefix) {
        return this.state.subjects.filter(item => item.name.toLowerCase().includes(prefix.toLowerCase()) );
    }

    convertToItemList(list) {
        return list.map((d) => <div key={d.department_code + d.code}>
        <button className="text-primary text-left Panel-list-item" onClick={this.goToSubject.bind(this, d.department_code + d.code, d.name.replace(/ /g, "-"))}>
            {d.name}
        </button><div style={{marginLeft: "2em"}}><hr /></div></div>);
    }

    showCourseDropdown(courses) {
        return (
            <ButtonGroup justified>
            <DropdownButton
            title={this.state.currentCourse.subject_name}
            id="dropdown-basic"
            bsStyle="primary"
            style={{whiteSpace: "normal"}}
            >
            {courses.map(course => 
                <MenuItem 
                key={course.department_code + course.subject_code + course.course} 
                onClick={this.selectCourse.bind(this, course)} 
                active={this.state.currentCourse.name == course.name}> 
                    {course.subject_name}
                </MenuItem>)}
            </DropdownButton>
            </ButtonGroup>
        );
    }

    showMenuByRole(role) {
        switch(role) {
            case "professor":
                var examsList = this.state.exams.sort((a,b) => (a.exam_date > b.exam_date) ? 1 : ((b.exam_date > a.exam_date) ? -1 : 0)).map(exam => <div key={exam.id}>
                <button className="text-primary text-left Panel-list-item" onClick={this.goToExam.bind(this, exam.id)}>
                    {this.changeDateFormat(exam.exam_date.substr(0, 10))}
                </button><hr /></div>);
                return (
                    <div>
                        {this.state.currentCourse != null && <div> {this.showCourseDropdown(this.state.courses)}
                        <div><button className="Panel-item" style={{marginTop: "1em"}} onClick={this.goToCourse.bind(this, this.state.currentCourse)}><h4 className="text-primary"> Cursada</h4> </button></div>
                        <div className="row" style={{paddingLeft: "1em"}}>
                        </div>
                        <div className="row" style={{paddingLeft: "1em"}}>
                            <button className="Panel-item" onClick={this.handleSelectedField.bind(this, "exams")}><h4 className="text-primary"> 
                                {((this.props.selected["exams"]) && <Glyphicon style={{fontSize:"0.75em"}} glyph="minus" />) || <Glyphicon style={{fontSize:"0.75em"}} glyph="plus" />}
                                {" Finales"}
                            </h4></button>
                            {(this.props.selected["exams"]) && 
                            <div style={{marginTop: "1em"}}>
                                <hr />
                                {examsList}
                                {examsList.length < 5 && <div key="Add-exam">
                                <button className="text-primary text-left Panel-list-item" onClick={this.showAddExamModal.bind(this)}>
                                    Agregar final
                                </button></div>}
                            </div>}
                        </div>
                        </div>}
                    </div>
                );

            case "department_administrator":
                var totalItems = this.convertToItemList(this.state.subjects);

                return (
                    <div>
                        <button className="Panel-item" onClick={this.handleSelectedField.bind(this, "subjects")}><h4 className="text-primary"> 
                        {((this.props.selected["subjects"]) && <Glyphicon style={{fontSize:"0.75em"}} glyph="minus" />) || <Glyphicon style={{fontSize:"0.75em"}} glyph="plus" />}
                        {" Mis Materias"}</h4></button>
                        {(this.props.selected["subjects"]) && 
                        <div style={{marginTop: "1em"}}>
                            <hr />
                            <input type="text" className="form-control" placeholder="Buscar materia" style={{marginBottom: "2em"}} onChange={e => {
                                if (e.target.value != "") {
                                    var result = this.convertToItemList(this.search(e.target.value));
                                    this.setState({listItems: result});
                                }
                                else {
                                    this.setState({listItems: this.convertToItemList(this.state.subjects)});
                                }
                            }} />
                            {this.state.listItems}
                        </div>}
                    </div>


                );

            case "administrators":
                return (
                    <div>
                        {/*<div><button className="Panel-item" onClick={this.goToHome.bind(this)}><h4 className="text-primary"> Alta de materias</h4> </button></div>*/}
                        <div><button className="Panel-item" onClick={this.goToUpload.bind(this, "estudiantes")}><h4 className="text-primary"> Alta de estudiantes</h4> </button></div>
                        {/*<div><button className="Panel-item" onClick={this.goToHome.bind(this)}><h4 className="text-primary"> Alta de docentes</h4> </button></div>*/}
                        <div><button className="Panel-item" style={{marginTop: "1em"}} onClick={this.goToSemesters.bind(this)}><h4 className="text-primary"> Períodos Lectivos</h4> </button></div>
                    </div>
                );
            default:
                console.log("Menu Error: invalid role");
        }
    }

    showMenu(mode) {
        return (
            <div style={{padding: "1em"}}>
                <div><button className="Panel-item" onClick={this.goToHome.bind(this)}><h4 className="text-primary"> Home</h4> </button></div>
                <hr />
                {this.showMenuByRole(mode)}
                <hr />
                <button className="text-primary Panel-item" onClick={this.logout.bind(this)}><h4 className="text-primary">  Cerrar sesión </h4></button>
            </div>
        );
    }

    setTitle() {
        if (Assistant.inProfessorMode()) 
            return Assistant.getField("name");
        if (Assistant.inDepartmentAdminMode()) 
            return "Departamento de " + Assistant.getField("department");
        if (Assistant.inAdminMode())   
            return "Administrador";
    }

    showAddExamModal() {
        this.setState({showAddExam: true})
    }

    render() {
        return (
            <div>
            {Assistant.isLoggedIn() && <div className="panel panel-default col-md-3" style={{margin: "0", padding: "0"}}>
            <div className="panel-heading" style={{width: "auto"}}>
                <img className="img-responsive center-block" alt="logo" src={logoFIUBA} height="50%" width="50%" style={{marginLeft: "auto", marginRight: "auto", width: "50%", paddingTop: "1em"}}/>
                <h3 className="text-center" style={{color: "#696969"}}>{this.setTitle()}</h3>
            </div>

            <div className="panel-body" style={(this.props.selected["subjects"] || this.props.selected["exams"])? {height: "auto"} : {height: "100vh"}}>
                {this.showMenu(this.props.mode)}
            </div>

            {this.state.showAddExam &&  <Modal
            show={this.state.showAddExam}
            onHide={this.handleHide.bind(this)}
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
                <Button onClick={this.handleHide.bind(this)}>Cancelar</Button>
                <Button bsStyle="primary" onClick={this.addExam.bind(this)}>Aceptar</Button>
            </Modal.Footer>
            </Modal>}
            </div>}
            </div>
        );
    }
}

export default withRouter(Panel);
