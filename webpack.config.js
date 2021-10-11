const path = require("path");
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');      



module.exports = (env, data) => {

  console.log(env);

  const { mode, server } = env;
  
  return {
    mode,
    devtool: "eval",
    entry: {    
      "app" : "./app.tsx"
    },
    output: {            
      filename: "[name].js",
      path: path.resolve(__dirname, mode) 
    },     
    resolve: { 
      extensions: [".ts", ".tsx", ".js", ".json", ".css"]
    }, 
    optimization: {
      minimize: false
    },
    devServer: {
      port: 3000,
      hot: true
    },
    module: {
      rules: [
        {   
          test: /\.(css|scss)$/,   
          use: ['style-loader', 'css-loader']
        },  
        {  
          test: /\.(ts|tsx)?$/,  
          exclude: path.resolve(__dirname,'node_modules'),
          loader: "ts-loader"
        },      
        {   
          test: /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9=&.]+)?$/,
          loader: "file-loader" 
        },    
        {
          test: /\.(png|jpg|gif)$/i,
          use: [
            {
              loader: "url-loader",
              options: {
                fallback: "responsive-loader"
              }
            }
          ]
        },
        {
          test: /\.(js|jsx)$/,
          use: {
            loader: "babel-loader",
            options: {
              presets: [
                "@babel/preset-env",
                "@babel/preset-react"
              ],
              plugins: [
                "@babel/plugin-proposal-class-properties",
                "@babel/plugin-proposal-optional-chaining"
              ]
            }
          },
          exclude: /node_modules/
        }    
      ]    
    },
    target: "web",
    plugins: [
      new CopyWebpackPlugin({
        patterns:[
          {
            from:"./index.html",
            to:"./index.html"
          },
          {
            from:"./assets"
          }
        ]
      }),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(mode),
        'process.env.server': JSON.stringify(server)
      })
    ]
  }

}
