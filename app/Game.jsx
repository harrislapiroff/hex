import React, { Component } from 'react'
import Board from '~/Board'
import players from '~/Helpers/players'

class Game extends Component {
	constructor(...args) {
		super(...args)
		const width = 14
		const height = 14
		const gameBoard = new Array(height)
		this.state = {
			data: gameBoard.fill().map(x => new Array(width).fill(0)),
			currentPlayer: players.WHITE,
		}
	}

	render() {
		return (
			<Board
				data={this.state.data}
			/>
		)
	}
}

export default Game
