import React, { Component } from 'react';
import { Col, Row } from 'reactstrap';
import { Sigma, LoadJSON } from 'react-sigma';
import axios from 'axios';

import './App.scss';

//var sigma = require("sigma-js");


class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            searchName: "",
            selectedSearch: null,
            text1: "",
            text2: ""
        };
        this.displaySelectedNodeInfo = this.displaySelectedNodeInfo.bind(this);
        this.handleChangeSelect = this.handleChangeSelect.bind(this);
        this.handleChangeSearch = this.handleChangeSearch.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
  }

  displaySelectedNodeInfo() {
      return (
        <Row id="gameClickedOnGraph">
        <h4> Title of the Board Game Here</h4>
        <img 
            src="https://images.pexels.com/photos/20787/pexels-photo.jpg?auto=compress&cs=tinysrgb&h=350"
            alt="new"
        />
        <p>
            Rating: something/10
        </p>

    </Row>  
      );
  }

  handleChangeSearch(event) {
    this.setState({searchName: event.target.value});
  }

  handleChangeSelect(event) {
      this.setState({ selectedSearch: event.target.value });
  }

  handleSubmit(event) {
    alert('A name was submitted: ' + this.state.searchName + '\n' + 'The selected box was: ' + this.state.selectedSearch);
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
                            {/*<select value={this.state.selectedSearch} onChange={this.handleChangeSelect}>
                                <option value="related by rating and genre">Grapefruit</option>
                                <option value="related by creator">Lime</option>
                            </select>
        */}
                            <ul>
                                <li>
                                    <label>
                                        <input
                                            type="radio"
                                            value="related by genre and rating"
                                            checked={this.state.selectedSearch === "related by genre and rating"}
                                            onChange={this.handleChangeSelect}
                                        />
                                        Related by genre and rating
                                    </label>
                                    </li>
                                    
                                    <li>
                                    <label>
                                        <input
                                        type="radio"
                                        value="related by creator"
                                        checked={this.state.selectedSearch === "related by creator"}
                                        onChange={this.handleChangeSelect}
                                        />
                                        Related by creator
                                    </label>
                                </li>
                            </ul>

                            <input type="text" value={this.state.searchName} onChange={this.handleChangeSearch} />
                        </label>
                        <input type="submit" value="Submit" />
                    </form>


                    {this.displaySelectedNodeInfo()}
                    

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

            var parseString = require('xml2js').parseString;
            var xml = response.data;
            parseString(xml, function (err, result) {
                console.dir(result);
            });

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
