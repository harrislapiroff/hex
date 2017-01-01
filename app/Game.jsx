import React, { Component } from 'react'
import Board from '~/Board'
import players from '~/Helpers/players'

class Game extends Component {
	constructor(...args) {
		super(...args)

		const width = 14
		const height = 14
		const gameBoardRows = new Array(height)
		this.state = {
			data: gameBoardRows.fill().map(() => new Array(width).fill(players.NONE)),
			currentPlayer: players.WHITE,
		}

		this.handleTileClick = this.handleTileClick.bind(this)
	}

	handleTileClick(e) {
		const { row, column } = e.currentTarget.dataset
		const currentBoard = this.state.data
		const currentPlayer = this.state.currentPlayer
		// Make sure the clicked tile is unclaimed
		if (currentBoard[row][column] !== players.NONE) return
		currentBoard[row][column] = currentPlayer
		this.setState({
			data: currentBoard,
			currentPlayer: players.otherPlayer(currentPlayer),
		})
	}

	render() {
		return (
			<div>
				<p>
					<strong>Current Player:</strong>
					{this.state.currentPlayer}
				</p>
				<Board
					data={this.state.data}
					onTileClick={this.handleTileClick}
				/>
			</div>
		)
	}
}

export default Game
