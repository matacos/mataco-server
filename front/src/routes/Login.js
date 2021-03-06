import React, { Component } from 'react';
import '../App.css';
import Proxy from '../Proxy';
import logoFIUBA from '../images/logo.png';

class Login extends Component {
    constructor(props) {
        super(props);

        this.state = {
            dni: '',
            password: '',
            dniError: false,
            dniErrorMsg: '',
            credentialsError: false,
            passwordError: false
        };
    }

    clearErrors() {
        this.setState({dniError: false, passwordError: false, credentialsError: false})
    }

    processInput() {
        this.clearErrors()
        if (!this.state.dni.match('^[0-9]*$')) 
            this.setState({dniError: true, dniErrorMsg: "Debés ingresar tu DNI sin puntos ni espacios. Debe tener caracteres numéricos únicamente"});
        else if (this.state.dni.length > 8 || this.state.dni.length < 5) 
            this.setState({dniError: true, dniErrorMsg: "El número ingresado en 'DNI' debe tener 8 dígitos o menos"});
        else if (this.state.password.length < 1)
            this.setState({passwordError: true});
        else {
            Proxy.login(this.state.dni, this.state.password) 
            .then(
                () => {
                    Proxy.setSemesterData().then(() => {
                        window.location.reload();
                    });
                    
                },
                (error) => {
                    console.log(error)
                    this.setState({ credentialsError: true })
                }
            )
        }
        
    }


    render() {
        return (
        <div>
            <div className="row">
            <div className="col-md-3">
            <img className="col-md-offset-1" src={logoFIUBA} alt="logo" height="150" width="150"/>
            </div>
            <div className="col-md-6">
            <h1 className="App">
                Sistema de Gestión Académica
            </h1>
            </div>
            </div>
            <form className="form">
                <fieldset>
                    
                    <legend className="col-md-offset-3" style={{marginBottom: "3em"}}>Bienvenido! </legend>
                    {this.state.credentialsError && <div className="row"> 
                        <div className="alert alert-dismissible alert-danger col-md-6 col-md-offset-3">
                            <button type="button" className="close" data-dismiss="alert" onClick={ e => this.setState({ credentialsError : false })}>&times;</button>
                            <a href="#" className="alert-link"/>Esa combinación de DNI y contraseña no es correcta. Intente nuevamente
                        </div> </div>}
                    <div className="form-group col-md-4 col-md-offset-4">
                    <label className="text-primary col-md-2 control-label" style={{paddingTop: "1em"}}>DNI</label>
                    <input type="text" className="form-control" value={this.state.dni} placeholder="Ejemplo: 12654773" onChange={ e => this.setState({ dni : e.target.value }) }/>
                    {this.state.dniError && 
                        <div className="alert alert-dismissible alert-danger " >
                            <button type="button" className="close" data-dismiss="alert" onClick={ e => this.setState({ dniError : false }) }>&times;</button>
                            <a href="#" className="alert-link"/>{this.state.dniErrorMsg}
                        </div>}
                    </div>
                    <div className="form-group col-md-4 col-md-offset-4">
                    <label className="text-primary col-lg-2 control-label">Contraseña</label>
                    <input type="password" className="form-control" value={this.state.password} onChange={ e => this.setState({ password : e.target.value }) }/>
                    {this.state.passwordError && 
                        <div className="alert alert-dismissible alert-danger " >
                            <button type="button" className="close" data-dismiss="alert" onClick={ e => this.setState({ passwordError : false }) }>&times;</button>
                            <a href="#" className="alert-link"/>Recuerde ingresar la contraseña
                        </div>}
                    </div>
                    <div className="form-group">
                    <div className="col-md-4 col-md-offset-4" style={{paddingTop: "1em"}}>
                        <button type="button" className="btn btn-primary center-block" onClick={this.processInput.bind(this)}>Ingresar</button>
                    </div>
                    </div>
                    
                </fieldset>
            </form>
            
        </div>
        );
    }
}

export default Login;