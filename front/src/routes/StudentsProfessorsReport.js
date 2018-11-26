import React, { Component } from 'react';
import '../App.css';
import Proxy from '../Proxy';
import { FormControl, ControlLabel, FormGroup, Button } from 'react-bootstrap';
import CanvasJSReact from '../components/canvasjs.react';
import Assistant from '../Assistant';
const CanvasJS = CanvasJSReact.CanvasJS;
const CanvasJSChart = CanvasJSReact.CanvasJSChart;

class StudentsProfessorsReport extends Component {
    constructor(props) {
        super(props);

        this.state = {
            semesters: [],
            departments: ["Agrimensura", "Computación", "Construcciones y Estructuras", "Electrónica", "Electrotecnia", "Estabilidad", "Física", "Gestión", "Hidráulica", "Idiomas", "Ingeniería Mecánica", "Ingeniería Naval", "Ingeniería Química", "Matemática", "Química", "Seguridad del trabajo y ambiente", "Tecnología Industrial", "Transporte"],
            selectedDepartment: 'blank',
            selectedSemester: 'blank',
            departmentDataPoints: null,
            subjectDataPoints: null
        };
    }

    componentDidMount() {
        Proxy.getSemesters()
        .then(semesters => {
            let semesterCodes = semesters.sort((a,b) => (a.academic_offer_release_date < b.academic_offer_release_date) ? 1 : ((b.academic_offer_release_date < a.academic_offer_release_date) ? -1 : 0))
                                        .map(semester => semester.code);
            this.setState({semesters: semesterCodes});
        });
    }

    getDepartmentDataPoints(result) {
        let totalStudents = 0;
        for(var i = 0; i < result.length; i++) {
            let subject = result[i];
            totalStudents += parseInt(subject.total_students);
        }
        var dataPoints = [];
        result.filter(subject => subject.total_students != 0)
        .map(subject => {
            let dataPoint = {
                y: Math.round(((subject.total_students * 100) / totalStudents) * 10) / 10,
                label: subject.name,
                total_students: subject.total_students,
                total_professors: subject.total_professors,
                total_courses: subject.total_courses,
                courses: subject.courses,
                indexLabelFontColor: "white",
                toolTipContent: "<strong>{label}</strong> <br/> {total_students} inscriptos <br/> {total_professors} docentes <br/> {total_courses} cursos"
            };
            dataPoints.push(dataPoint)
        });
        return dataPoints;
    }

    validSelect() {
        let selectedDepartment = Assistant.inDepartmentAdminMode() ? Assistant.getField("department") : this.state.selectedDepartment;
        if (selectedDepartment == "blank" && this.state.selectedSemester == "blank")
            alert("Por favor, seleccione el departamento y período lectivo sobre los que quiere visualizar los reportes");
        else if (selectedDepartment == "blank")
            alert("Debe seleccionar un departamento");
        else if (this.state.selectedSemester == "blank")
            alert("Debe seleccionar un período lectivo");
        else {
            this.setState({departmentDataPoints: null, subjectDataPoints: null});
            // Get reports
            Proxy.getStudentsProffesorsReport(selectedDepartment, this.state.selectedSemester)
            .then(result => {
                console.log(result)
                let dataPoints = this.getDepartmentDataPoints(result);
                this.setState({departmentDataPoints: dataPoints});
            });
        }
    }

    getProfessorsNames(professors) {
        var names = "";
        for(var i = 1; i < professors.length; i++) {
            var professor = professors[i];
            names += professor.name + " " + professor.surname + "<br/>";
            
        }
        return names;
    }
    
    showSubjectPie(e) {
        let data = e.dataPoint;
        console.log(e.dataPoint);
        let dataPoints = [];
        var totalStudents = 0;
        data.courses.map(course => totalStudents += course.total_students);
        data.courses.filter(course => course.total_students != 0)
            .map(course => {
                let dataPoint = {
                    y: Math.round((course.total_students * 100) / totalStudents),
                    label: course.professors[0].name + " " + course.professors[0].surname,
                    total_students: course.total_students,
                    professors: this.getProfessorsNames(course.professors),
                    indexLabelFontColor: "white",
                    toolTipContent: "<strong>{label}</strong> <br/> {professors} {total_students} inscriptos"
                };
                dataPoints.push(dataPoint)
            })
        this.setState({subjectDataPoints: dataPoints});
    }

