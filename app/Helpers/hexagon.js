import R from 'ramda'

/**
 * Calculate the six points of a hexagon
 * @param center {number[]} 2-array coordinates
 * @param radius {number}
 * @returns {array[number[]]}
 */
export const hexagonPoints = R.memoize((center, radius) => {
	return R.range(0, 6).map(i => {
		const angle = (Math.PI / 3) * i + (Math.PI / 6)
		return [
			radius * Math.cos(angle),
			radius * Math.sin(angle),
		]
	})
})

/**
 * Calculate the SVG path or a hexagon
 * @param center {number[]} 2-array coordinates
 * @param radius {number}
 * @returns {string}
 */
export const hexagonPath = R.memoize((center, radius) => {
	const points = hexagonPoints(center, radius)
	return "M" + points.map(p => p.join(",")).join("L") + "Z"
})
