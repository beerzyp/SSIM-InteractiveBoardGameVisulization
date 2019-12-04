/* eslint-disable no-unused-vars */
import { NavItem, NavLink } from 'reactstrap';
import { TiEdit, TiHomeOutline } from 'react-icons/ti';
import { GoCalendar } from 'react-icons/go';
import { FiLayout, FiSidebar, FiUsers, FiCopy, FiCheckSquare, FiFolder } from 'react-icons/fi';

import React from 'react';

import './Sidebar.scss';

const sidebar = props => {
	let availIcons = [];
	availIcons['TiEdit'] = TiEdit;
	availIcons['TiHomeOutline'] = TiHomeOutline;
	availIcons['GoCalendar'] = GoCalendar;
	availIcons['FiLayout'] = FiLayout;
	availIcons['FiSidebar'] = FiSidebar;
	availIcons['FiUsers'] = FiUsers;
	availIcons['FiCopy'] = FiCopy;
	availIcons['FiCheckSquare'] = FiCheckSquare;
	availIcons['FiFolder'] = FiFolder;

	return (
		<nav className="side-drawer">
			<ul style={{ paddingTop: '70px' }}>
				<NavItem>
					<NavLink className="d-flex align-items-center " href="/">
						<span><TiHomeOutline /> Home</span>
					</NavLink>
				</NavItem>
				
				<NavItem>
					<NavLink className="d-flex align-items-center " href="/contacts">
						<span><TiHomeOutline /> Contacts</span>
					</NavLink>
				</NavItem>
			</ul>
		</nav>
	);
};
export default sidebar;
