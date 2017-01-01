import React, { Component, PropTypes } from 'react'
import Hex from '~/Hex'
import players from '~/Helpers/players'

const TILE_RADIUS = 24
const TILE_HEIGHT = TILE_RADIUS * 2
const TILE_V_DISTANCE = (TILE_HEIGHT * 3) / 4
const TILE_WIDTH = Math.sqrt(3) * TILE_RADIUS
const TILE_H_DISTANCE = TILE_WIDTH

class Board extends Component {
	constructor(...args) {
		super(...args)
		this.state = {
			selectedTile: null,
		}
	}

	render() {
		const { data, onTileClick } = this.props
		// width of first row of tiles plus half a tile with for each additional row
		const boardWidth = (data[0].length * TILE_WIDTH) + ((data.length * TILE_WIDTH) / 2)
		// height of tile vert distance times number of rows plus a quarter tile height for the last bit
		const boardHeight = (data.length * TILE_V_DISTANCE) + (TILE_HEIGHT - TILE_V_DISTANCE)
		return (
			<svg
				width={boardWidth}
				height={boardHeight}
				viewBox={`0 0 ${boardWidth} ${boardHeight}`}
			>
				<g transform={`translate(0 ${(2 * TILE_V_DISTANCE) / 3})`}>
					{this.props.data.map((row, i) => (
						<g
							key={`row-${i}`}
							transform={`translate(${(TILE_H_DISTANCE * i) / 2} ${TILE_V_DISTANCE * i})`}
						>
							{row.map((cell, j) => (
								<Hex
									key={`cell-${i}-${j}`}
									data-row={i}
									data-column={j}
									owner={cell}
									center={[(j * TILE_H_DISTANCE) + (TILE_WIDTH / 2), 0]}
									radius={TILE_RADIUS}
									onClick={cell === players.NONE ? onTileClick : null}
								/>
							))}
						</g>
					))}
				</g>
			</svg>
		)
	}
}

Board.propTypes = {
	data: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)),
	onTileClick: PropTypes.func,
}

Board.defaultProps = {
	data: [],
	onTileClick: () => {},
}

export default Board
