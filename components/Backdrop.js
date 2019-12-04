/* eslint-disable no-unused-vars */
import React from 'react';
import './Backdrop.scss';

const backdrop = props => (
	<div className="backdrop" onClick={props.click}></div>
);

export default backdrop;