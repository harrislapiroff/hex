import React, { PropTypes } from 'react'

import { hexagonPath } from '~/Helpers/hexagon'

import '~/Hex/styles'

function Hex({
	onClick,
	owner,
	center,
	radius,
	...passThruProps
}) {
	const strokeHexagon = hexagonPath([0, 0], radius - 4)
	const fillHexagon = hexagonPath([0, 0], radius - 4.5)
	return (
		<g
			className="tile"
			transform={`translate(${center[0]} ${center[1]})`}
			onClick={onClick}
			{...passThruProps}
		>
			<path
				className={`tile__stroke tile__stroke-is-claimed-by-${owner}`}
				d={fillHexagon}
			/>
			<path
				className={`tile__fill tile__fill-is-claimed-by-${owner}`}
				d={strokeHexagon}
			/>
		</g>
	)
}


Hex.propTypes = {
	onClick: PropTypes.func,
	owner: PropTypes.string,
	center: PropTypes.arrayOf(PropTypes.number).isRequired,
	radius: PropTypes.number.isRequired,
}

Hex.defaultProps = {
	onClick: () => {},
	owner: 'none',
}

export default Hex
