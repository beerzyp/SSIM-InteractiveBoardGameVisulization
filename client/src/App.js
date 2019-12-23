import React, { Component } from 'react';
import { Col, Row } from 'reactstrap';
import { Sigma, RandomizeNodePositions, RelativeSize, EdgeShapes, NodeShapes } from 'react-sigma';
import ForceLink from 'react-sigma/lib/ForceLink'
import axios from 'axios';

import './App.scss';

//var sigma = require("sigma-js");



class App extends Component {
    constructor(props) {    
        super(props);
        this.state = {
            searchName: "",
            previouslySearchedName: "",
            selectedSearch: "Algorithm 1",
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
        this.buildGraphAlgorithm1 = this.buildGraphAlgorithm1.bind(this);
        this.buildGraphAlgorithm2 = this.buildGraphAlgorithm2.bind(this);

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

        await axios.get('https://api.rawg.io/api/games?search="' + this.state.searchName + '"')
        .then((response) => {

            var items = response.data.results;

            var i = 0;
            while(i < items.length && i < 11)
            {
                this.state.searchItemsResults.push(items[i]);
                i++;
            }
        })
        .catch(err => {
            console.log(err);
            return null;
        });

        //TODO (if time is our friend): exclude DLCs from search results

        this.setState({ isLoading: false, searchNameWasSubmitted: true, previouslySearchedName: this.state.searchName });
    }


    //Receives item in Json form (I believe)
    async handleGraphNodeClick(event, item) {

        var id = "";
        if(event === null)
        {
            id = item.id;
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
        
        //query for specific item id to get info
        await axios.get('https://api.rawg.io/api/games/' + id)
        .then((response) => {

            let item = response.data;
            this.setState({ nodeClicked: item });
        })
        .catch(err => {
            console.log(err);
            return null;
        });

        this.setState({ isLoading: false, previousNodeClickedId: id });
    }


    /*async*/ buildGraph(item) {

        this.setState({ searchNameWasSubmitted: false, previouslySearchedName: "", previousNodeClickedId: "" });

        //If graph to be built is already built, simply show the searched game in the side bar and return
        if(item.id === this.state.gameIdPreviousGraphBuilt && this.state.selectedSearch === this.state.previouslySelectedSearch)
        {
            this.handleGraphNodeClick(null, item);
            return;
        }

        //this.setState({ isLoading: true, isGraphBuilt: false });
        //let myGraph = [];

        if(this.state.selectedSearch === "Algorithm 1")
        {
            console.log("Algorithm 1");
            /*myGraph = */this.buildGraphAlgorithm1(item);
        }
        else if(this.state.selectedSearch === "Algorithm 2")
        {
            console.log("Algorithm 2");
           /*myGraph = */this.buildGraphAlgorithm2(item);
        }
        else if(this.state.selectedSearch === "Algorithm 3")
        {
            console.log("Algorithm 3");
           /*myGraph = */this.buildGraphAlgorithm3(item);
        }

        //this.handleGraphNodeClick(null, item);

        //this.setState({ isLoading: false, graphJson: myGraph, isGraphBuilt: true, gameIdPreviousGraphBuilt: item.id, previouslySelectedSearch: this.state.selectedSearch });
    }


    async buildGraphAlgorithm1(item) {

        this.setState({ isLoading: true, isGraphBuilt: false });

        let myGraph = { nodes:[], edges:[] };       //Initialize graph variable
        let queryData = [];                         //Initialize variable that will hold the query response
              
        await axios.get('https://api.rawg.io/api/games/' + item.id + '/suggested?page_size=18')
            .then((response) => {

                queryData = response.data;          //queryData holds the related games to the main game
            })
            .catch(err => {
                console.log(err);
                return null;
            });

        if(queryData.results.length === 0)          //If there are no related games, alert user
        {
            alert("There are no related games for this game :(");
        }

        else                                        
        {
            let relatedGames = [];                                      //Initialize variable that will hold the games related to the main game

            myGraph.nodes.push({id:item.id, label:item.name});          //Push main game node to graph

            let i = 0;
            while(i < queryData.results.length)                         //Push all related games inside queryData.results to relatedGames variable
            {
                let eachGame = queryData.results[i];
                relatedGames.push(eachGame);
                i++;
            }
            
            //For each game related to the main game, add node and edges to graph (if unique) and process its own related games
            for(let j = 0; j < relatedGames.length; j++) 
            {
                let doesNodeExist = false;
                let doesEdgeExist = false;

                for(let m = 0; m < myGraph.nodes.length; m++)               //Seach all existent nodes
                {
                    if(relatedGames[j].id === myGraph.nodes[m].id)          //If current game's id matches an existing node's id, don't add node and process edges
                    {
                        for(let o = 0; o < myGraph.edges.length; o++)       //Search all existent edges
                        {
                            //If existing game node already has an edge connecting to main game, dont add edge
                            if(('e' + relatedGames[j].id + 'e' + item.id === myGraph.edges[o].id) || ('e' + item.id + 'e' + relatedGames[j].id === myGraph.edges[o].id))
                            {  
                                doesEdgeExist = true;
                                break;
                            }

                        }
                        if(!doesEdgeExist)      //Add edge
                        {
                            myGraph.edges.push({id: 'e' + item.id + 'e' + myGraph.nodes[m].id, source: item.id, target: myGraph.nodes[m].id, label: "SEES"});
                        }
                        doesNodeExist = true;
                        break;
                    }
                }

                if(!doesNodeExist)              //Add node and edge
                {
                    myGraph.nodes.push({id: relatedGames[j].id, label: relatedGames[j].name});
                    myGraph.edges.push({id: 'e' + item.id + 'e' + relatedGames[j].id, source: item.id, target: relatedGames[j].id, label: "SEES"});
                }

                let queryDataEachRelatedGame = [];                      //Initialize variable that will hold the query response    

                await axios.get('https://api.rawg.io/api/games/' + relatedGames[j].id + '/suggested?page_size=18')
                .then((response) => {

                    queryDataEachRelatedGame = response.data;           //queryDataEachRelatedGame holds the related games to each of the main game's related games
                })
                .catch(err => {
                    console.log(err);
                    return null;
                });

                let eachGameRelatedGames = [];                      //Initialize variable that will hold the games related to each of the main game's related games

                let k = 0;
                while(k < queryDataEachRelatedGame.results.length)  //Push all related games inside queryDataEachRelatedGame.results to eachGameRelatedGames variable
                { 
                    let eachGame = queryDataEachRelatedGame.results[k];
                    eachGameRelatedGames.push(eachGame);
                    k++;
                }

                //For each game related to the main game's related games, add node and edges to graph (if unique)
                for(let l = 0; l < eachGameRelatedGames.length; l++) 
                {
                    let doesNodeExistPhaseTwo = false;
                    let doesEdgeExistPhaseTwo = false;

                    for(let n = 0; n < myGraph.nodes.length; n++)        //Seach all existent nodes
                    {
                        if(eachGameRelatedGames[l].id === myGraph.nodes[n].id)  //If current game's id matches an existing node's id, don't add node and process edges
                        {
                            for(let p = 0; p < myGraph.edges.length; p++)   //Search all existing edges
                            {
                                //If existing game node already has an edge connecting to the current main game's related game, dont add edge
                                if(('e' + eachGameRelatedGames[l].id + 'e' + relatedGames[j].id === myGraph.edges[p].id) || ('e' + relatedGames[j].id + 'e' + eachGameRelatedGames[l].id === myGraph.edges[p].id))
                                {  
                                    doesEdgeExistPhaseTwo = true;
                                    break;
                                }
                            }
                            if(!doesEdgeExistPhaseTwo)      //Add edge
                            {
                                myGraph.edges.push({id: 'e' + relatedGames[j].id + 'e' + myGraph.nodes[n].id, source: relatedGames[j].id, target: myGraph.nodes[n].id, label: "SEES"});
                            }
                            doesNodeExistPhaseTwo = true;
                            break;
                        }
                    }
    
                    if(!doesNodeExistPhaseTwo)              //Add node and edge
                    {
                        myGraph.nodes.push({id: eachGameRelatedGames[l].id, label: eachGameRelatedGames[l].name});
                        myGraph.edges.push({id: 'e' + relatedGames[j].id + 'e' + eachGameRelatedGames[l].id, source: relatedGames[j].id, target: eachGameRelatedGames[l].id, label: "SEES"});   
                    }
                }
                

            }

            console.log("In Algorithm 1: Success!");
            //console.log(myGraph);
        }                

        this.handleGraphNodeClick(null, item);              //Show game on side bar

        this.setState({ isLoading: false, graphJson: myGraph, isGraphBuilt: true, gameIdPreviousGraphBuilt: item.id, previouslySelectedSearch: this.state.selectedSearch });
    }


    async buildGraphAlgorithm2(item) {
        // console.log([relatedGames[j],eachGameRelatedGames]);
        this.setState({ isLoading: true, isGraphBuilt: false });

        let myGraph = [];

        //TODO: Build the graph here  
        await axios.get('https://api.rawg.io/api/games/' + item.id + '/suggested?page_size=15')
            .then((response) => {
                
                //console.log(response.data);
            })
            .catch(err => {
                console.log(err);
                return null;
            });
          
            
        /*let*/ myGraph = {nodes:[], edges:[]};
        //let myGraph = {nodes:[{id:"1406", label:"Monopoly"}, {id:"1407", label:"Whatever"}], edges:[{id:"e1",source:"1406",target:"1407",label:"SEES"}]};

        //Just an example of a graph built out of the other searched results
        let items = this.state.searchItemsResults;

        //console.log(myGraph);

        for(let i = 0; i < items.length; i++)
        {
            myGraph.nodes.push({id:items[i].id, label:items[i].name});
            if(i !== 0)
            {
                myGraph.edges.push({id:'e' + items[i].id, source: items[0].id, target:items[i].id, label:"SEES"});
            }
        }
        

        //this.setState({ graphJson: myGraph })

        this.handleGraphNodeClick(null, item);

        this.setState({ isLoading: false, graphJson: myGraph, isGraphBuilt: true, gameIdPreviousGraphBuilt: item.id, previouslySelectedSearch: this.state.selectedSearch });

            
    }

    async buildGraphAlgorithm3(item) {

        this.setState({ isLoading: true, isGraphBuilt: false });

        let myGraph = { nodes:[], edges:[] };       //Initialize graph variable
        let queryData = [];                         //Initialize variable that will hold the query response
              
        await axios.get('https://api.rawg.io/api/games/' + item.id + '/suggested?page_size=18')
            .then((response) => {

                queryData = response.data;          //queryData holds the related games to the main game
            })
            .catch(err => {
                console.log(err);
                return null;
            });

        if(queryData.results.length === 0)          //If there are no related games, alert user
        {
            alert("There are no related games for this game :(");
        }

        else                                        
        {
            let relatedGames = [];                                      //Initialize variable that will hold the games related to the main game

            myGraph.nodes.push({id:item.id, label:item.name});          //Push main game node to graph

            let i = 0;
            while(i < queryData.results.length)                         //Push all related games inside queryData.results to relatedGames variable
            {
                let eachGame = queryData.results[i];
                relatedGames.push(eachGame);
                i++;
            }
            let allRelatedGames = [];
            //For each game related to the main game, add node and edges to graph (if unique) and process its own related games
            for(let j = 0; j < relatedGames.length; j++) 
            {
                let doesNodeExist = false;
                let doesEdgeExist = false;

                for(let m = 0; m < myGraph.nodes.length; m++)               //Seach all existent nodes
                {
                    if(relatedGames[j].id === myGraph.nodes[m].id)          //If current game's id matches an existing node's id, don't add node and process edges
                    {
                        for(let o = 0; o < myGraph.edges.length; o++)       //Search all existent edges
                        {
                            //If existing game node already has an edge connecting to main game, dont add edge
                            if(('e' + relatedGames[j].id + 'e' + item.id === myGraph.edges[o].id) || ('e' + item.id + 'e' + relatedGames[j].id === myGraph.edges[o].id))
                            {  
                                doesEdgeExist = true;
                                break;
                            }

                        }
                        if(!doesEdgeExist)      //Add edge
                        {
                            myGraph.edges.push({id: 'e' + item.id + 'e' + myGraph.nodes[m].id, source: item.id, target: myGraph.nodes[m].id, label: "SEES"});
                        }
                        doesNodeExist = true;
                        break;
                    }
                }

                if(!doesNodeExist)              //Add node and edge
                {
                    myGraph.nodes.push({id: relatedGames[j].id, label: relatedGames[j].name});
                    myGraph.edges.push({id: 'e' + item.id + 'e' + relatedGames[j].id, source: item.id, target: relatedGames[j].id, label: "SEES"});
                }

                let queryDataEachRelatedGame = [];                      //Initialize variable that will hold the query response    

                await axios.get('https://api.rawg.io/api/games/' + relatedGames[j].id + '/suggested?page_size=18')
                .then((response) => {

                    queryDataEachRelatedGame = response.data;           //queryDataEachRelatedGame holds the related games to each of the main game's related games
                })
                .catch(err => {
                    console.log(err);
                    return null;
                });

                let eachGameRelatedGames = [];                      //Initialize variable that will hold the games related to each of the main game's related games

                let k = 0;
                while(k < queryDataEachRelatedGame.results.length)  //Push all related games inside queryDataEachRelatedGame.results to eachGameRelatedGames variable
                { 
                    let eachGame = queryDataEachRelatedGame.results[k];
                    eachGameRelatedGames.push(eachGame);
                    k++;
                }
                allRelatedGames.push([relatedGames[j],eachGameRelatedGames]);
                //For each game related to the main game's related games, add node and edges to graph (if unique)
                for(let l = 0; l < eachGameRelatedGames.length; l++) 
                {
                    let doesNodeExistPhaseTwo = false;
                    let doesEdgeExistPhaseTwo = false;

                    for(let n = 0; n < myGraph.nodes.length; n++)        //Seach all existent nodes
                    {
                        if(eachGameRelatedGames[l].id === myGraph.nodes[n].id)  //If current game's id matches an existing node's id, don't add node and process edges
                        {
                            for(let p = 0; p < myGraph.edges.length; p++)   //Search all existing edges
                            {
                                //If existing game node already has an edge connecting to the current main game's related game, dont add edge
                                if(('e' + eachGameRelatedGames[l].id + 'e' + relatedGames[j].id === myGraph.edges[p].id) || ('e' + relatedGames[j].id + 'e' + eachGameRelatedGames[l].id === myGraph.edges[p].id))
                                {  
                                    doesEdgeExistPhaseTwo = true;
                                    break;
                                }
                            }
                            if(!doesEdgeExistPhaseTwo)      //Add edge
                            {
                                myGraph.edges.push({id: 'e' + relatedGames[j].id + 'e' + myGraph.nodes[n].id, source: relatedGames[j].id, target: myGraph.nodes[n].id, label: "SEES"});
                            }
                            doesNodeExistPhaseTwo = true;
                            break;
                        }
                    }
    
                    if(!doesNodeExistPhaseTwo)              //Add node and edge
                    {
                        myGraph.nodes.push({id: eachGameRelatedGames[l].id, label: eachGameRelatedGames[l].name});
                        myGraph.edges.push({id: 'e' + relatedGames[j].id + 'e' + eachGameRelatedGames[l].id, source: relatedGames[j].id, target: eachGameRelatedGames[l].id, label: "SEES"});   
                    }
                }
                

            }
            let jsonData = JSON.stringify(allRelatedGames);
            console.log(jsonData);
            axios
            .post('http://localhost:3001/gameSearch', { games:jsonData})
            .then((response) => console.log('Waiting for algorithm...' +response))
            .catch(err => {
              console.error(err);
            });

            console.log("In Algorithm 3: Success!");
            //console.log(myGraph);
        }                

        this.handleGraphNodeClick(null, item);              //Show game on side bar

        this.setState({ isLoading: false, graphJson: myGraph, isGraphBuilt: true, gameIdPreviousGraphBuilt: item.id, previouslySelectedSearch: this.state.selectedSearch });
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
                let gameRating = this.state.nodeClicked.rating;
                if(gameRating === 0)
                {
                    gameRating = " Not Rated Yet";
                }
                else 
                {
                    gameRating = ' ' + gameRating + '/ 5';
                }

                let gameName = this.state.nodeClicked.name;  

                let gameImage;
                let gameImageTag = this.state.nodeClicked.background_image;
                if(gameImageTag != null)
                {
                    gameImage = gameImageTag;
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
                            {gameRating}
                        </p>

                    </Row>  
                );
            }

            else if (this.state.nodeClicked === null && this.state.searchNameWasSubmitted) {
                return (
                    <Row id="nameSearchResults">
                        <ul>
                            { this.state.searchItemsResults.map(item => (
                                <li onClick={() => this.buildGraph(item)} key={item.id}> {item.name} </li>
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
                    <ForceLink easing="cubicInOut" gravity={2} nodeSiblingsAngleMin={1} /* this attracts nodes connected with edges of positive weight edgeWeightInfluence={2}*//>
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
                                            value="Algorithm 1"
                                            checked={this.state.selectedSearch === "Algorithm 1"}
                                            onChange={this.handleChangeSelect}
                                        />
                                        Algorithm 1
                                    </label>
                                    </li>
                                    
                                    <li>
                                        <label>
                                            <input
                                            type="radio"
                                            value="Algorithm 2"
                                            checked={this.state.selectedSearch === "Algorithm 2"}
                                            onChange={this.handleChangeSelect}
                                            />
                                            Algorithm 2
                                        </label>
                                    </li>

                                    <li>
                                        <label>
                                            <input
                                            type="radio"
                                            value="Algorithm 3"
                                            checked={this.state.selectedSearch === "Algorithm 3"}
                                            onChange={this.handleChangeSelect}
                                            />
                                            Algorithm 3
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

}
export default App;
