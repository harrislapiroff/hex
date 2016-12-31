import React, { PropTypes } from 'react'

import { hexagonPath } from '~/Helpers/hexagon'

function Hex({
	owner,
	center,
	radius,
}) {

	const pathString = hexagonPath([0, 0], radius)
	return (
		<g transform={`translate(${center[0]} ${center[1]})`}>
			<path
				d={pathString}
			/>
		</g>
	)
}


Hex.propTypes = {
	owner: PropTypes.number.isRequired,
	center: PropTypes.arrayOf(PropTypes.number).isRequired,
	radius: PropTypes.number.isRequired,
}

export default Hex
