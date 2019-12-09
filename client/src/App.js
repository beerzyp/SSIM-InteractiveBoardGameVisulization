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
            searchNameWasSubmitted: false,
            searchItemsResults: [],
            text1: "",
            text2: "",
            isLoading: false,
            nodeClicked: ""
        };

        this.handleChangeSearch = this.handleChangeSearch.bind(this);
        this.handleChangeSelect = this.handleChangeSelect.bind(this);

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleStartBuildingGraph = this.handleStartBuildingGraph.bind(this);
        this.handleGraphNodeClick = this.handleGraphNodeClick.bind(this);

        this.displaySideBarInformation = this.displaySideBarInformation.bind(this);
    }


    handleChangeSearch(event) {
        this.setState({ searchName: event.target.value });
    }


    handleChangeSelect(event) {
        this.setState({ selectedSearch: event.target.value });
    }


    async handleSubmit(event) {
        //alert('A name was submitted: ' + this.state.searchName + '\n' + 'The selected box was: ' + this.state.selectedSearch);
        event.preventDefault();

        this.setState({ isLoading: true });

        await axios.get('https://www.boardgamegeek.com/xmlapi2/search?query=' + this.state.searchName + '&type=boardgame')
            .then((response) => {

                var parseString = require('xml2js').parseString;
                var xml = response.data;
                parseString(xml, function (err, result) {
                    console.log(response.data);
                    console.log(result);
                });



                var parser, xmlDoc;
                var text = response.data;
                
                parser = new DOMParser();
                xmlDoc = parser.parseFromString(text, "text/xml");
                
                //Get the number of items - we know this will be two because we only passed in two IDs
                var numberOfNames = xmlDoc.getElementsByTagName("item").length;
                
                //Create an array of the items
                var items = xmlDoc.getElementsByTagName("item");
                
                for (let i=0; i<numberOfNames; i++) {
                    //Create a new paragraph tag
                    //var tempName = document.createElement("p");
                    
                    //Get the name of a game in the collection
                    var gameName = items[i].getElementsByTagName('name')[0].getAttribute('value');

                    this.state.searchItemsResults.push(gameName);
                   
                    //Set the contents of the paragraph tag to the game name
                    //tempName.innerHTML = (i + 1 + ". ") + gameName;
                    
                    //Add the paragraph tag to the div in the body
                    //document.getElementById("gameNames").appendChild(tempName);
                }


                this.setState({text1: response.data, });
            })
            .catch(err => {
                console.log(err);
                return null;
            });

        this.setState({ isLoading: false, searchNameWasSubmitted: true });
    }


    async handleStartBuildingGraph() {

        this.setState({ isLoading: true, searchNameWasSubmitted: false });

        //Build the graph here
        await axios.get('https://www.boardgamegeek.com/xmlapi2/thing?id=1406')
            .then((response) => {

                var parseString = require('xml2js').parseString;
                var xml = response.data;
                parseString(xml, function (err, result) {
                    //console.log(result);
                });

                this.setState({text1: response.data, });
            })
            .catch(err => {
                console.log(err);
                return null;
            });


        this.setState({ isLoading: false });
    }


    async handleGraphNodeClick() {
        //event.preventDefault();
        this.setState({ isLoading: true });

        await axios.get('https://www.boardgamegeek.com/xmlapi2/thing?id=013')
            .then((response) => {

                var parseString = require('xml2js').parseString;
                var xml = response.data;
                parseString(xml, function (err, result) {
                    //console.log(result);
                });

                this.setState({text1: response.data, });
            })
            .catch(err => {
                console.log(err);
                return null;
            });

        this.setState({ isLoading: false, searchNameWasSubmitted: true });
    }


    displaySideBarInformation() {
        if(this.state.isLoading) {
            return(   
                <Row id="loadingRow">
                    <img 
                        id="loadingImage"
                        src="https://media.giphy.com/media/3o7bu8sRnYpTOG1p8k/source.gif"
                        //src="https://media.giphy.com/media/sSgvbe1m3n93G/source.gif"
                        alt="Loading"
                    />
                    <p>Loading</p>
                </Row>
            );
        }

        else {
            if(this.state.nodeClicked !== "")
            {
                return (
                    <Row id="gameClickedOnGraph">
                        <h4> Title of the Board Game Here</h4>
                        <img 
                            src="https://images.pexels.com/photos/20787/pexels-photo.jpg?auto=compress&cs=tinysrgb&h=350"
                            alt="Board Game"
                        />
                        <p>
                            Rating: something/10
                        </p>

                    </Row>  
                );
            }

            else if (this.state.nodeClicked === "" && this.state.searchNameWasSubmitted) {
                return (
                    <Row id="nameSearchResults">
                        <ul>
                                {this.state.searchItemsResults.map(item => (
                                    <li onClick={this.handleStartBuildingGraph} key={item}> {item} </li>
                                  ))}
                    
                            {/*
                            <li onClick={this.handleStartBuildingGraph}> 1st Game</li>
                            <li onClick={this.handleStartBuildingGraph}> 2nd Game</li>
                            <li onClick={this.handleStartBuildingGraph}> 3rd Game</li>
                            */}
                        </ul>
                    </Row>  
                );
            }

            else {
                return;
            }
        }
    }


    render() {
        return (
            <div id="containerDiv">
                <Col id="sideBar">
                    { /*console.log(this.state.text1)*/ } 
                    { /*console.log(this.state.text2)*/ }
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

                    {this.displaySideBarInformation()}

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

/*
    async componentDidMount() {
        
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
    */

}
export default App;
