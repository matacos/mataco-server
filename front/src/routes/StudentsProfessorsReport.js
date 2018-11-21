import React, { Component } from 'react';
import '../App.css';
import Proxy from '../Proxy';
import { Glyphicon, Alert } from 'react-bootstrap';
import ReactFileReader from 'react-file-reader';

class StudentsProfessorsReport extends Component {
    constructor(props) {
        super(props);

        this.state = {
        };
    }


    render() {
        return (
        <div>  
            <h1 style={{color: "#696969"}}>Sistema de Gestión Académica</h1>
            <hr/>

            <h2 style={{marginBottom: "1em"}}> Reporte de estudiantes y docentes </h2>
        </div>
        );
    }
}

export default StudentsProfessorsReport;