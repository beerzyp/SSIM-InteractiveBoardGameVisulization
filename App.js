/* eslint-disable no-unused-vars */
import React, { Component } from 'react';
//import logo from './logo.svg';
import './App.css';

import Sidebar from './components/Sidebar';
//import Topbar from './components/Topbar';
import Backdrop from './components/Backdrop';



class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			sidebarOpen: false,
		};
	}

	render() {
		let sidebar;
		let backdrop;
		if (this.state.sidebarOpen) {
			sidebar = <Sidebar />;
			backdrop = <Backdrop click={this.backdropClickHandler} />;
		}
		
		return (
			<div>
				{sidebar}
				{backdrop}
				<Topbar clickHandler={this.toggleClickHandler} />
				<div style={{ overflowY: 'auto', height: '100%', paddingTop: '64px' }}>
                    Hello Hello
				</div>
                <script src="/reload/reload.js"></script> 
			</div>
		);
	}

}

export default App;
