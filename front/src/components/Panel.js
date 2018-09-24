import React, { Component } from 'react';
import logoFIUBA from '../images/logo.png';

class Panel extends Component {

    render() {
        return (
        <div className="panel panel-default col-md-3" style={{margin: "0", padding: "0"}}>
            <div className="panel-heading" style={{width: "auto"}}>
                <img className="img-responsive center-block" alt="logo" src={logoFIUBA} height="50%" width="50%" style={{marginLeft: "auto", marginRight: "auto", width: "50%", paddingTop: "1em"}}/>
                <h3 className="panel-title text-center" style={{padding: "1em"}}>Carlos Fontela</h3>
            </div>

            <div className="panel-body" style={{height: "100vh"}}>
                <div style={{padding: "1em"}}>
                <button className="text-primary" style={{background: "none", border: "none", paddingBottom: "1em"}} onClick={this.props.handleSelectedMenu}> {this.props.text} </button>
                {this.props.selectedCourses && 
                <div>{this.props.listItems}</div>}
                </div>
            </div>
        </div>);
    }
}

export default Panel;