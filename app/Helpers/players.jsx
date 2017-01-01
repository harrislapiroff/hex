import R from 'ramda'

export const BLACK = 'black'
export const WHITE = 'white'
export const NONE = 'none'

/** Return the name of the other player */
export const otherPlayer = R.cond([
	[R.equals(WHITE), R.always(BLACK)],
	[R.equals(BLACK), R.always(WHITE)],
	[R.equals(NONE), R.identity],
])

export default { BLACK, WHITE, NONE, otherPlayer }
