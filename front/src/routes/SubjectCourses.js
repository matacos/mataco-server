import React, { Component } from 'react';
import '../App.css';
import logoFIUBA from '../images/logo.png';
import { Modal, Button } from 'react-bootstrap';

class SubjectCourses extends Component {
    constructor(props) {
        super(props);

        this.state = {
            subject: "Algoritmos y Programación III",
            selectedCourses: false,
            coursesText: "> Mis Cursos",
            conditional: false
        };
    }

    handleSelectedCourses() {
        if (this.state.selectedCourses) {
            this.state.coursesText = "> Mis Cursos"
            this.setState({selectedCourses: false})
        }
        else {
            this.state.coursesText = "v Mis Cursos"
            this.setState({selectedCourses: true})
        }
    }

    acceptConditional() {
        this.setState({conditional: true})
    }

    handleHide() {
        this.setState({ conditional: false });
      }

    render() {
        return (
        <div>
            <div className="row">
            <div className="panel panel-default col-md-3" style={{margin: "0", padding: "0"}}>
            <div className="panel-heading" style={{width: "auto"}}>
                <img className="img-responsive center-block" src={logoFIUBA} height="50%" width="50%" style={{marginLeft: "auto", marginRight: "auto", width: "50%", paddingTop: "1em"}}/>
                <h3 className="panel-title text-center" style={{padding: "1em"}}>Carlos Fontela</h3>
            </div>

            <div className="panel-body" style={{height: "100vh"}}>
                <div style={{padding: "1em"}}>
                <button className="text-primary" style={{background: "none", border: "none"}} onClick={this.handleSelectedCourses.bind(this)}> {this.state.coursesText} </button>
                {this.state.selectedCourses && 
                <p className="text-primary" style={{padding: "1em", paddingLeft: "2em"}}> Soy curso </p>}
                </div>
            </div>
            </div>
            <div className="col-md-9" style={{padding: "4em"}}>
            <h1 className="App" style={{paddingBottom: "1em"}}> Sistema de Gestión Académica </h1>
            <h2 style={{paddingBottom: "1em"}}> {this.state.subject} </h2>
            <table className="table table-striped table-hover ">
            <thead>
                <tr>
                <th>#</th>
                <th>Padrón</th>
                <th>Apellido</th>
                <th>Nombre</th>
                <th>Estado</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                <td>1</td>
                <td>Column content</td>
                <td>Column content</td>
                <td>Column content</td>
                <td>Column content</td>
                </tr>
                <tr>
                <td>2</td>
                <td>Column content</td>
                <td>Column content</td>
                <td>Column content</td>
                <td>Column content</td>
                <a href="#" className="btn btn-primary" onClick={this.acceptConditional.bind(this)}>Aceptar</a>
                </tr>
                
            </tbody>
            </table>
            
            {this.state.conditional &&  <Modal
            show={this.state.conditional}
            onHide={this.handleHide.bind(this)}
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
                <div class="form-group">
                <label for="select" className="col-lg-2 control-label">Sede</label>
                <div className="col-lg-10">
                    <select className="form-control" id="sede">
                    <option>Paseo Colón</option>
                    <option>Las Heras</option>
                    <option>Ciudad Universitaria</option>
                    </select>
                </div>
                </div>

                <div className="form-group">
                <label for="inputAula" className="col-lg-2 control-label">Aula</label>
                <div className="col-lg-10">
                    <input type="text" className="form-control" id="inputAula"/>
                </div>
                </div>
            
                
                <div className="form-group">
                <label for="select" className="col-lg-2 control-label">Día</label>
                <div className="col-lg-10">
                    <select className="form-control" id="dia">
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
                <label for="inputInicio" className="col-lg-2 control-label">Horario de inicio</label>
                <div className="col-lg-10">
                    <input type="text" className="form-control" id="inputInicio"/>
                </div>
                </div>

                <div className="form-group">
                <label for="inputFin" className="col-lg-2 control-label">Horario de fin</label>
                <div className="col-lg-10">
                    <input type="text" className="form-control" id="inputFin"/>
                </div>
                </div>

                <div className="form-group">
                <label for="tipo" className="col-lg-2 control-label">Tipo</label>
                <div className="col-lg-10">
                    <select className="form-control" id="tipo">
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
                <Button onClick={this.handleHide.bind(this)}>Cancelar</Button>
                <Button bsStyle="primary" onClick={this.handleHide.bind(this)}>Aceptar</Button>
            </Modal.Footer>
            </Modal>}

        </div>
        </div>
        </div>

        );
    }
}

export default SubjectCourses;