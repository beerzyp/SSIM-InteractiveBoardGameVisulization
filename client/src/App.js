import React from 'react';
import { Button, Col, Row } from 'reactstrap';
import logo from './logo.svg';

import { Sigma, LoadJSON } from 'react-sigma';

import './App.scss';

var sigma = require("sigma-js");







function App() {
  return (
    <div id="containerDiv">
        <Col id="hello">Hello</Col > 
        <Col id="noHello" className="App">
            {/*<header className="App-header">*/}
                {/*<Button color="danger">Danger!</Button>*/}

 
                {/*<div /*style={{ 'max-width': '400px', 'height': '400px', 'margin': 'auto' }} >*/}
                <Sigma style={{width:"400px", height:"400px"}}>
                    <LoadJSON path='data.json' />
                </Sigma>
                    {/* <script src="sigma.min.js"></script>
                    <script src="sigma.parsers.json.min.js"></script>
                    <script>
                      {
                    sigma.parsers.json('data.json', 
                        {container: 'container'},
                        {settings: ''},
                        {defaultNodeColor: '#ec5148'}
                        
                    ) }
                    </script>
                      */}
                {/*</div>*/}


                {/*<img src={logo} className="App-logo" alt="logo" />
                <p>
                Edit <code>src/App.js</code> and save to reload.
                </p>
                <a
                className="App-link"
                href="https://reactjs.org"
                target="_blank"
                rel="noopener noreferrer"
                >
                Learn React
                </a> 
                */}
            {/*</header>*/}
        </Col>
    </div>
  );
}

export default App;



/* Example:


import React, { Component } from 'react';
import {
    Collapse,
    Navbar,
    NavbarToggler,
    NavbarBrand,
    Nav,
    NavItem,
    NavLink,
    Container,
    Row,
    Col,
    Jumbotron,
    Button
} from 'reactstrap';

class App extends Component {
    constructor(props) {
        super(props);

        this.toggle = this.toggle.bind(this);
        this.state = {
            isOpen: false
        };
    }
    toggle() {
        this.setState({
            isOpen: !this.state.isOpen
        });
    }
    render() {
        return (
            <div>
                <Navbar color="inverse" light expand="md">
                    <NavbarBrand href="/">reactstrap</NavbarBrand>
                    <NavbarToggler onClick={this.toggle} />
                    <Collapse isOpen={this.state.isOpen} navbar>
                        <Nav className="ml-auto" navbar>
                            <NavItem>
                                <NavLink href="/components/">Components</NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink href="https://github.com/reactstrap/reactstrap">Github</NavLink>
                            </NavItem>
                        </Nav>
                    </Collapse>
                </Navbar>
                <Jumbotron>
                    <Container>
                        <Row>
                            <Col>
                                <h1>Welcome to React</h1>
                                <p>
                                    <Button
                                        tag="a"
                                        color="success"
                                        size="large"
                                        href="http://reactstrap.github.io"
                                        target="_blank"
                                    >
                                        View Reactstrap Docs
                                    </Button>
                                </p>
                            </Col>
                        </Row>
                    </Container>
                </Jumbotron>
            </div>
        );
    }
}

export default App;


*/
