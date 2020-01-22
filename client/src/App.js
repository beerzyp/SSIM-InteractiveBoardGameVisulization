import React, { Component } from 'react';
import { Col, Row } from 'reactstrap';
import { Sigma, RandomizeNodePositions, EdgeShapes, NodeShapes, RelativeSize } from 'react-sigma';
import ForceLink from 'react-sigma/lib/ForceLink';
import ForceAtlas2 from 'react-sigma/lib/ForceAtlas2';
import axios from 'axios';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormLabel from '@material-ui/core/FormLabel';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import SearchOutlinedIcon from '@material-ui/icons/SearchOutlined';
import MultiSearchSelect from "react-search-multi-select";
import Typography from '@material-ui/core/Typography';
import Slider from '@material-ui/core/Slider';
import update from 'immutability-helper';
import './App.scss';

//var sigma = require("sigma-js");
const useStyles = makeStyles({
    root: {
      flexGrow: 1,
    },
  });

export function CenteredTabs() {
    const [setValue] = React.useState(0);
    
    const handleChange = (event, newValue) => {
        setValue(newValue);
    };
}

export function RadioButtonsGroup() {
    const [setValue] = React.useState('algorithm1');
  
    const handleChange = event => {
      setValue(event.target.value);
    };
}



class App extends Component {
    constructor(props) {    
        super(props);
        this.state = {
            searchName: "",
            previouslySearchedName: "",
            selectedSearch: "Algorithm 1",
            selectedLayout: "Force Atlas 2",
            previouslySelectedSearch: null,
            searchNameWasSubmitted: false,
            searchItemsResults: [],
            isLoading: false,
            nodeClicked: null,
            previousNodeClickedId: "",
            graphJson: null,
            isGraphBuilt: false,
            gameIdPreviousGraphBuilt: "",
            numberOfGames: 18,
            selectedCategories: "action,indie,adventure,role-playing-games-rpg,shooter, strategy, casual, simulation, arcade, puzzle, platformer,racing, sports, massively-multiplayer, family, fighting, board-games,educational, card",
        };
        this.search = this.search.bind(this);
        this.handleChangeSearch = this.handleChangeSearch.bind(this);
        this.handleChangeAlgoSelect = this.handleChangeAlgoSelect.bind(this);
        this.handleChangeLayoutSelect = this.handleChangeLayoutSelect.bind(this);
        this.handleChangeNumOfGames = this.handleChangeNumOfGames.bind(this);
        this.handleChangeCategorySelect = this.handleChangeCategorySelect.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);

        this.getNodeSize = this.getNodeSize.bind(this);
        this.getNodeColor = this.getNodeColor.bind(this);

        this.handleGraphNodeClick = this.handleGraphNodeClick.bind(this);
        this.buildGraph = this.buildGraph.bind(this);
        this.buildGraphAlgorithm1 = this.buildGraphAlgorithm1.bind(this);
        this.buildGraphAlgorithm2 = this.buildGraphAlgorithm2.bind(this);

