(function () {
	"use strict";

	var hex = window.hex = {},
		log = function () {
				if (hex.settings.LOGGING_ON) console.log.apply(console, arguments);
			},
		init = function () {
				hex.paper = Raphael(0, 0, 1000, 600);
				hex.game = Game();
			};

	hex.settings = {
			'TILE_EDGE': 20,
			'TILE_GUTTER': 4,
			'TILE_STYLES': {"fill": "#FFF", "fill-opacity":".25", "stroke": "#FFF", "stroke-opacity": .35, "stroke-width": 1},
			'TILE_HOVER_STYLES': {
				'p1': {"fill-opacity": .75, "stroke-opacity": .75},
				'p2': {"fill-opacity": .75, "stroke-opacity": .75, "fill": "#000", "stroke": "#000"}
			},
			'TILE_OCCUPIED_STYLES': {
				'p1': {"fill": "#FFF", "fill-opacity": 1, "stroke": "#FFF", "stroke-opacity": 1},
				'p2': {"fill": "#000", "fill-opacity": 1, "stroke": "#000", "stroke-opacity": 1}
			},
			'DEFAULT_ANIMATION_SPEED': 250,
			'LOGGING_ON': "console" in window, // logging is on if a console exists
			'BOARD_SIZE': 14
		}

	// Objects

	var Tile = hex.Tile,
		Grid = hex.Grid,
		Hexagon = hex.Hexagon,
		Player = hex.Player,
		Game = hex.Game;

	// Utilities

	var	getter = function (attr) {
				return function () { return this[attr]; };
			},
		setter = function (attr) {
				return function (value) { this[attr] = value; };
			},
		getter_setter = function (attr) {
				return function (value) {
					if (typeof(value) === "undefined") return this[attr];
					this[attr] = value;
				};
			};


	/**************************************************
	* Hexagon                                         *
	**************************************************/

	Hexagon = function (x, y, c, attrs) {
			if (!(this instanceof Hexagon)) return new Hexagon(x, y, c, attrs);
			this._x = x;
			this._y = y;
			this._c = c;
			this._attrs = attrs;
			this.draw();
		};
	Hexagon.prototype.draw = function () {
			// http://www.rdwarf.com/lerickson/hex/ was instructive
			var c = this._c,
				x = this._x,
				y = this._y,
				a = .5 * c,
				b = Math.sin(Math.PI/3) * c,
				points, pathstring;
				points = [
					(x) + " " + (y + a + c),
					(x) + " " + (y + a),
					(x + b) + " " + (y),
					(x + 2 * b) + " " + (y + a),
					(x + 2 * b) + " " + (y + a + c),
					(x + b) + " " + (y + 2 * c)
				];
			pathstring = "M" + points.join("L") + "Z";
			this._el = hex.paper.path(pathstring).attr(this._attrs);
		};
	Hexagon.prototype.element = getter('_el')


	/**************************************************
	* Tile                                            *
	**************************************************/

	Tile = function (x, y, c, coords, grid) { // c is side length of the hexagon in pixels
			if (!(this instanceof Tile)) return new Tile(x, y, c, coords, grid);
			this._x = x;
			this._y = y;
			this._c = c;
			this._coords = coords;
			this._grid = grid;
			this._owner = null;
			this.draw();
		};
	Tile.prototype.adjacents = function () {
			/* Tile (x, y) is adjacent to tiles:
			 * (x, y-1)
			 * (x+1, y-1)
			 * (x-1, y)
			 * (x+1, y)
			 * (x-1, y+1)
			 * (x, y+1)
			 */
			var grid = this._grid,
				x = this._coords[0],
				y = this._coords[1];
			return [
				grid.tile(x, y-1),
				grid.tile(x+1, y-1),
				grid.tile(x-1, y),
				grid.tile(x+1, y),
				grid.tile(x-1, y+1),
				grid.tile(x, y+1)
			];
		};
	Tile.prototype.grid = getter("_grid");
	Tile.prototype.coords = getter("_coords");
	Tile.prototype.draw = function () {
			var tile = this; // we need this for use within event-bound functions
			this._hex = Hexagon(this._x, this._y, this._c, hex.settings.TILE_STYLES)
			// add hover effects
			this._hex.element().hover(function () {
				if (tile.is_occupied()) return; // only if the tile is not occupied
				// TODO: network version will also need to check if this is current player's computer
				var current_player = hex.game.current_player();
				this.animate(hex.settings.TILE_HOVER_STYLES[current_player.slug()], hex.settings.DEFAULT_ANIMATION_SPEED)
			}, function () {
				if (tile.is_occupied()) return; // only if the tile is not occupies
				// TODO: network version will also need to check if this is current player's computer
				this.animate(hex.settings.TILE_STYLES, hex.settings.DEFAULT_ANIMATION_SPEED)
			});
			// add click event
			this._hex.element().click(function () {
				if (tile.is_occupied()) return; // only if the tile is not occupied
				// TODO: network version will also need to check if this is current player's computer
				tile.occupy(hex.game.current_player());
				hex.game.next_move();
			});
		};
	Tile.prototype.hexagon = getter('_hex');
	Tile.prototype.is_occupied = function () {
			if (this._owner !== null) return true;
			return false;
		};
	Tile.prototype.occupy = function (player) {
			this._owner = player;
			this._hex.element().animate(hex.settings.TILE_OCCUPIED_STYLES[player.slug()], hex.settings.DEFAULT_ANIMATION_SPEED);
			log(player.name() + " claimed tile (" + this.coords()[0] + ", " + this.coords()[1] + ")")
		}
	Tile.prototype.reset = function () {
			this._owner = null;
			this._hex.element().animate(hex.settings.TILE_STYLES, hex.settings.DEFAULT_ANIMATION_SPEED);
		}
	Tile.prototype.owner = getter("_owner");


	/**************************************************
	* Grid                                            *
	**************************************************/

	Grid = function (n) { // creates an n x n grid of tiles
			if (!(this instanceof Grid)) return new Grid(n);
			this._n = n;
			this._tiles = [];
			this._coords = [];
			this.populate();
		}
	Grid.prototype.populate = function () {
			var tile,
				n = this._n,
				w = hex.settings.TILE_EDGE,
				grid_spacing = hex.settings.TILE_GUTTER,
				spacing_horizontal = 0.866 * 2 * w,
				spacing_vertical = w * 1.5,
				stagger_horizontal = 0.866 * w,
				x, y;
			for (var i = 0; i < n; i++) { // row loop
				x = i * stagger_horizontal;
				y = i * spacing_vertical;
				for (var j = 0; j < n; j++) { // column loop
					if (i == 0) this._coords[j] = [] // create a column array if this is the first row
					tile = Tile(x + grid_spacing/2, y +grid_spacing/2, w - grid_spacing, [j, i], this);
					this._tiles.push(tile); // add the tile to the unsorted list
					this._coords[j][i] = tile; // add the tile to the coordinate multi-array
					x = x + spacing_horizontal;
				};
			};
			// TODO: should also draw colored borders along the edges of the board to indicate which side belongs to which playger
		}
	Grid.prototype.reset = function () {
			var tiles = this._tiles;
			for (var i = 0, l = tiles.length; i < l; i++) {
				tiles[i].reset();
			}
		}
	Grid.prototype.tile = function (x, y) {
			// First check if the coords are out of bounds and return an appropriate string
			var n = this._n;
			if (x < 0 & y < 0) return "TL CORNER"; // no such thing, but whatever
			if (x < 0 & y >= n) return "BL CORNER";
			if (x >= n & y < 0) return "TR CORNER";
			if (x >= n & y >= n) return "BR CORNER"; // no such thing, but whatever
			if (x < 0) return "L EDGE";
			if (x >= n) return "R EDGE";
			if (y < 0) return "T EDGE";
			if (y >= n) return "B EDGE";
			return this._coords[x][y];
		}


	/**************************************************
	* Player                                          *
	**************************************************/

	Player = function (name, slug) { // creates an n x n grid of tiles
			if (!(this instanceof Player)) return new Player(name, slug);
			this._name = name;
			this._slug = slug;
		}
	Player.prototype.name = getter("_name");
	Player.prototype.slug = getter("_slug");


	/**************************************************
	* Game                                            *
	**************************************************/	

	Game = function () {
			if (!(this instanceof Game)) return new Game();
			this._players = [Player('Player 1', 'p1'), Player('Player 2', 'p2')];
			this._grid = Grid(hex.settings.BOARD_SIZE);
			this._current_player_idx = 0;
		};
	Game.prototype.current_player = function () {
			return this._players[this._current_player_idx];
		};
	Game.prototype.next_move = function () {
			// Check victory for the player who just played
			// TODO: we don't need to check for victory if the number of moves is smaller than the board size
			if (this.victory_check(this.current_player())) {
				// This needs to be a nicer victory screen.
				alert("Victory to " + this.current_player().name());
				this.reset()
				return;
			}
			// TODO: add an opportunity to switch positions after first move
			// move on to the next player
			this._current_player_idx = (this._current_player_idx + 1) % this._players.length
			// can't imagine why there'd ever be anything other than 2 players, but let's be flexible
		};
	Game.prototype.reset = function () {
			this._grid.reset();
		};
	Game.prototype.players = getter('_players');
	Game.prototype.victory_check = function (player) {
			// checked tiles needs to be defined outside the check_tiles function so we don't overwrite it each time we recurse through check_tiles.
			var checked_tiles = [],
				direction = (player.slug() === "p1") ? "HORIZONTAL" : "VERTICAL",
				check_tiles = function (list) {
						// for each tile, either check if it is an end tile or check through adjacent tiles
						for (var i = 0, l = list.length; i < l; i++) {
							var tile = list[i], tile_coords, tile_slug;

							// if it's not a tile, move on
							if (typeof(tile) === "string") continue;

							// if the player doesn't own this tile, move on
							if (tile.owner() !== player) continue;

							// otherwise, extract its coordinates
							tile_coords = tile.coords();
							tile_slug = tile_coords[0] + " " + tile_coords[1];

							// if we're checked this tile previously, move on
							if (checked_tiles.indexOf(tile_slug) !== -1) continue;

							// add to checked tiles list (before checking to prevent recursing on this tile)
							checked_tiles.push(tile_slug);

							// check p1 victory condition
							if (direction === "HORIZONTAL" & tile.coords()[0] === (hex.settings.BOARD_SIZE -1)) return true;

							// check p2 victory contition
							if (direction === "VERTICAL" & tile.coords()[1] === (hex.settings.BOARD_SIZE - 1)) return true;
							
							// if we made it this far, recurse through adjacent tiles
							if (check_tiles(tile.adjacents())) return true;
						}
						// if we made it this far, there is no victory on this branch (no tiles left to check)
						return false;
					},
				initial_list = [];
			for (var i=0; i<hex.settings.BOARD_SIZE; i++) {
				// for player 1, start with the left column tiles
				if (direction === "HORIZONTAL") initial_list.push(this._grid.tile(0, i));
				// for player 2, start with the top row tiles
				if (direction === "VERTICAL") initial_list.push(this._grid.tile(i, 0));
			}
			// run the check
			return check_tiles(initial_list);
		};


	window.addEventListener('load', init)

}());