    render() {
        let semesterCodes = this.state.semesters.map(semester => <option value={semester} key={semester}>{semester}</option>);
        let departmentNames = this.state.departments.map(department => <option value={department} key={department}>{department}</option>);
        return (
        <div>  
            <h1 style={{color: "#696969"}}>Sistema de Gestión Académica</h1>
            <hr/>

            <h2 style={{marginBottom: "1em"}}> Reporte de estudiantes y docentes </h2>
            <div className="well">
            <form style={{paddingBlockStart: "1em", marginBlockEnd: "-1.5em"}}>
                <FormGroup controlId="formControlsSelect">
                <div className="row">
                    {Assistant.inAdminMode() && <div>
                    <div className="col-md-1" style={{paddingTop: "0.8em"}}>
                        <ControlLabel>Departamento:</ControlLabel>
                    </div>
                    <div className="col-md-5" style={{paddingLeft: "4em"}}>
                        <div className="row">
                            <div className="col-md-11">
                            <FormControl componentClass="select" placeholder="select" onChange={selected => this.setState({selectedDepartment: selected.target.value})}>
                                <option value="blank"></option>
                                {departmentNames}
                            </FormControl>
                            </div>
                            <span style={{color: "#cc0000", marginLeft: "-0.6em"}}>*</span>
                        </div>
                    </div>
                    </div>}
                    <div className="col-md-1" style={{paddingTop: "0.8em", paddingLeft: "1em"}}>
                        <ControlLabel>Período:</ControlLabel>
                    </div>
                    <div className="col-md-2" style={{paddingLeft: "1em"}}>
                        <div className="row">
                            <div className="col-md-11">
                            <FormControl componentClass="select" placeholder="select" onChange={selected => this.setState({selectedSemester: selected.target.value})}>
                                <option value="blank"></option>
                                {semesterCodes}
                            </FormControl>
                            </div>
                            <span style={{color: "#cc0000", marginLeft: "-0.6em"}}>*</span>
                        </div>
                    </div>
                    <Button className="pull-right btn-primary" style={{marginInlineEnd: "1em"}} onClick={this.validSelect.bind(this)}>Buscar</Button>
                    <Button className="pull-right btn-default" style={{marginInlineEnd: "0.5em", borderColor: "#C0C0C0"}} onClick={() => window.location.reload()}>Limpiar filtros</Button>

                </div>
                <span className="small" style={{color: "#cc0000"}}>* campo requerido</span>
                </FormGroup>
            </form>
            </div>
            <div className="row">
            {(this.state.departmentDataPoints != null) && 
            <div className={(this.state.subjectDataPoints != null) ? "col-md-6" : "col-md-12"}>
            <CanvasJSChart options = {{
                theme: "light2",
                animationEnabled: true,
                exportFileName: "Estudiantes inscriptos por materia",
                exportEnabled: false,
                title:{
                    text: ""
                },
                data: [{
                    click: this.showSubjectPie.bind(this),
                    type: "pie",
                    showInLegend: true,
                    legendText: "{label}",
                    toolTipContent: "{label}: <strong>{y}</strong>",
                    indexLabel: "{y}%",
                    indexLabelPlacement: "inside",
                    dataPoints: this.state.departmentDataPoints
                }]
            }}
            /></div>}
            
            {(this.state.subjectDataPoints != null) && <div className="col-md-6"><CanvasJSChart options = {{
                theme: "light2",
                animationEnabled: true,
                exportFileName: "Estudiantes inscriptos por curso",
                exportEnabled: true,
                title:{
                    text: ""
                },
                data: [{
                    type: "pie",
                    showInLegend: true,
                    legendText: "{label}",
                    toolTipContent: "{label}: <strong>{y}</strong>",
                    indexLabel: "{y}%",
                    indexLabelPlacement: "inside",
                    dataPoints: this.state.subjectDataPoints
                }]
            }}
            /></div>}
            </div>
        </div>
        )}
}

export default StudentsProfessorsReport;