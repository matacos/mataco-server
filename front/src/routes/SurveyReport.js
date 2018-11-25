import React, { Component } from 'react';
import '../App.css';
import Proxy from '../Proxy';
import {FormControl, ControlLabel, FormGroup, Button, Glyphicon} from 'react-bootstrap';
import Assistant from '../Assistant';
import CanvasJSReact from '../components/canvasjs.react';
const CanvasJS = CanvasJSReact.CanvasJS;
const CanvasJSChart = CanvasJSReact.CanvasJSChart;

class SurveyReport extends Component {
    constructor(props) {
        super(props);

        this.state = {
            semesters: [],
            departments: ["Agrimensura", "Computación", "Construcciones y Estructuras", "Electrónica", "Electrotecnia", "Estabilidad", "Física", "Gestión", "Hidráulica", "Idiomas", "Ingeniería Mecánica", "Ingeniería Naval", "Ingeniería Química", "Matemática", "Química", "Seguridad del trabajo y ambiente", "Tecnología Industrial", "Transporte"],
            selectedDepartment: 'blank',
            selectedSemester: 'blank',
            dataPoints: null,
            feedback: []
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

    findCourse(courseId, courses) {
        let course = courses.filter(course => course.course == courseId)[0];
        return course.subject_name + " - " + course.professors[0].name + " " + course.professors[0].surname;
    }

    determineColor(score) {
        if (score >= 7)
            return "green";
        else if (score >= 5)
            return "yellow"
        else return "red";
    }

    getDataPoints(result) {
        var dataPoints = [];
        let generalOpinion = result.poll_results.q1;
        generalOpinion
        .sort((a,b) => (a.score < b.score) ? 1 : ((b.score < a.score) ? -1 : 0))
        .map(values => {
            let dataPoint = {
                y: values.score,
                label: this.findCourse(values.course, result.courses),
                color: this.determineColor(values.score)
            };
            dataPoints.push(dataPoint)
        });
        return dataPoints;
    }

    getFeedback(result) {
        var feedback = [];
        let generalOpinion = result.poll_results.q1;
        let feedbackArray = result.poll_results.feedback;
        feedbackArray
            .sort(this.opinionScoreComparator(generalOpinion))
            .map(values => {
                let feedbackInfo = {
                    course_name: this.findCourse(values.course, result.courses),
                    course: values.course,
                    comments: values.feedback
                };
                feedback.push(feedbackInfo);
            });
        return feedback;
    }

    opinionScoreComparator(generalOpinion){
        return function(a, b) {
            let scoreA = generalOpinion.find(function(e){ return e.course === a.course }).score;
            let scoreB = generalOpinion.find(function(e){ return e.course === b.course }).score;
            console.log("Score a: " + scoreA + "Score B: " + scoreB);
            return (scoreA < scoreB) ? 1 : ((scoreB < scoreA) ? -1 : 0);
        };
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
            // Get reports
            Proxy.getSurveyReport(selectedDepartment, this.state.selectedSemester)
            .then(result => {
                console.log(result);
                let dataPoints = this.getDataPoints(result);
                let feedback = this.getFeedback(result);
                this.setState({dataPoints: dataPoints});
                this.setState({feedback: feedback});
            });
        }
    }

    generateOptions() {
        return {
			animationEnabled: true,
			theme: "light2",
			title:{
				text: "Opinión General del curso"
			},
			axisX: {
				title: "Curso",
				reversed: true,
			},
			axisY: {
				title: "Promedio"
			},
			data: [{
				type: "bar",
				dataPoints: this.state.dataPoints
			}]
		};
    }

    render() {
        let semesterCodes = this.state.semesters.map(semester => <option value={semester} key={semester}>{semester}</option>);
        let departmentNames = this.state.departments.map(department => <option value={department} key={department}>{department}</option>);
        return (
        <div>  
            <h1 style={{color: "#696969"}}>Sistema de Gestión Académica</h1>
            <hr/>
            
            <h2 style={{marginBottom: "1em"}}> Reporte de encuestas </h2>
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
            {(this.state.dataPoints != null) && <CanvasJSChart options = {{
                animationEnabled: true,
                theme: "light2",
                title:{
                    text: ""
                },
                axisX: {
                    title: "",
                    reversed: true,
                },
                axisY: {
                    title: ""
                },
                data: [{
                    type: "bar",
                    dataPoints: this.state.dataPoints
                }]
            }}
				/* onRef={ref => this.chart = ref} */
			/>}
            {this.state.feedback
                .map(function(courseFeedback, idx) {
                    return (<div key={idx} className="well">
                        <h3 style={{paddingBottom: "0.5em"}}> {courseFeedback.course_name}</h3>

                        {courseFeedback.comments
                        .map(function(comment, idx){
                            return(
                                <h5 key={idx} className="text-primary" style={{textAlign:"right", paddingBottom: "1em", paddingTop: "1em"}}> "{comment}" </h5>
                            )
                        }, this)
                        }

                    </div>)
                }, this)
            }
        </div>
        );
    }
}

export default SurveyReport;