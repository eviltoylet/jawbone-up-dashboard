module.exports = {
    devServer: {
        contentBase: "./"
    },
    entry: './src/index.jsx',
    output: {
        path: __dirname
    },
    resolve: {
        extensions: ['', '.js', '.jsx']
    },
    module: {
        loaders: [
            {
                test: /\.jsx$/,
                loader: 'jsx-loader?insertPragma=React.DOM&harmony'
            }
        ]
    },
    externals: {
        'react': 'React',
        'react-dom': 'ReactDOM'
    }
};