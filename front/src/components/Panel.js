import React, { Component } from 'react';
import logoFIUBA from '../images/logo.png';
import Assistant from '../Assistant';
import Proxy from '../Proxy';
import { withRouter } from 'react-router-dom';
import { Glyphicon, DropdownButton, MenuItem, ButtonGroup } from 'react-bootstrap';
import "./Panel.css";

class Panel extends Component {
    constructor(props) {
        super(props);

        this.state = {
            subjects: [],
            courses: [],
            currentCourse: null
        };

    }

    setPanelInformation() {
        if (Assistant.isProfessor()) 
            Proxy.getProfessorCourses().then(courses => {
                this.setState({courses: courses});
                if ((this.state.currentCourse == null) && (this.state.courses.length > 0)) {
                    this.setState({currentCourse: this.state.courses[0]});
                }
            });
    
        if (Assistant.isDepartmentAdmin())
            Proxy.getDepartmentSubjects().then(subjects => this.setState({subjects: subjects}));
    }

    componentDidMount() {
        this.setPanelInformation();
    }

    componentDidUpdate(prevProps) {
        if (this.props.mode != prevProps.mode) {
            this.setPanelInformation();
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

    logout() {
        Proxy.logout();
        this.props.history.push('/login');
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
                return (
                    <div>
                        {this.state.currentCourse != null && <div> {this.showCourseDropdown(this.state.courses)}
                        <div><button className="Panel-item" style={{paddingTop: "1em"}} onClick={this.goToCourse.bind(this, this.state.currentCourse)}><h4 className="text-primary"> Cursada</h4> </button></div>
                        <div className="row" style={{paddingLeft: "1em"}}>
                        </div>
                        <div className="row" style={{paddingLeft: "1em"}}>
                            <button className="Panel-item" onClick={this.handleSelectedField.bind(this, "exams")}><h4 className="text-primary"> 
                                {((this.props.selected["exams"]) && <Glyphicon style={{fontSize:"0.75em"}} glyph="minus" />) || <Glyphicon style={{fontSize:"0.75em"}} glyph="plus" />}
                                {" Finales"}
                            </h4></button>
                        </div>
                        </div>}
                    </div>
                );

            case "department_administrator":
                var listItems = this.state.subjects.map((d) => <div key={d.department_code + d.code}>
                <button className="text-primary text-left Panel-list-item" onClick={this.goToSubject.bind(this, d.department_code + d.code, d.name.replace(/ /g, "-"))}>
                    {d.name}
                    <hr />
                </button></div>);
                return (
                    <div>
                        <button className="Panel-item" onClick={this.handleSelectedField.bind(this, "subjects")}><h4 className="text-primary"> 
                        {((this.props.selected["subjects"]) && <Glyphicon style={{fontSize:"0.75em"}} glyph="minus" />) || <Glyphicon style={{fontSize:"0.75em"}} glyph="plus" />}
                        {" Mis Materias"}</h4></button>
                        {(this.props.selected["subjects"]) && 
                        <div style={{marginTop: "1em"}}>
                            <div style={{marginLeft: "2em"}}><hr /></div>
                            {listItems}
                        </div>}
                    </div>
                );

            case "administrator":
                return (
                    <div>
                        <div><button className="Panel-item" onClick={this.goToHome.bind(this)}><h4 className="text-primary"> Alta de materias</h4> </button></div>
                        <div><button className="Panel-item" onClick={this.goToHome.bind(this)}><h4 className="text-primary"> Alta de estudiantes</h4> </button></div>
                        <div><button className="Panel-item" onClick={this.goToHome.bind(this)}><h4 className="text-primary"> Alta de docentes</h4> </button></div>
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
                <p><button className="text-primary Panel-item" onClick={this.logout.bind(this)}><h4 className="text-primary">  Cerrar sesión </h4></button></p>
            </div>
        );
    }

    render() {
        return (
            <div>
            {Assistant.isLoggedIn() && <div className="panel panel-default col-md-3" style={{margin: "0", padding: "0"}}>
            <div className="panel-heading" style={{width: "auto"}}>
                <img className="img-responsive center-block" alt="logo" src={logoFIUBA} height="50%" width="50%" style={{marginLeft: "auto", marginRight: "auto", width: "50%", paddingTop: "1em"}}/>
                <h3 className="text-center" style={{color: "#696969"}}>{Assistant.inProfessorMode() ? Assistant.getField("name") : "Departamento de " + Assistant.getField("department")}</h3>
            </div>

            <div className="panel-body" style={this.props.selected["subjects"] ? {height: "auto"} : {height: "100vh"}}>
                {this.showMenu(this.props.mode)}
            </div>
            </div>}
            </div>
        );
    }
}

export default withRouter(Panel);
