import React, { Component } from 'react';
import '../App.css';
import Proxy from '../Proxy';
import { Glyphicon, Alert, PageHeader } from 'react-bootstrap';
import ReactFileReader from 'react-file-reader';

class StudentsUpload extends Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedFile: false,
            file: null,
            errors: null,
            ok: false
        };
    }

    selectFiles(files) {
        this.setState({selectedFile: true, file: files[0], errors: null, ok: false});
        var reader = new FileReader();
            reader.onload = function(e) {
                // Use reader.result
                alert(reader.result);
                console.log(files[0]);
            }
        reader.readAsText(files[0]);
    }

    handleFiles() {
        this.setState({errors: null, ok: false});
        if (!this.state.selectedFile) {
            alert("Debe seleccionar un archivo para poder importar alumnos");
        }
        else {
            Proxy.uploadFile("/estudiantes/csv", this.state.file)
            .then(res => {
                if (res) {
                    console.log(res)
                    let errors = res.errors.map((error, idx) => {
                        return (
                            <div key={idx}>
                                <ul>
                                    <li><strong>{"Línea " + (error.lineNumber + 1) + ":"} </strong></li>
                                    <ul>
                                        <li><strong>Datos: </strong> {" " + error.line} </li>
                                        <li><strong>Error: </strong> {" " + error.error} </li>
                                    </ul>
                                </ul>
                            </div>);
                    });
                    this.setState({errors: errors});
                }
                else {
                    this.setState({ok: true});
                }
            });
        }
      }

    render() {
        return (
        <div>  
            <div className="jumbotron" style={{backgroundColor: "#C0C0C0"}}>
                <h1>Sistema de <br/> Gestión Académica</h1>
            </div>

            <PageHeader style={{marginBottom: "4em"}}> Importar estudiantes </PageHeader>
            <div className="well">
                <div className="row" style={{paddingTop: "0.7em"}}>
                    <div className="col-lg-2">
                        <ReactFileReader handleFiles={this.selectFiles.bind(this)} fileTypes={'.csv'}>
                            <button id="exampleInputFile" className="form-control-file" aria-describedby="file" style={{color: "black"}}> Examinar... </button>
                        </ReactFileReader>
                    </div>
                    <div className="col-lg-8">
                        <p id="fileInfo" className="text-primary" style={{marginLeft: "-2em", paddingTop: "0.2em"}}> {this.state.selectedFile ? this.state.file.name : "No se seleccionó un archivo."}</p>
                    </div>
                    <div className="col-lg-2">
                    <button type="button" className="btn btn-primary btn-sm pull-right" style={{marginTop: "-0.2em"}} onClick={this.handleFiles.bind(this)}><Glyphicon glyph="upload" /> Importar alumnos</button>
                    </div>
                </div>
            </div>
            <div style={{paddingTop: "1em"}}><small id="fileHelp" className="text-muted"> 
            <ul>El archivo debe ser un .csv con los siguientes datos separados por coma:
                <div style={{paddingLeft: "2em"}}>
                <li>Padrón </li>
                <li>Contraseña inicial (en el caso de que este usuario ya exista en el sistema, este campo puede dejarse en blanco) </li> 
                <li>Nombre  </li>
                <li>Apellido  </li>
                <li>Prioridad  </li>
                <li>Email  </li>
                <li>Lista de carreras a las que está anotado (como enteros separados por guiones) </li>
                </div>
            </ul></small></div>
            
            
            {(this.state.errors != null) && <Alert bsStyle="danger" style={{marginTop: "2em"}}>
                <h3 className="text-danger" style={{paddingBottom: "1em"}}> Errores encontrados </h3>
                {this.state.errors}
            </Alert>}

            {this.state.ok && <Alert bsStyle="success" style={{marginTop: "2em"}}>
                <p className="text-center">Los alumnos fueron importados exitosamente!</p>
            </Alert>}

        </div>

        );
    }
}

export default StudentsUpload;