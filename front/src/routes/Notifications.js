import React, { Component } from 'react';
import '../App.css';
import Proxy from '../Proxy';
import { Modal, Button, Glyphicon, Pager, Item } from 'react-bootstrap';

class Notifications extends Component {
    constructor(props) {
        super(props);

        this.state = {
            notifications: [],
            showSendNotification: false,
            message: '',
            inputError: false,
            ok: false,
            errorMsg: '',
            actualPage: 0,
            pages: 0,
            actualNotifications: []
        };
    }
 

    getNotifications() {
        return Proxy.getNotifications();
    }

    setActualNotifications(actualPage) {
        var actualNotif = [];
        for(var i = actualPage * 5; i < 5 + (actualPage * 5); i++) {
            if (i < this.state.notifications.length) 
                actualNotif.push(this.state.notifications[i]);
             
        }
        this.setState({actualNotifications: actualNotif});
    }

    setNotifications(){
        this.getNotifications()
            .then(notifications => {
                let sortedNotifications = notifications.sort((a,b) => (a.creation < b.creation) ? 1 : ((b.creation < a.creation) ? -1 : 0));
                this.setState({notifications: sortedNotifications, pages: Math.ceil(notifications.length / 5)});
                this.setActualNotifications(this.state.actualPage);
             });
    }

    componentDidMount() {
        this.setNotifications();
    }

    showModal(modal) {
        this.setState({showSendNotification: true});
    }

    handleHide() {
        this.setState({showSendNotification: false, message: '', errorMsg: '', inputError: false, ok: false});
    }

    sendNotification() {
        let message = {
            message: this.state.message
        };
        Proxy.sendNotification(message)
        .then(status => {
            if (status == 201) {
                this.setState({ok: true, errorMsg: "Se ha enviado la notificación exitosamente"});
                setTimeout(() => { 
                    this.handleHide("sendNotification");
                 }, 1500);
                this.setNotifications();
            }
            else {
                this.setState({inputError: true, errorMsg: "No se pudo enviar la notificación, intente nuevamente"})
            }
        });
    }

    nextPage() {
        let newPage = this.state.actualPage + 1;
        if (newPage < this.state.pages) {
            this.setState({actualPage: newPage});
            this.setActualNotifications(newPage);
        }
    }

    prevPage() {
        let newPage = this.state.actualPage - 1;
        if (newPage >= 0) {
            this.setState({actualPage: newPage});
            this.setActualNotifications(newPage);
        }
    }

    dateFormat(timestamp) {
        let date = timestamp.substring(0, 10);
        let hour = timestamp.substr(11, 5);
        var parts = date.match(/(\d+)/g);
        return parts[2] + "/" + parts[1] + "/" + parts[0] + ", " + hour + " hs";
    }

    render() {
        window.scrollTo(0, 0);
        return (
            <div>

                <h1 style={{color: "#696969"}}>Sistema de Gestión Académica</h1>
                <hr/>

                {this.state.notifications && <div>
                    <div style={{paddingBottom:"1.5em"}}>
                        <h2> Notificaciones
                        <button type="button" className="btn btn-primary pull-right" style={{marginRight: "1.5em"}} onClick={this.showModal.bind(this)}><Glyphicon glyph="envelope" /> Enviar notificación</button>
                        </h2>
                    </div>

                    {this.state.actualNotifications
                        .map(function(notification, idx) {
                        return (<div key={idx} className="well">
                            <h4  style={{color: "#696969"}}> {notification.message}</h4>
                            <h6 className="text-primary text-right" style={{paddingTop: "0.5em", marginBottom: "-0.75em"}}> Enviado: <span style={{color: "#696969"}}>{this.dateFormat(notification.creation)}</span></h6>
                        </div>)
                    }, this)}
                    <Pager>
                    {(this.state.actualPage != 0) && <Pager.Item previous href="#" onClick={this.prevPage.bind(this)}>
                        &larr; Anterior
                    </Pager.Item>}
                    {(this.state.actualPage != this.state.pages - 1) && <Pager.Item next href="#" onClick={this.nextPage.bind(this)}>
                        Siguiente &rarr;
                    </Pager.Item>}
                    </Pager>
                </div>}

                {this.state.showSendNotification &&  <Modal
                show={this.state.showSendNotification}
                onHide={this.handleHide.bind(this, "sendNotification")}
                container={this}
                aria-labelledby="contained-modal-title"
                >
                <Modal.Header>
                    <Modal.Title id="contained-modal-title">
                    Enviar notificación
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                <form className="form-horizontal">
                <fieldset>

                    <div className="form-group">
                    <div style={{marginInlineStart: "2em", marginInlineEnd: "2em"}}>
                    <label htmlFor="exampleTextarea">Mensaje</label>
                    <textarea className="form-control" value={this.state.message} id="exampleTextarea" rows="3" onChange={ e => {
                            if (e.target.value.length <= 300) {
                                this.setState({message: e.target.value});
                            }
                        }}></textarea>
                    </div>
                    </div>

                </fieldset>
                </form>
                {this.state.inputError && 
                    <div className="alert alert-dismissible alert-danger" >
                        <button type="button" className="close" data-dismiss="alert" onClick={ e => this.setState({ inputError : false }) }>&times;</button>
                        <a href="#" className="alert-link"/>{this.state.errorMsg}
                    </div>}
                {this.state.ok && 
                    <div className="alert alert-dismissible alert-success" >
                        <button type="button" className="close" data-dismiss="alert" onClick={ e => this.setState({ ok : false }) }>&times;</button>
                        <a href="#" className="alert-link"/>{this.state.errorMsg}
                    </div>}
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={this.handleHide.bind(this, "sendNotification")}>Cancelar</Button>
                    <Button bsStyle="primary" onClick={this.sendNotification.bind(this)}>Enviar</Button>
                </Modal.Footer>
                </Modal>}

            </div>

        );
    }
}

export default Notifications;