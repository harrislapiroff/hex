/* global window */
import 'babel-polyfill'
import React from 'react'
import { render } from 'react-dom'
import Game from '~/Game'

import '~/styles'

render(
	<div className="container">
		<Game />
	</div>
, window.document.getElementById('app'))
