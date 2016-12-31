import React, { Component, PropTypes } from 'react'
import Hex from '~/Hex'

const TILE_RADIUS = 24
const TILE_HEIGHT = TILE_RADIUS * 2
const TILE_V_DISTANCE = (TILE_HEIGHT * 3) / 4
const TILE_WIDTH = Math.sqrt(3) * TILE_RADIUS
const TILE_H_DISTANCE = TILE_WIDTH

class Board extends Component {
	render() {
		const { data } = this.props
		// width of first row of tiles plus half a tile with for each additional row
		const boardWidth = (data[0].length * TILE_WIDTH) + ((data.length * TILE_WIDTH) / 2)
		// height of tile vert distance times number of rows plus a quarter tile height for the last bit
		const boardHeight = (data.length * TILE_V_DISTANCE) + (TILE_HEIGHT - TILE_V_DISTANCE)
		return (
			<svg
				width={boardWidth}
				height={boardHeight}
			>
				<g transform={`translate(0 ${(2 * TILE_V_DISTANCE) / 3})`}>
					{this.props.data.map((row, i) => (
						<g transform={`translate(${(TILE_H_DISTANCE * i) / 2} ${TILE_V_DISTANCE * i})`}>
							{row.map((cell, j) => (
								<Hex
									key={`${i}-${j}`}
									owner={cell}
									center={[(j * TILE_H_DISTANCE) + (TILE_WIDTH / 2), 0]}
									radius={TILE_RADIUS}
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
	data: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
}

export default Board
