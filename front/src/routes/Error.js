import React from 'react';
import { Glyphicon } from 'react-bootstrap';

const Error = () => {
    return (
        <div>
        <h1 className="App"><Glyphicon glyph="warning-sign" />   Error: la página ingresada no existe!</h1>
        <hr/>
        <h3 className="App text-primary">Tal vez quisiste entrar al <a href="/">siguiente link</a> </h3> 
        </div>
    )
}

export default Error;