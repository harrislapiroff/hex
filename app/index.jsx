/* global window */
import 'babel-polyfill'
import React from 'react'
import { render } from 'react-dom'

render(
	<div className="container">
		App
	</div>
, window.document.getElementById('app'))
