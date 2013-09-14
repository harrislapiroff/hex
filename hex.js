(function () {

	var log = console.log || function () {},
		hex = window.hex = {},
		paper = hex.paper,
		init = function () {
				hex.paper = Raphael(0, 0, 1000, 600);
				Grid(14);
			};

	var Tile = hex.Tile,
		Grid = hex.Grid,
		Hexagon = hex.Hexagon;

	/**************************************************
	* Hexagon                                         *
	**************************************************/

	Hexagon = function (x, y, c, attrs) {
			if (!(this instanceof arguments.callee)) return new arguments.callee(x, y, c, attrs);
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
				points = [
					(x) + " " + (y + a + c),
					(x) + " " + (y + a),
					(x + b) + " " + (y),
					(x + 2 * b) + " " + (y + a),
					(x + 2 * b) + " " + (y + a + c),
					(x + b) + " " + (y + 2 * c)
				];
			pathstring = "M" + points.join("L") + "Z";
			hex.paper.path(pathstring).attr(this._attrs);
		};

	/**************************************************
	* Tile                                            *
	**************************************************/

	Tile = function (x, y, c) { // c is side length of the hexagon in pixels
			if (!(this instanceof arguments.callee)) return new arguments.callee(x, y, c);
			this._x = x;
			this._y = y;
			this._c = c;
			this.draw();
		};
	Tile.prototype.draw = function () {
			this._hex = Hexagon(this._x, this._y, this._c, {"fill": "none", "stroke": "rgba(255,255,255,.75)", "stroke-width":"4", "class": "tile"})
		};

	/**************************************************
	* Grid                                            *
	**************************************************/

	Grid = function (n) { // creates an n x n grid of tiles
			if (!(this instanceof arguments.callee)) return new arguments.callee(n);
			this._n = n;
			this._tiles = [];
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
				x = 0,
				y = 0;
			for (var i = 0; i < n; i++) { // row loop
				x = i * stagger_horizontal;
				y = i * spacing_vertical;
				for (var j = 0; j < n; j++) { // column loop
					Tile(x + grid_spacing/2, y +grid_spacing/2, w - grid_spacing)
					x = x + spacing_horizontal;
				};
			};
		}

	window.addEventListener('load', init)

}());