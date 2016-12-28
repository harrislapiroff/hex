import R from 'ramda'
import React, { PropTypes } from 'react'

function Hex({
	owner,
	centerX,
	centerY,
	radius,
}) {

	const points = R.range(0, 6).map(i => {
		const angle = (Math.PI / 3) * i + (Math.PI / 6)
		return [
			radius * Math.cos(angle),
			radius * Math.sin(angle),
		]
	})

	const pathString = "M" + points.map(p => p.join(",")).join("L") + "Z"

	return (
		<g transform={`translate(${centerX} ${centerY})`}>
			<path
				d={pathString}
			/>
		</g>
	)
}


Hex.propTypes = {
	owner: PropTypes.number.isRequired,
	centerX: PropTypes.number.isRequired,
	centerY: PropTypes.number.isRequired,
	radius: PropTypes.number.isRequired,
}

export default Hex
