var webpack       = require('webpack');
var merge         = require('webpack-merge');
var autoprefixer  = require('autoprefixer');
var HtmlWebpackPlugin = require('html-webpack-plugin')
var path = require('path');

var HOST = process.env.HOST || 'http://localhost:8080/';
var TARGET = process.env.npm_lifecycle_event;
process.env.BABEL_ENV = TARGET;

var target = path.resolve(__dirname, 'addon')

function postcssOptions() {
	return {
		defaults: [autoprefixer],
		cleaner: [autoprefixer({ browsers: [
			'Chrome >= 35',
			'Firefox >= 31',
			'Edge >= 12',
			'Explorer >= 9',
			'iOS >= 8',
			'Safari >= 8',
			'Android 2.3',
			'Android >= 4',
			'Opera >= 12'
		]})]
	}
}

var sassLoaderOptions = {
	includePaths: [__dirname + '/node_modules']
}

var common = {
	entry: {
		main: path.resolve(__dirname, 'app/index.jsx')
	},

	output: {
		path: target,
		filename: "[name].js"
	},

	sassLoader: sassLoaderOptions,

	postcss: postcssOptions,

	resolve: {
		alias: {
			'~': path.resolve(__dirname, 'app'),
			'react/lib/ReactMount': 'react-dom/lib/ReactMount' // https://github.com/gaearon/react-hot-loader/issues/417#issuecomment-261548082
		},
		extensions: ['', '.js', '.jsx', '.json', '.scss', '.sass'],
		modulesDirectories: ['node_modules']
	},

	module: {
		loaders: [
			{
				test: /\.jsx?$/,
				loader: 'react-hot',
				exclude: /node_modules/
			},
			{
				test: /\.jsx?$/,
				loader: 'babel',
				query: {
					presets: ['react', 'es2015', 'stage-0', 'stage-1', 'stage-2'],
					plugins: ['add-module-exports']
				},
				include: path.resolve(__dirname, 'app/')
			},
			{
				test: /\.json$/,
				loader: 'json',
			},

			{
				test: /\.s[ca]ss$/,
				loader: 'style!css?url=false!postcss!sass',
				include: path.resolve(__dirname, 'app/')
			},

			{
				test: /\.css$/,
				loader: 'style!css!postcss'
			}
		]
	},

	plugins: [
		new HtmlWebpackPlugin({
			template: path.resolve(__dirname, 'app/index.ejs'),
			inject: false
		})
	]
};

if (TARGET === 'build') {
	module.exports = merge(common, {
		plugins: [
			new webpack.DefinePlugin({
				'process.env': { 'NODE_ENV': JSON.stringify('production') }
			})
		]
	});
}

if (TARGET === 'start') {
	module.exports = merge(common, {
		entry: [
			'webpack-dev-server/client?' + HOST,
			'webpack/hot/only-dev-server',
			path.resolve(__dirname, 'app/index.jsx')
		],

		devtool: 'eval-source-map',
		devServer: {
			// --hot --inline --progress in package.json script (npm run start)
			path: target,
			filename: '[name].js',
			publicPath: HOST,
			recordsPath: target,
			contentBase: target,
			host: '0.0.0.0',
			historyApiFallback: true
		},

		plugins: [
			new webpack.DefinePlugin({
				'process.env': {
					'debug': true,
					'STATIC_HOST': JSON.stringify(HOST)
				}
			})
		]
	});
}
