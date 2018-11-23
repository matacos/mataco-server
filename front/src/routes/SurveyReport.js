import React, { Component } from 'react';
import '../App.css';
import Proxy from '../Proxy';
import { FormControl, ControlLabel, FormGroup, Button } from 'react-bootstrap';

class SurveyReport extends Component {
    constructor(props) {
        super(props);

        this.state = {
            semesters: [],
            departments: ["Agrimensura", "Computación", "Construcciones y Estructuras", "Electrónica", "Electrotecnia", "Estabilidad", "Física", "Gestión", "Hidráulica", "Idiomas", "Ingeniería Mecánica", "Ingeniería Naval", "Ingeniería Química", "Matemática", "Química", "Seguridad del trabajo y ambiente", "Tecnología Industrial", "Transporte"],
            selectedDepartment: 'blank',
            selectedSemester: 'blank'
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

    validSelect() {
        if (this.state.selectedDepartment == "blank" && this.state.selectedSemester == "blank")
            alert("Por favor, seleccione el departamento y período lectivo sobre los que quiere visualizar los reportes");
        else if (this.state.selectedDepartment == "blank")
            alert("Debe seleccionar un departamento");
        else if (this.state.selectedSemester == "blank")
            alert("Debe seleccionar un período lectivo");
        else {
            // Get reports
        }
    }

    render() {
        let semesterCodes = this.state.semesters.map(semester => <option value={semester} key={semester}>{semester}</option>);
        let departmentNames = this.state.departments.map(department => <option value={department} key={department}>{department}</option>)
        return (
        <div>  
            <h1 style={{color: "#696969"}}>Sistema de Gestión Académica</h1>
            <hr/>

            <h2 style={{marginBottom: "1em"}}> Reporte de encuestas </h2>
            <div className="well">
            <form style={{paddingBlockStart: "1em", marginBlockEnd: "-1.5em"}}>
                <FormGroup controlId="formControlsSelect">
                <div className="row">
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
        </div>
        );
    }
}

export default SurveyReport;