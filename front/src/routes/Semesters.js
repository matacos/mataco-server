import React, { Component } from 'react';
import '../App.css';
import Proxy from '../Proxy';
import { Modal, Button } from 'react-bootstrap';
import { Glyphicon } from 'react-bootstrap';
import {DatePickerInput} from "rc-datepicker";

class Semesters extends Component {
    constructor(props) {
        super(props);

        this.state = {
            semesters: [],
            semesterData: {
                code: '',
                dates: Array(8).fill(this.getDate())
            },
            selectedData: null,
            showAddSemester: false,
            showRemoveSemester: false,
            showModifySemester: false,
            showModifyDate: [],
            inputError: false,
            errorMsg: ''
        };
    }

    getDate() {
        var date = new Date();
        return date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate();
    }

    changeDateFormat(date, separator = "/") {
        var parts = date.match(/(\d+)/g);
        return (parts[2] + separator + parts[1] + separator + parts[0]);
    }

    formatDateForServer(date) {
        return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate()
    }

    formatDateForCalendar(date){
        let parts = date.substring(0, 10).match(/(\d+)/g);
        return new Date(parts[0], parts[1] - 1, parts[2]);
    }

    periodHasEnded(ending){
        return new Date > new Date(ending);
    }

    periodIsTakingPlaceNow(beginning, ending){
        let today = new Date();
        return new Date(beginning) < today && today < new Date(ending);
    }

    validDate(previous, inputDate) {
        let previousDate = new Date(previous);
        let date = new Date(inputDate);
        let currentDate = new Date();
        if (date < currentDate)
            return [false, "La fecha no puede ser de un día que ya pasó"];
        if (previousDate > date)
            return [false, "La fecha a crear debe ser posterior o igual a la fecha anterior"];
        return [true, ""];
    }

    getSemesters() {
        return Proxy.getSemesters();
    }

    setSemestersInformation(){
        this.getSemesters()
            .then(semesters => this.setState({semesters: semesters}));
    }

    componentDidMount() {
        this.setSemestersInformation();
    }

    showModal(modalType, data) {
        this.setState({selectedData: data});

        switch(modalType) {
            case "add_semester":
                this.setState({showAddSemester: true})
                break;
            case "remove_semester":
                this.setState({showRemoveSemester: true})
                break;
            case "modify_semester":
                if (this.periodHasEnded(data.exams_ending_date)){
                    alert("No es posible modificar un período lectivo terminado")
                    break;
                }
                let showDates = [];
                let newDates = [];
                newDates[0] = this.formatDateForCalendar(data.academic_offer_release_date);
                newDates[1] = this.formatDateForCalendar(data.course_enrollment_beginning_date);
                newDates[2] = this.formatDateForCalendar(data.course_enrollment_ending_date);
                newDates[3] = this.formatDateForCalendar(data.classes_beginning_date);
                newDates[4] = this.formatDateForCalendar(data.course_disenrollment_ending_date);
                newDates[5] = this.formatDateForCalendar(data.exam_offer_release_date);
                newDates[6] = this.formatDateForCalendar(data.classes_ending_date);
                newDates[7] = this.formatDateForCalendar(data.exams_ending_date);
                let newSemesterData = {
                    code: data.code,
                    dates: newDates
                };
                newDates.map( (newDate, i) => newDate < new Date() ? showDates[i] = false : showDates[i] = true );
                console.log(showDates);
                this.setState({showModifySemester: true, semesterData: newSemesterData, showModifyDate: showDates})
                break;
        }
    }

    handleHide(modalType) {
        this.setState({selectedData: null, inputError: false, errorMsg: ''});
        let clearData = {
            code: '',
            dates: Array(8).fill(this.getDate())
        };

        switch(modalType) {
            case "add_semester":
                this.setState({showAddSemester: false, semesterData: clearData});
                break;
            case "remove_semester":
                this.setState({showRemoveSemester: false})
                break;
            case "modify_semester":
                this.setState({showModifySemester: false, semesterData: clearData})
                break;
        }

    }

