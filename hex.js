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
				w = 20,
				grid_spacing = 4,
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
		this._current_player_idx = 0
	};
	Game.prototype.current_player = function () {
			return this._players[this._current_player_idx];
		};
	Game.prototype.next_move = function () {
			// need to add a victory check
			// also need an opportunity to switch on first move?
			this._current_player_idx = (this._current_player_idx + 1) % this._players.length
			// can't imagine why there'd ever be anything other than 2 players, but let's be flexible
		};
	Game.prototype.reset = function () {
			this._grid.reset();
		};


	window.addEventListener('load', init)

}());