import React, { Component } from 'react';
import { Col } from 'reactstrap';
import { Sigma, LoadJSON } from 'react-sigma';
import axios from 'axios';

import './App.scss';

//var sigma = require("sigma-js");


class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            text1: "",
            text2: ""
            //isOpen: false
        };
    }


    render() {
        return (
            <div id="containerDiv">
                <Col id="hello">
                    { console.log(this.state.text1) } 
                    { console.log(this.state.text2) }
                    Hello
                </Col> 
                <Col id="noHello" className="App">

        
                        {/*<div /*style={{ 'max-width': '400px', 'height': '400px', 'margin': 'auto' }} >*/}
                        <Sigma style={{width:"400px", height:"400px"}}>
                            <LoadJSON path='data.json'/>
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

                </Col>
            </div>
        );
    }


    async componentDidMount() {

        //await axios.get('https://dog.ceo/api/breeds/list/all')
        await axios.get('https://www.boardgamegeek.com/xmlapi2/thing?id=013')
        .then((response) => {
            this.setState({text1: response.data});
        })
        .catch(err => {
            console.log(err);
            return null;
        });


        await axios.get('https://bgg-json.azurewebsites.net/thing/013')
        .then((response) => {
            this.setState({text2: response.data});
        })
        .catch(err => {
            console.log(err);
            return null;
        });

    }

}

export default App;
