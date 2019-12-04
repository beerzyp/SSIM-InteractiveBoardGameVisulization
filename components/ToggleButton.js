/* eslint-disable no-unused-vars */
import React from 'react';

import './ToggleButton.scss';

const toggleButton = props => (
	<button className="toggle-button" onClick={props.click}>
		<div className="toggle-button__line" />
		<div className="toggle-button__line" />
		<div className="toggle-button__line" />
	</button>
);

export default toggleButton;