    validSemesterInput() {
        var errorMsg = "Debe completar todos los campos";

        if (this.state.semesterData.code.length === 0)
            return [false, errorMsg];
        if (this.state.semesterData.code.length > 10)
            return [false, "El código no puede tener más de 10 caracteres"];

        let previousDate = this.state.semesterData.dates[0];
        for(let i = 0; i < this.state.semesterData.dates.length; i++) {
            let dateValidation = this.validDate(previousDate, this.state.semesterData.dates[i]);
            if (!dateValidation[0])
                return dateValidation;
        }

        return [true, ""];
    }

    validSemesterModificationInput() {
        let previousDate = this.state.semesterData.dates[0];
        for(let i = 0; i < this.state.semesterData.dates.length; i++) {
            let dateValidation = this.validDate(previousDate, this.state.semesterData.dates[i]);
            if (!dateValidation[0])
                return dateValidation;
        }

        return [true, ""];
    }

    addSemester() {
        if (this.state.showAddSemester) {
            var newSemester = null;
            const dates = this.state.semesterData.dates.map(date => new Date(date));
            let validationResult = this.validSemesterInput();
            if (validationResult[0]) {
                newSemester = {
                    code: this.state.semesterData.code,
                    academic_offer_release_date: this.formatDateForServer(dates[0]),
                    course_enrollment_beginning_date: this.formatDateForServer(dates[1]),
                    course_enrollment_ending_date: this.formatDateForServer(dates[2]),
                    classes_beginning_date: this.formatDateForServer(dates[3]),
                    course_disenrollment_ending_date: this.formatDateForServer(dates[4]),
                    exam_offer_release_date: this.formatDateForServer(dates[5]),
                    classes_ending_date: this.formatDateForServer(dates[6]),
                    exams_ending_date: this.formatDateForServer(dates[7]),
                }

                Proxy.addSemester(newSemester)
                    .then(this.setSemestersInformation());
                this.handleHide("add_semester");
            }
            else {
                this.setState({inputError: true, errorMsg: validationResult[1]})
            }
        }
    }

    modifySemester() {
        if (this.state.showModifySemester) {
            var newSemester = null;
            const dates = this.state.semesterData.dates.map(date => new Date(date));
            let validationResult = this.validSemesterModificationInput();
            if (validationResult[0]) {
                newSemester = {
                    code: this.state.semesterData.code,
                    academic_offer_release_date: this.formatDateForServer(dates[0]),
                    course_enrollment_beginning_date: this.formatDateForServer(dates[1]),
                    course_enrollment_ending_date: this.formatDateForServer(dates[2]),
                    classes_beginning_date: this.formatDateForServer(dates[3]),
                    course_disenrollment_ending_date: this.formatDateForServer(dates[4]),
                    exam_offer_release_date: this.formatDateForServer(dates[5]),
                    classes_ending_date: this.formatDateForServer(dates[6]),
                    exams_ending_date: this.formatDateForServer(dates[7]),
                }

                Proxy.modifySemester(this.state.semesterData.code, newSemester)
                    .then(this.setSemestersInformation());
                this.handleHide("modify_semester");
            }
            else {
                this.setState({inputError: true, errorMsg: validationResult[1]})
            }
        }
    }

    removeSemester() {
        let beginning = this.state.selectedData.academic_offer_release_date;
        let ending = this.state.selectedData.exams_ending_date;

        if (this.periodHasEnded(ending)){
            alert("No es posible eliminar un período lectivo terminado");
        } else if(this.periodIsTakingPlaceNow(beginning, ending)){
            alert("No es posible eliminar un período lectivo en curso");
        } else {
            Proxy.deleteSemester(this.state.selectedData.code)
                .then(this.setSemestersInformation());
            this.handleHide("remove_semester");
        }
    }

