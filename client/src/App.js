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
            previouslySearchedName: "",
            selectedSearch: null,
            searchNameWasSubmitted: false,
            searchItemsResults: [],
            text1: "",
            text2: "",
            isLoading: false,
            nodeClicked: null
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
        event.preventDefault();

        if(this.state.searchName === this.state.previouslySearchedName)
        {
            return;
        }
        
        this.setState({ isLoading: true, searchItemsResults: [], nodeClicked: null });

        var isThereExactMatch = false;

        await axios.get('https://www.boardgamegeek.com/xmlapi2/search?query=' + this.state.searchName + '&type=boardgame&exact=1')
            .then((response) => {

                /*
                var parseString = require('xml2js').parseString;
                var xml = response.data;
                parseString(xml, function (err, result) {
                    console.log('Here here: ' + response.data);
                    console.log('Here Here JSon: ' + result);
                });
                */
                

                var parser, xmlDoc;
                var text = response.data;
                
                parser = new DOMParser();
                xmlDoc = parser.parseFromString(text, "text/xml");
                
                //Create an array of the items
                var items = xmlDoc.getElementsByTagName("item");
                
                if(items.length !== 0)
                {
                    isThereExactMatch = true;
                    this.state.searchItemsResults.push(items[0]);
                }
            })
            .catch(err => {
                console.log(err);
                return null;
            });

        await axios.get('https://www.boardgamegeek.com/xmlapi2/search?query=' + this.state.searchName + '&type=boardgame')
            .then((response) => {

                /*
                var parseString = require('xml2js').parseString;
                var xml = response.data;
                parseString(xml, function (err, result) {
                    console.log(response.data);
                    console.log(result);
                });
                */

                var parser, xmlDoc;
                var text = response.data;
                
                parser = new DOMParser();
                xmlDoc = parser.parseFromString(text, "text/xml");

                //Create an array of the items
                var items = xmlDoc.getElementsByTagName("item");
                
                var i = 0;

                while(i < items.length && i < 11)
                {
                    if(isThereExactMatch)
                    {
                        if(items[i].getAttribute('id') !== this.state.searchItemsResults[0].getAttribute('id'))
                        {
                            this.state.searchItemsResults.push(items[i]);
                            //console.log(items[i]);
                        }
                    }

                    else
                    {
                        this.state.searchItemsResults.push(items[i]);
                    }

                    i++;
                }
            })
            .catch(err => {
                console.log(err);
                return null;
            });

        this.setState({ isLoading: false, searchNameWasSubmitted: true, previouslySearchedName: this.state.searchName });
    }


    async handleStartBuildingGraph(item) {

        console.log(item);

        
        //query for specific item id to get more info
        await axios.get('https://www.boardgamegeek.com/xmlapi2/thing?id=' + item.getAttribute('id') /*'https://www.boardgamegeek.com/xmlapi2/thing?id=1406'*/)
        .then((response) => {

            var parser, xmlDoc;
            var text = response.data;
            
            parser = new DOMParser();
            xmlDoc = parser.parseFromString(text, "text/xml");
        
            console.log(xmlDoc);

            this.setState({ nodeClicked: xmlDoc });

            this.setState({text1: response.data, });
        })
        .catch(err => {
            console.log(err);
            return null;
        });

        this.setState({ isLoading: true, searchNameWasSubmitted: false/*, nodeClicked: item*/ });

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
            if(this.state.nodeClicked !== null)
            { 
                //TODO: Cant find rating from item xml...
                console.log('herererereer: ' + this.state.nodeClicked);
                //console.log('balbablalbabl: ' + this.state.nodeClicked.getAttribute("rating"));

                return (
                    <Row id="gameClickedOnGraph">
                        <h4> { this.state.nodeClicked.getElementsByTagName('name')[0].getAttribute('value') } </h4>
                        <img 
                            src={ this.state.nodeClicked.getElementsByTagName("image")[0].childNodes[0].nodeValue }
                            //src="https://images.pexels.com/photos/20787/pexels-photo.jpg?auto=compress&cs=tinysrgb&h=350"
                            alt="Board Game"
                        />
                        <p>
                            Rating: something/10
                        </p>

                    </Row>  
                );
            }

            else if (this.state.nodeClicked === null && this.state.searchNameWasSubmitted) {
                return (
                    <Row id="nameSearchResults">
                        <ul>
                            { this.state.searchItemsResults.map(item => (
                                <li onClick={() => this.handleStartBuildingGraph(item)} /*onClick={this.handleStartBuildingGraph}*/ key={item.getAttribute('id')}> {item.getElementsByTagName('name')[0].getAttribute('value')} </li>
                            ))}
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
                <Col id="sigmaCol">

                        {/*<div /*style={{ 'max-width': '400px', 'height': '400px', 'margin': 'auto' }} >*/}
                        <Sigma id="sigmaGraph" style={{ width:"100%", height:"100%" }}>
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