        this.displaySideBarInformation = this.displaySideBarInformation.bind(this);
        this.displayGraph = this.displayGraph.bind(this);
    }

    search(){
        if(this.state.selectedSearch === 'Algorithm 1') this.buildGraphAlgorithm1(this.state.nodeClicked);
        else this.buildGraphAlgorithm2(this.state.nodeClicked);
    }
    handleChangeSearch(event) {
        this.setState({ searchName: event.target.value });
    }


    handleChangeAlgoSelect(event) {
        this.setState({ selectedSearch: event.target.value });
    }

    handleChangeLayoutSelect(event) {
        this.setState({ selectedLayout: event.target.value });
    }

    handleChangeNumOfGames(event) {
        this.setState({ numberOfGames: parseInt(event.target.innerText)});
    }

    handleChangeCategorySelect(array){
        if(array !== undefined && array.length != 0) {
            this.state.selectedCategories = array;
        }
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


    getNodeColor(item) {
        let itemRating = item.rating;   
        if(itemRating >= 0 && itemRating <= 1.5)
        {
            return '#acfa88';
        }
        else if(itemRating <= 2.5)
        {
            return '#fafd2d';
        }
        else if(itemRating <= 3.5)
        {
            return '#ffd900';
        }
        else if (itemRating <= 4.25)
        {
            return '#ff9114';
        }
        else
        {
            return '#ff3300';
        }
    }


    getNodeSize(item) {

        let totalRatings = item.reviews_count;

        if(totalRatings < 200)
        {
            return 50;
        }
        else
        {
            let sizeFormula = Math.floor(totalRatings/4);
            return sizeFormula;
        }
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

        //If graph to be built is already built, simply show the searched game in the side bar and return (Ignoring this step, for now)
        /*
        if(item.id === this.state.gameIdPreviousGraphBuilt && this.state.selectedSearch === this.state.previouslySelectedSearch)
        {
            this.handleGraphNodeClick(null, item);
            return;
        }
        */

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

        //this.handleGraphNodeClick(null, item);

        //this.setState({ isLoading: false, graphJson: myGraph, isGraphBuilt: true, gameIdPreviousGraphBuilt: item.id, previouslySelectedSearch: this.state.selectedSearch });
    }


    async buildGraphAlgorithm1(item) {

        this.setState({ isLoading: true, isGraphBuilt: false });

        let myGraph = { nodes:[], edges:[] };       //Initialize graph variable
        let queryData = [];                         //Initialize variable that will hold the query response
        console.log(this.state.numberOfGames);
        await axios.get('https://api.rawg.io/api/games/' + item.id + '/suggested?page_size=' + this.state.numberOfGames)
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

            let mainNodeSize = this.getNodeSize(item);
            myGraph.nodes.push({id:item.id, label:item.name, color: 'black', size: mainNodeSize, category:item.genres});          //Push main game node to graph

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
                            myGraph.edges.push({id: 'e' + item.id + 'e' + myGraph.nodes[m].id, source: item.id, target: myGraph.nodes[m].id, label: "SEES", color: '#e4e4e4'/*, weight: 4*/});
                        }
                        doesNodeExist = true;
                        break;
                    }
                }

                if(!doesNodeExist)              //Add node and edge
                {
                    let eachNodeSize = this.getNodeSize(relatedGames[j]);
                    let eachNodeColor = this.getNodeColor(relatedGames[j]);
                    myGraph.nodes.push({id: relatedGames[j].id, label: relatedGames[j].name, size: eachNodeSize, color: eachNodeColor, category:item.genres});
                    myGraph.edges.push({id: 'e' + item.id + 'e' + relatedGames[j].id, source: item.id, target: relatedGames[j].id, label: "SEES", color: '#e4e4e4'/*, weight: 4*/});
                }

                let queryDataEachRelatedGame = [];                      //Initialize variable that will hold the query response    

                await axios.get('https://api.rawg.io/api/games/' + relatedGames[j].id + '/suggested?page_size=' + this.state.numberOfGames)
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
                                myGraph.edges.push({id: 'e' + relatedGames[j].id + 'e' + myGraph.nodes[n].id, source: relatedGames[j].id, target: myGraph.nodes[n].id, label: "SEES", color: '#e4e4e4'/*, weight: -1*/});
                            }
                            doesNodeExistPhaseTwo = true;
                            break;
                        }
                    }
    
                    if(!doesNodeExistPhaseTwo)              //Add node and edge
                    {
                        let eachNodeSize = this.getNodeSize(eachGameRelatedGames[l]);
                        let eachNodeColor = this.getNodeColor(eachGameRelatedGames[l]);
                        myGraph.nodes.push({id: eachGameRelatedGames[l].id, label: eachGameRelatedGames[l].name, size: eachNodeSize, color: eachNodeColor, category:item.genres});
                        myGraph.edges.push({id: 'e' + relatedGames[j].id + 'e' + eachGameRelatedGames[l].id, source: relatedGames[j].id, target: eachGameRelatedGames[l].id, label: "SEES", color: '#e4e4e4'/*, weight: -1*/});   
                    }
                }
                

            }

            console.log("In Algorithm 1: Success!");
            //console.log(myGraph);
        }    
        

        this.handleGraphNodeClick(null, item);              //Show game on side bar

        this.setState({ isLoading: false, graphJson: myGraph, isGraphBuilt: true, gameIdPreviousGraphBuilt: item.id, previouslySelectedSearch: this.state.selectedSearch, displayAlgorithm:'default' });
    }

    async buildGraphAlgorithm2(item) {

        this.setState({ isLoading: true, isGraphBuilt: false });

        let myGraph = { nodes:[], edges:[] };       //Initialize graph variable
        let queryData = [];                         //Initialize variable that will hold the query response
        console.log(this.state.numberOfGames);
        await axios.get('https://api.rawg.io/api/games/' + item.id + '/suggested?page_size=' + this.state.numberOfGames)
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

            myGraph.nodes.push({id:item.id, label:item.name, category:item.genres});          //Push main game node to graph

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
                let queryDataEachRelatedGame = [];                      //Initialize variable that will hold the query response    
    
                await axios.get('https://api.rawg.io/api/games/' + relatedGames[j].id + '/suggested?page_size=' + this.state.numberOfGames)
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
            }

            let jsonData = JSON.stringify(allRelatedGames);
            let relatedDistances;
            await axios
            .post('http://localhost:3001/gameSearch', { games:jsonData})
            .then((response) => {
                console.log(response.data);
                relatedDistances = eval(`[${response.data.join()}]`);
            }) 
            .catch(err => {
                console.error(err);
            });
            console.log(relatedDistances);
            console.log(allRelatedGames);
            //For each game related to the main game, add node and edges to graph (if unique) and process its own related games
            console.log(item.name);
            for(let j = 0; j < allRelatedGames.length; j++) 
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
                            myGraph.edges.push({id: 'e' + item.id + 'e' + myGraph.nodes[m].id, source: item.id, target: myGraph.nodes[m].id, label: "SEES", weight:0});
                        }
                        doesNodeExist = true;
                        break;
                    }
                }

                if(!doesNodeExist)              //Add node and edge
                {
                    let eachNodeSize = this.getNodeSize(relatedGames[j]);
                    let eachNodeColor = this.getNodeColor(relatedGames[j]);
                    myGraph.nodes.push({id: relatedGames[j].id, label: relatedGames[j].name, size:eachNodeSize, color:eachNodeColor, category:item.genres});
                    myGraph.edges.push({id: 'e' + item.id + 'e' + relatedGames[j].id, source: item.id, target: relatedGames[j].id, label: "SEES",weight:1});
                }

                let eachGameRelatedGames = [];                      //Initialize variable that will hold the games related to each of the main game's related games
                const related_games = allRelatedGames[j][1];
                let k = 0;
                while(k < related_games.length)  //Push all related games inside queryDataEachRelatedGame.results to eachGameRelatedGames variable
                { 
                    let eachGame = related_games[k];
                    eachGameRelatedGames.push(eachGame);
                    k++;
                }
                let cluster_distance = [];
                if(typeof relatedDistances[j] === 'undefined') {
                    cluster_distance = Array(related_games.length).fill(1.0)
                }
                else cluster_distance = relatedDistances[j];
                console.log("j " + j + " " +cluster_distance);
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
                        console.log(cluster_distance);
                        let cluster_distance_ajusted;
                        if(cluster_distance[l+1] < 1)
                            cluster_distance_ajusted = (1- cluster_distance[l+1]) + 1; 
                        //this is just a conversion so that normalized weights fit well in the graph, might need to be dynami for bigger graphs
                        else cluster_distance_ajusted = cluster_distance[l+1];
                        console.log(eachGameRelatedGames[l].name + " distance: " + cluster_distance[l+1]);
                        console.log("ajudsted distance:" + cluster_distance_ajusted)
                        let eachNodeSize = this.getNodeSize(relatedGames[l]);
                        let eachNodeColor = this.getNodeColor(relatedGames[l]);
                        myGraph.nodes.push({id: eachGameRelatedGames[l].id, label: eachGameRelatedGames[l].name, size:eachNodeSize, color:eachNodeColor, category:item.genres});
                        myGraph.edges.push({id: 'e' + relatedGames[j].id + 'e' + eachGameRelatedGames[l].id, source: relatedGames[j].id, target: eachGameRelatedGames[l].id, label: "SEES", weight:cluster_distance_ajusted});   
                    }
                }
                
            }
            console.log("In Algorithm 2: Success!");
        }                

        this.handleGraphNodeClick(null, item);              //Show game on side bar

        this.setState({ isLoading: false, graphJson: myGraph, isGraphBuilt: true, gameIdPreviousGraphBuilt: item.id, previouslySelectedSearch: this.state.selectedSearch, displayAlgorithm:'forcelink_distances' });
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
                        <button type="submit" onClick={ this.search }><h4> { gameName } </h4></button>
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


    selectCategories(){
        let filteredJson = this.state.graphJson.nodes;
        let mostCommon = [];
        for (let index = filteredJson.length-1; index >= 0; index--) {
            let includes = false;
            const categories = filteredJson[index].category;
            for (let idx = 0; idx < categories.length; idx++) {
                mostCommon.push(categories[idx].name.toLowerCase());
                if(this.state.selectedCategories.includes(categories[idx].name.toLowerCase())) {
                    includes = true;
                    break;
                }
                
            }
            if(!includes) {
                 filteredJson.splice(index, 1);
            }
        }
        if(filteredJson.length < 2) {
            let mostFrequentElement = mostCommon[0];
            if(mostFrequentElement!==undefined)
                alert("No data for your filters, try choosing the genre " + mostFrequentElement + "...");
        }
    }
    displayGraph() {
        const angle = Math.PI/3;
        if(this.state.isGraphBuilt) {
            if(this.state.selectedLayout === 'Force Atlas 2')
            {
                this.selectCategories();
                return (
                    <Sigma id="sigmaGraph" style={{ width:"100%", height:"100%" }} onClickNode={this.handleGraphNodeClick} graph={this.state.graphJson} settings={{ drawEdges: true, clone: false }}>
                    <RelativeSize initialSize={1}/>
                    <RandomizeNodePositions/>                   
                    <ForceAtlas2 easing="cubicInOut" gravity={2} /* this attracts nodes connected with edges of positive weight*/ edgeWeightInfluence={4}/>
                </Sigma>
                )
            }
            else if(this.state.selectedLayout === 'Force Link')
            {
                this.selectCategories();
                return (
                    <Sigma id="sigmaGraph" style={{ width:"100%", height:"100%" }} onClickNode={this.handleGraphNodeClick} graph={this.state.graphJson} settings={{drawEdges: true, clone: false}}>
                        <RelativeSize initialSize={1}/>
                        <RandomizeNodePositions/>
                        <ForceLink nodeSiblingsAngleMin={angle} edgeWeightInfluence={2}/* this attracts nodes connected with edges of positive weight edgeWeightInfluence={2}*//>
                    </Sigma>
                )
            }
        }
    }

    /*
        Runs on every page update, to scroll down
    */
    componentDidUpdate(){
        this.refs.scrolldown.scrollIntoView();
    }

    render() {
        const categories = [
            'action','indie','adventure','role-playing-games-rpg',
        'shooter', 'strategy', 'casual', 'simulation', 'arcade', 'puzzle', 'platformer',
        'racing', 'sports', 'massively-multiplayer', 'family', 'fighting', 'board-games',
        'educational', 'card'
        ];
        return (
            <div id="containerDiv" ref="wrap">
                <Col id="sideBar">
                    <header>
                        Video Game Network
                    </header>
                    <br></br>
                        <form onSubmit={this.handleSubmit}>
                            <FormLabel component="legend">Graph Layout 
                                <Button>
                                    <InfoOutlinedIcon className="info" />
                                </Button>
                            </FormLabel>
                            <RadioGroup aria-label="Graph Layout" name="graphlayout" value={RadioButtonsGroup.value} onChange={RadioButtonsGroup.handleChange}>
                                <FormControlLabel className="formlab" value="Force Atlas 2" control={<Radio />} label="Force Atlas 2" onChange={this.handleChangeLayoutSelect} />
                                <FormControlLabel className="formlab" value="Force Link" control={<Radio />} label="Force Link" onChange={this.handleChangeLayoutSelect} />
                            </RadioGroup>
                            <FormLabel component="legend">Algorithm
                                <Button>
                                    <InfoOutlinedIcon className="info" />
                                </Button>
                            </FormLabel>
                            <RadioGroup aria-label="Algorithm" name="algorithm" value={RadioButtonsGroup.value} onChange={RadioButtonsGroup.handleChange}>
                                <FormControlLabel className="formlab" value="Algorithm 1" control={<Radio />} label="Algorithm 1" onChange={this.handleChangeAlgoSelect} />
                                <FormControlLabel className="formlab" value="Algorithm 2" control={<Radio />} label="Algorithm 2" onChange={this.handleChangeAlgoSelect} />
                            </RadioGroup>
                            <div className="optionsfilter" style={{display: 'inline-block', width: 'fit-content'}}>
                                <br></br>
                                
                                <FormLabel component="legend">
                                    Number Of Games
                            </FormLabel>        
                                <Slider
                                    defaultValue={18}
                                    aria-labelledby="discrete-slider"
                                    valueLabelDisplay="auto"
                                    step={10}
                                    marks
                                    min={18}
                                    max={60}
                                    onChange={this.handleChangeNumOfGames}
                                />

                                <FormLabel component="legend">Genres
                                </FormLabel>
                                    <MultiSearchSelect searchable={true} showTags={true} multiSelect={true} onSelect={this.handleChangeCategorySelect} options={categories}/>
                                <br></br>
                            </div>
                            <TextField id="standard-basic" label="Game" value={this.state.searchName}  onChange={this.handleChangeSearch}/>
                            <Button variant="contained" type="submit">Submit</Button>

                        </form>
                    {this.displaySideBarInformation()}

                </Col> 

                <Col id="sigmaCol">

                    {this.displayGraph()}

                </Col>
            <div ref="scrolldown"></div>
            </div>
        );
    }

}
export default App;
