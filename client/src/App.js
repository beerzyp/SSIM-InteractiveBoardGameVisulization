import React, { Component } from 'react';
import { Col, Row } from 'reactstrap';
import { Sigma, RandomizeNodePositions, RelativeSize, EdgeShapes, NodeShapes } from 'react-sigma';
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
            previouslySelectedSearch: null,
            searchNameWasSubmitted: false,
            searchItemsResults: [],
            isLoading: false,
            nodeClicked: null,
            previousNodeClickedId: "",
            graphJson: null,
            isGraphBuilt: false,
            gameIdPreviousGraphBuilt: ""
        };

        this.handleChangeSearch = this.handleChangeSearch.bind(this);
        this.handleChangeSelect = this.handleChangeSelect.bind(this);

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleGraphNodeClick = this.handleGraphNodeClick.bind(this);
        this.buildGraph = this.buildGraph.bind(this);

        this.displaySideBarInformation = this.displaySideBarInformation.bind(this);
        this.displayGraph = this.displayGraph.bind(this);
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
        
        this.setState({ isLoading: true, searchItemsResults: [], nodeClicked: null, previousNodeClickedId: "" });

        var isThereExactMatch = false;

        //Search for an exact match first
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

        //Then search for all other matches
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


    //Receives item in xmlDoc form
    async handleGraphNodeClick(event, item) {

        var id = "";
        if(event === null)
        {
            id = item.getAttribute('id');
        }
        else
        {
            id = event.data.node.id;
        }

        if(id === this.state.previousNodeClickedId)
        {
            return;
        }

        this.setState({ isLoading: true, searchNameWasSubmitted: false, previouslySearchedName: "" });
        
        //query for specific item id to get more info
        await axios.get('https://www.boardgamegeek.com/xmlapi2/thing?id=' + id/*item*//*item.getAttribute('id')*/ + '&stats=1')
        .then((response) => {

            var parser, xmlDoc;
            var text = response.data;
            
            parser = new DOMParser();
            xmlDoc = parser.parseFromString(text, "text/xml");

            this.setState({ nodeClicked: xmlDoc });
        })
        .catch(err => {
            console.log(err);
            return null;
        });
        

        this.setState({ isLoading: false, previousNodeClickedId: id });
    }


    async buildGraph(item) {

        this.setState({ searchNameWasSubmitted: false, previouslySearchedName: "", previousNodeClickedId: "" });

        if(item.getAttribute('id') === this.state.gameIdPreviousGraphBuilt && this.state.selectedSearch === this.state.previouslySelectedSearch)
        {
            this.handleGraphNodeClick(null, item);
            return;
        }

        this.setState({ isLoading: true, isGraphBuilt: false });

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


        await axios.get('https://www.boardgamegeek.com/xmlapi2/plays?username=mgperez')
            .then((response) => {

                var parseString = require('xml2js').parseString;
                var xml = response.data;
                parseString(xml, function (err, result) {
                    console.log(result);
                });

            })
            .catch(err => {
                console.log(err);
                return null;
            });

        
        /*The only way I can think of to somehow get related games would be to:
         - search for the main game id, with "&comments=1"
         - if there are comments, get the usernames from those comments
         - search for "plays" for all those usernames
         - store all the games played by all those users and see the most relevant ones to show (more players played them, more rating, same game category/designer, etc)
         
         - Its a not bad solution, BUT, if there are no comments, there's NOTHING we can do
        */
        

        //Trying to get the html from the bgg site, in order to try to get the related games ("Fans also like"):
        /*
        function reqListener () {
            //console.log("blablablablabmaeihdjaksfnu");
            console.log(this.responseText);
        }
        
        var oReq = new XMLHttpRequest();
        oReq.addEventListener("load", reqListener);
        oReq.open("GET", "/https://www.boardgamegeek.com/boardgame/174430/gloomhaven");
        oReq.send();
        */


        let myGraph = {nodes:[], edges:[]};
        //let myGraph = {nodes:[{id:"1406", label:"Monopoly"}, {id:"1407", label:"Whatever"}], edges:[{id:"e1",source:"1406",target:"1407",label:"SEES"}]};

        //Just an example of a graph built out of the other searched results
        let items = this.state.searchItemsResults;

        for(let i = 0; i < items.length; i++)
        {
            myGraph.nodes.push({id:items[i].getAttribute('id'), label:items[i].getElementsByTagName('name')[0].getAttribute('value')});
            if(i !== 0)
            {
                myGraph.edges.push({id:'e' + items[i].getAttribute('id'), source: items[0].getAttribute('id'), target:items[i].getAttribute('id'), label:"SEES"});
            }
        }

        //console.log(myGraph);

        this.handleGraphNodeClick(null, item);

        this.setState({ isLoading: false, graphJson: myGraph, isGraphBuilt: true, gameIdPreviousGraphBuilt: item.getAttribute('id'), previouslySelectedSearch: this.state.selectedSearch });
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
                                <li onClick={() => this.buildGraph(item)} key={item.getAttribute('id')}> {item.getElementsByTagName('name')[0].getAttribute('value')} </li>
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


    displayGraph() {
        if(this.state.isGraphBuilt) {
            return (
                <Sigma id="sigmaGraph" style={{ width:"100%", height:"100%" }} onClickNode={this.handleGraphNodeClick} graph={this.state.graphJson} settings={{drawEdges: true, clone: false}}>
                    <RelativeSize initialSize={15}/>
                    <RandomizeNodePositions/>
                    <EdgeShapes default="tapered"/>
                    <NodeShapes default="star"/>
                </Sigma>
            )
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
                        relacionados para fácil visualização, blablabla.
                    </p>
                    <p>
                        Yes, the loading wheel is pizza... (I'm hungry ok?!)
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

                    {this.displayGraph()}
                    

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
