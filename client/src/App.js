import React, { Component } from 'react';
import { Col, Row } from 'reactstrap';
import { Sigma, LoadJSON, RandomizeNodePositions, RelativeSize, EdgeShapes, NodeShapes } from 'react-sigma';
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

        this.setState({ isLoading: true, searchNameWasSubmitted: false, previouslySearchedName: "" });

        //TODO: Build the graph here
        await axios.get('https://www.boardgamegeek.com/xmlapi2/thing?id=1406')
            .then((response) => {

                var parseString = require('xml2js').parseString;
                var xml = response.data;
                parseString(xml, function (err, result) {
                    //console.log(result);
                });

            })
            .catch(err => {
                console.log(err);
                return null;
            });

        this.handleGraphNodeClick(null, item);

        this.setState({ isLoading: false });
    }


    //Receives item in xmlDoc form
    async handleGraphNodeClick(event, item) {

        this.setState({ isLoading: true, searchNameWasSubmitted: false, previouslySearchedName: "" });

        var id = "";

        if(event === null)
        {
            id = item.getAttribute('id');
        }
        else
        {
            id = event.data.node.id
        }
        
        //console.log(event.data.node.id);
        
        //query for specific item id to get more info
        await axios.get('https://www.boardgamegeek.com/xmlapi2/thing?id=' + id/*item*//*item.getAttribute('id')*/ + '&stats=1')
        .then((response) => {

            var parser, xmlDoc;
            var text = response.data;
            
            parser = new DOMParser();
            xmlDoc = parser.parseFromString(text, "text/xml");
            //console.log('testing normal id response.data: ' + response.data);

            this.setState({ nodeClicked: xmlDoc });
        })
        .catch(err => {
            console.log(err);
            return null;
        });
        


        this.setState({ isLoading: false });
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

        else 
        {
            if(this.state.nodeClicked !== null)
            { 
                let ratingAverage = parseFloat(this.state.nodeClicked.getElementsByTagName('average')[0].getAttribute('value')).toFixed(1);
                let gameName = this.state.nodeClicked.getElementsByTagName('name')[0].getAttribute('value');

                let gameImage;
                let gameImageTag = this.state.nodeClicked.getElementsByTagName("image");
                if(gameImageTag.length > 0)
                {
                    gameImage = this.state.nodeClicked.getElementsByTagName("image")[0].childNodes[0].nodeValue;
                }

                return (
                    <Row id="gameClickedOnGraph">
                        <h4> { gameName } </h4>
                        <img 
                            src = { gameImage }
                            alt="Board Game"
                        />
                        <p>
                            Rating:  
                            {ratingAverage} / 10
                        </p>

                    </Row>  
                );
            }

            else if (this.state.nodeClicked === null && this.state.searchNameWasSubmitted) {
                return (
                    <Row id="nameSearchResults">
                        <ul>
                            { this.state.searchItemsResults.map(item => (
                                <li onClick={() => this.handleStartBuildingGraph(item)} key={item.getAttribute('id')}> {item.getElementsByTagName('name')[0].getAttribute('value')} </li>
                            ))}
                        </ul>
                    </Row>  
                );
            }

            else 
            {
                return;
            }
        }
    }


    render() {

        let myGraph = {nodes:[{id:"1406", label:"Monopoly"}, {id:"1407", label:"Whatever"}], edges:[{id:"e1",source:"1406",target:"1407",label:"SEES"}]};

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

                    
                    <Sigma id="sigmaGraph" style={{ width:"100%", height:"100%" }} onClickNode={this.handleGraphNodeClick} graph={myGraph} settings={{drawEdges: true, clone: false}}>
                    <RelativeSize initialSize={15}/>
                    <RandomizeNodePositions/>
                    <EdgeShapes default="tapered"/>
                    <NodeShapes default="star"/>
                    </Sigma>


                        {/*<div /*style={{ 'max-width': '400px', 'height': '400px', 'margin': 'auto' }} >*/}
                        {/*
                        <Sigma id="sigmaGraph" style={{ width:"100%", height:"100%" }}>
                            <LoadJSON path='data.json'/>
                        </Sigma>
                        */}
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