    render() {
        window.scrollTo(0, 0);
        return (
            <div>

                <h1 style={{color: "#696969"}}>Sistema de Gestión Académica</h1>
                <hr/>

                {this.state.semesters && <div>
                    <div style={{paddingBottom:"1.5em"}}>
                        <h2> Períodos Lectivos 
                        <button type="button" className="btn btn-primary pull-right" style={{marginRight: "1.5em"}} onClick={this.showModal.bind(this, "add_semester")}><Glyphicon glyph="plus" /> Agregar período</button>
                        </h2>
                    </div>

                    {this.state.semesters
                        .sort((a,b) => (a.academic_offer_release_date < b.academic_offer_release_date) ? 1 : ((b.academic_offer_release_date < a.academic_offer_release_date) ? -1 : 0))
                        .map(function(semester, idx) {
                        return (<div key={idx} className="well">
                            <h3 style={{paddingBottom: "0.5em"}}> Período: {semester.code}
                            {!this.periodHasEnded(semester.exams_ending_date) && !this.periodIsTakingPlaceNow(semester.academic_offer_release_date, semester.exams_ending_date) && <button type="button" className="btn btn-danger pull-right" style={{paddingInlineStart: "1.4em"}} onClick={this.showModal.bind(this, "remove_semester", semester)}>
                                <Glyphicon glyph="minus" /> Eliminar período
                            </button>}</h3>
                            {!this.periodHasEnded(semester.exams_ending_date) && 
                            <button type="button" className="btn btn-primary pull-right" style={{marginTop: this.periodIsTakingPlaceNow(semester.academic_offer_release_date, semester.exams_ending_date) ? "-4em" : "0.25em"}}
                            onClick={this.showModal.bind(this, "modify_semester", semester)}><Glyphicon glyph="plus" /> Modificar período</button>}
                            
                            <h6 className="text-primary" style={{paddingBottom: "1em", paddingTop: "2em"}}> Publicación de la oferta académica: <span style={{color: "#696969"}}>{this.changeDateFormat(semester.academic_offer_release_date.substring(0, 10))} </span></h6>
                            <h6 className="text-primary" style={{paddingBottom: "1em"}}> Inicio de la inscripción a cursos: <span style={{color: "#696969"}}>{this.changeDateFormat(semester.course_enrollment_beginning_date.substring(0, 10))} </span></h6>
                            <h6 className="text-primary" style={{paddingBottom: "1em"}}> Fin de la inscripción a cursos: <span style={{color: "#696969"}}>{this.changeDateFormat(semester.course_enrollment_ending_date.substring(0, 10))} </span></h6>
                            <h6 className="text-primary" style={{paddingBottom: "1em"}}> Inicio de la cursada: <span style={{color: "#696969"}}>{this.changeDateFormat(semester.classes_beginning_date.substring(0, 10))} </span></h6>
                            <h6 className="text-primary" style={{paddingBottom: "1em"}}> Fin de desincripción a cursos: <span style={{color: "#696969"}}>{this.changeDateFormat(semester.course_disenrollment_ending_date.substring(0, 10))} </span></h6>
                            <h6 className="text-primary" style={{paddingBottom: "1em"}}> Publicación de la oferta de finales: <span style={{color: "#696969"}}>{this.changeDateFormat(semester.exam_offer_release_date.substring(0, 10))} </span></h6>
                            <h6 className="text-primary" style={{paddingBottom: "1em"}}> Fin de la cursada: <span style={{color: "#696969"}}>{this.changeDateFormat(semester.classes_ending_date.substring(0, 10))} </span></h6>
                            <h6 className="text-primary" style={{paddingBottom: "1em"}}> Fin del período de finales: <span style={{color: "#696969"}}>{this.changeDateFormat(semester.exams_ending_date.substring(0, 10))} </span></h6>

                        </div>)
                    }, this)}
                </div>}

                {this.state.showRemoveSemester &&  <Modal
                    show={this.state.showRemoveSemester}
                    onHide={this.handleHide.bind(this, "remove_semester")}
                    container={this}
                    aria-labelledby="contained-modal-title"
                >
                    <Modal.Header>
                        <Modal.Title id="contained-modal-title">
                            Eliminar período lectivo
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        ¿Estás seguro que deseas eliminar este período lectivo?
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.handleHide.bind(this, "remove_semester")}>Cancelar</Button>
                        <Button bsStyle="primary" onClick={this.removeSemester.bind(this)}>Aceptar</Button>
                    </Modal.Footer>
                </Modal>}

                {this.state.showAddSemester &&  <Modal
                    show={this.state.showAddSemester}
                    onHide={this.handleHide.bind(this, "add_semester")}
                    container={this}
                    aria-labelledby="contained-modal-title"
                >
                    <Modal.Header>
                        <Modal.Title id="contained-modal-title">
                            Agregar período lectivo
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <form className="form-horizontal">
                            <fieldset>
                                <div className="form-group">
                                    <label htmlFor="select" className="col-lg-6 control-label">Publicación de la oferta académica</label>
                                    <div className="col-lg-3">
                                        <DatePickerInput
                                            onChange={value => {
                                                var newData = this.state.semesterData;
                                                newData.dates[0] = value;
                                                this.setState({ semesterData : newData });
                                            }}
                                            value={this.state.semesterData.dates[0]}
                                            className='my-custom-datepicker-component'
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="select" className="col-lg-6 control-label">Inicio de la inscripción a cursos</label>
                                    <div className="col-lg-3">
                                        <DatePickerInput
                                            onChange={value => {
                                                var newData = this.state.semesterData;
                                                newData.dates[1] = value;
                                                this.setState({ semesterData : newData });
                                            }}
                                            value={this.state.semesterData.dates[1]}
                                            className='my-custom-datepicker-component'
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="select" className="col-lg-6 control-label">Fin de la inscripción a cursos</label>
                                    <div className="col-lg-3">
                                        <DatePickerInput
                                            onChange={value => {
                                                var newData = this.state.semesterData;
                                                newData.dates[2] = value;
                                                this.setState({ semesterData : newData });
                                            }}
                                            value={this.state.semesterData.dates[2]}
                                            className='my-custom-datepicker-component'
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="select" className="col-lg-6 control-label">Inicio de la cursada</label>
                                    <div className="col-lg-3">
                                        <DatePickerInput
                                            onChange={value => {
                                                var newData = this.state.semesterData;
                                                newData.dates[3] = value;
                                                this.setState({ semesterData : newData });
                                            }}
                                            value={this.state.semesterData.dates[3]}
                                            className='my-custom-datepicker-component'
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="select" className="col-lg-6 control-label">Fin de desincripción a cursos</label>
                                    <div className="col-lg-3">
                                        <DatePickerInput
                                            onChange={value => {
                                                var newData = this.state.semesterData;
                                                newData.dates[4] = value;
                                                this.setState({ semesterData : newData });
                                            }}
                                            value={this.state.semesterData.dates[4]}
                                            className='my-custom-datepicker-component'
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="select" className="col-lg-6 control-label">Publicación de la oferta de finales</label>
                                    <div className="col-lg-3">
                                        <DatePickerInput
                                            onChange={value => {
                                                var newData = this.state.semesterData;
                                                newData.dates[5] = value;
                                                this.setState({ semesterData : newData });
                                            }}
                                            value={this.state.semesterData.dates[5]}
                                            className='my-custom-datepicker-component'
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="select" className="col-lg-6 control-label">Fin de la cursada</label>
                                    <div className="col-lg-3">
                                        <DatePickerInput
                                            onChange={value => {
                                                var newData = this.state.semesterData;
                                                newData.dates[6] = value;
                                                this.setState({ semesterData : newData });
                                            }}
                                            value={this.state.semesterData.dates[6]}
                                            className='my-custom-datepicker-component'
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="select" className="col-lg-6 control-label">Fin del período de finales</label>
                                    <div className="col-lg-3">
                                        <DatePickerInput
                                            onChange={value => {
                                                var newData = this.state.semesterData;
                                                newData.dates[7] = value;
                                                this.setState({ semesterData : newData });
                                            }}
                                            value={this.state.semesterData.dates[7]}
                                            className='my-custom-datepicker-component'
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="inputCuatrimestre" className="col-lg-6 control-label">Código del cuatrimestre</label>
                                    <div className="col-lg-3">
                                        <input type="text" value={this.state.semesterData.code} className="form-control" id="inputCuatrimestre" onChange={ e => {
                                            const re = /^[a-zA-Z0-9]+$/;

                                            if ((e.target.value == "" || re.test(e.target.value)) && (e.target.value.length < 100)) {
                                                var newData = this.state.semesterData;
                                                newData.code = e.target.value;
                                                this.setState({semesterData: newData});
                                            }
                                        } }/>
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
                        <Button onClick={this.handleHide.bind(this, "add_semester")}>Cancelar</Button>
                        <Button bsStyle="primary" onClick={this.addSemester.bind(this)}>Aceptar</Button>
                    </Modal.Footer>
                </Modal>}

                {this.state.showModifySemester &&  <Modal
                    show={this.state.showModifySemester}
                    onHide={this.handleHide.bind(this, "modify_semester")}
                    container={this}
                    aria-labelledby="contained-modal-title"
                >
                    <Modal.Header>
                        <Modal.Title id="contained-modal-title">
                            Modificar período lectivo
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <form className="form-horizontal">
                            <fieldset>
                                <div className="form-group">
                                    <label htmlFor="select" className="col-lg-6 control-label">Publicación de la oferta académica</label>
                                    <div className="col-lg-3">
                                        {!this.state.showModifyDate[0] &&
                                        <DatePickerInput
                                            value={this.state.semesterData.dates[0]}
                                            disabled={true}
                                            className='my-custom-datepicker-component'
                                        />}
                                        {this.state.showModifyDate[0] &&
                                        <DatePickerInput
                                            onChange={value => {
                                                var newData = this.state.semesterData;
                                                newData.dates[0] = value;
                                                this.setState({ semesterData : newData });
                                            }}
                                            value={this.state.semesterData.dates[0]}
                                            className='my-custom-datepicker-component'
                                        />}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="select" className="col-lg-6 control-label">Inicio de la inscripción a cursos</label>
                                    <div className="col-lg-3">
                                        {!this.state.showModifyDate[1] &&
                                        <DatePickerInput
                                            value={this.state.semesterData.dates[1]}
                                            disabled={true}
                                            className='my-custom-datepicker-component'
                                        />}
                                        {this.state.showModifyDate[1] &&
                                        <DatePickerInput
                                            onChange={value => {
                                                var newData = this.state.semesterData;
                                                newData.dates[1] = value;
                                                this.setState({ semesterData : newData });
                                            }}
                                            value={this.state.semesterData.dates[1]}
                                            className='my-custom-datepicker-component'
                                        />}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="select" className="col-lg-6 control-label">Fin de la inscripción a cursos</label>
                                    <div className="col-lg-3">
                                        {!this.state.showModifyDate[2] &&
                                        <DatePickerInput
                                            value={this.state.semesterData.dates[2]}
                                            disabled={true}
                                            className='my-custom-datepicker-component'
                                        />}
                                        {this.state.showModifyDate[2] &&
                                        <DatePickerInput
                                            onChange={value => {
                                                var newData = this.state.semesterData;
                                                newData.dates[2] = value;
                                                this.setState({ semesterData : newData });
                                            }}
                                            value={this.state.semesterData.dates[2]}
                                            className='my-custom-datepicker-component'
                                        />}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="select" className="col-lg-6 control-label">Inicio de la cursada</label>
                                    <div className="col-lg-3">
                                        {!this.state.showModifyDate[3] &&
                                        <DatePickerInput
                                            value={this.state.semesterData.dates[3]}
                                            disabled={true}
                                            className='my-custom-datepicker-component'
                                        />}
                                        {this.state.showModifyDate[3] &&
                                        <DatePickerInput
                                            onChange={value => {
                                                var newData = this.state.semesterData;
                                                newData.dates[3] = value;
                                                this.setState({ semesterData : newData });
                                            }}
                                            value={this.state.semesterData.dates[3]}
                                            className='my-custom-datepicker-component'
                                        />}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="select" className="col-lg-6 control-label">Fin de desincripción a cursos</label>
                                    <div className="col-lg-3">
                                        {!this.state.showModifyDate[4] &&
                                        <DatePickerInput
                                            value={this.state.semesterData.dates[4]}
                                            disabled={true}
                                            className='my-custom-datepicker-component'
                                        />}
                                        {this.state.showModifyDate[4] &&
                                        <DatePickerInput
                                            onChange={value => {
                                                var newData = this.state.semesterData;
                                                newData.dates[4] = value;
                                                this.setState({ semesterData : newData });
                                            }}
                                            value={this.state.semesterData.dates[4]}
                                            className='my-custom-datepicker-component'
                                        />}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="select" className="col-lg-6 control-label">Publicación de la oferta de finales</label>
                                    <div className="col-lg-3">
                                        {!this.state.showModifyDate[5] &&
                                        <DatePickerInput
                                            value={this.state.semesterData.dates[5]}
                                            disabled={true}
                                            className='my-custom-datepicker-component'
                                        />}
                                        {this.state.showModifyDate[5] &&
                                        <DatePickerInput
                                            onChange={value => {
                                                var newData = this.state.semesterData;
                                                newData.dates[5] = value;
                                                this.setState({ semesterData : newData });
                                            }}
                                            value={this.state.semesterData.dates[5]}
                                            className='my-custom-datepicker-component'
                                        />}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="select" className="col-lg-6 control-label">Fin de la cursada</label>
                                    <div className="col-lg-3">
                                        {!this.state.showModifyDate[6] &&
                                        <DatePickerInput
                                            value={this.state.semesterData.dates[6]}
                                            disabled={true}
                                            className='my-custom-datepicker-component'
                                        />}
                                        {this.state.showModifyDate[6] &&
                                        <DatePickerInput
                                            onChange={value => {
                                                var newData = this.state.semesterData;
                                                newData.dates[6] = value;
                                                this.setState({ semesterData : newData });
                                            }}
                                            value={this.state.semesterData.dates[6]}
                                            className='my-custom-datepicker-component'
                                        />}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="select" className="col-lg-6 control-label">Fin del período de finales</label>
                                    <div className="col-lg-3">
                                        {!this.state.showModifyDate[7] &&
                                        <DatePickerInput
                                            value={this.state.semesterData.dates[7]}
                                            disabled={true}
                                            className='my-custom-datepicker-component'
                                        />}
                                        {this.state.showModifyDate[7] &&
                                        <DatePickerInput
                                            onChange={value => {
                                                var newData = this.state.semesterData;
                                                newData.dates[7] = value;
                                                this.setState({ semesterData : newData });
                                            }}
                                            value={this.state.semesterData.dates[7]}
                                            className='my-custom-datepicker-component'
                                        />}
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
                        <Button onClick={this.handleHide.bind(this, "modify_semester")}>Cancelar</Button>
                        <Button bsStyle="primary" onClick={this.modifySemester.bind(this)}>Aceptar</Button>
                    </Modal.Footer>
                </Modal>}

            </div>

        );
    }
}

export default Semesters;