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
            searchName: "",
            text1: "",
            text2: ""
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({searchName: event.target.value});
  }

  handleSubmit(event) {
    alert('A name was submitted: ' + this.state.searchName);
    event.preventDefault();
  }


    render() {
        return (
            <div id="containerDiv">
                <Col id="sideBar">
                    { console.log(this.state.text1) } 
                    { console.log(this.state.text2) }
                    <header>
                        Board Game Network
                    </header>
                    <h3>
                        Prototype
                    </h3>
                    <p>
                        Blablablabla, colocar nome do board game na search bar, blablabla, será criado um grafo com os board games
                        relacionados para fácil visualização, blablabla
                    </p>
                    <form onSubmit={this.handleSubmit}>
                        <label>
                            <input type="text" value={this.state.searchName} onChange={this.handleChange} />
                        </label>
                        <input type="submit" value="Submit" />
                    </form>
                </Col> 
                <Col id="sigmaCol" className="App">

        
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
