const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const path = require("path");

module.exports = {
  mode: "production",
  entry: {
    main: "./src/main.js",
    index: "./src/pages/index/index.js",
    issues: "./src/pages/issues/issues.js",
    forgotPassword: "./src/pages/forgotPassword/forgotPassword.js",
    forgotUsername: "./src/pages/forgotUsername/forgotUsername.js",
    login: "./src/pages/login/login.js",
    registration: "./src/pages/registration/registration.js",
    resetPassword: "./src/pages/resetPassword/resetPassword.js",
    about: "./src/pages/about/about.js",
    volunteer: "./src/pages/volunteer/volunteer.js",
    contact: "./src/pages/contact/contact.js",
    events: "./src/pages/events/events.js",
    event: "./src/pages/event/event.js",
    admin: "./src/pages/admin/admin.js",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "scripts/[name].[contenthash].js",
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
      {
        test: /\.(png|jpg|gif|mp4)$/,
        type: "asset/resource", // Use Webpack's built-in asset handling
        generator: {
          filename: "assets/[name][ext]", // Output files to 'assets' folder
        },
      },
      {
        test: /\.html$/,
        use: ["html-loader"],
      },
      {
        test: /\.md$/,
        use: "raw-loader"
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: "css/[name].[contenthash].css",
    }),
    new HtmlWebpackPlugin({
      template: "./src/components/header/header.html",
      filename: "header.html",
    }),
    new HtmlWebpackPlugin({
      template: "./src/components/footer/footer.html",
      filename: "footer.html",
    }),
    new HtmlWebpackPlugin({
      template: "./src/pages/index/index.html",
      filename: "index.html",
      chunks: ["main", "index"],
      favicon: "./src/assets/images/icons/montanaStarState.png",
    }),
    new HtmlWebpackPlugin({
      template: "./src/pages/issues/issues.html",
      filename: "issues.html",
      chunks: ["main", "issues"],
      favicon: "./src/assets/images/icons/montanaStarState.png",
    }),
    new HtmlWebpackPlugin({
      template: "./src/pages/forgotPassword/forgotPassword.html",
      filename: "forgotPassword.html",
      chunks: ["main", "forgotPassword"],
      favicon: "./src/assets/images/icons/montanaStarState.png",
    }),
    new HtmlWebpackPlugin({
      template: "./src/pages/forgotUsername/forgotUsername.html",
      filename: "forgotUsername.html",
      chunks: ["main", "forgotUsername"],
      favicon: "./src/assets/images/icons/montanaStarState.png",
    }),
    new HtmlWebpackPlugin({
      template: "./src/pages/login/login.html",
      filename: "login.html",
      chunks: ["main", "login"],
      favicon: "./src/assets/images/icons/montanaStarState.png",
    }),
    new HtmlWebpackPlugin({
      template: "./src/pages/registration/registration.html",
      filename: "registration.html",
      chunks: ["main", "registration"],
      favicon: "./src/assets/images/icons/montanaStarState.png",
    }),
    new HtmlWebpackPlugin({
      template: "./src/pages/resetPassword/resetPassword.html",
      filename: "resetPassword.html",
      chunks: ["main", "resetPassword"],
      favicon: "./src/assets/images/icons/montanaStarState.png",
    }),
    new HtmlWebpackPlugin({
      template: "./src/pages/about/about.html",
      filename: "about.html",
      chunks: ["main", "about"],
      favicon: "./src/assets/images/icons/montanaStarState.png",
    }),
    new HtmlWebpackPlugin({
      template: "./src/pages/volunteer/volunteer.html",
      filename: "volunteer.html",
      chunks: ["main", "volunteer"],
      favicon: "./src/assets/images/icons/montanaStarState.png",
    }),
    new HtmlWebpackPlugin({
      template: "./src/pages/contact/contact.html",
      filename: "contact.html",
      chunks: ["main", "contact"],
      favicon: "./src/assets/images/icons/montanaStarState.png",
    }),
    new HtmlWebpackPlugin({
      template: "./src/pages/events/events.html",
      filename: "events.html",
      chunks: ["main", "events"],
      favicon: "./src/assets/images/icons/montanaStarState.png",
    }),
    new HtmlWebpackPlugin({
      template: "./src/pages/event/event.html",
      filename: "event.html",
      chunks: ["main", "event"],
      favicon: "./src/assets/images/icons/montanaStarState.png",
    }),
    new HtmlWebpackPlugin({
      template: "./src/pages/admin/admin.html",
      filename: "admin.html",
      chunks: ["main", "admin"],
      favicon: "./src/assets/images/icons/montanaStarState.png",
    }),
    new HtmlWebpackPlugin({
      template: './src/pages/popups/workInProgressPopup.html',
      filename: 'workInProgressPopup.html',
    }),
  ],
  devServer: {
    proxy: [
      {
        context: ["/api", "/graphql", "/uploads"], // URLs to forward
        target: "http://localhost:3000", // your backend
        changeOrigin: true, // host header rewrite
        secure: false, // if you're using self-signed certs
      },
    ],
    static: {
      directory: path.join(__dirname, "dist"),
    },
    compress: true,
    port: 9000,
    allowedHosts: "all", // ⬅️ this lets any hostname (including ngrok) through
  },
};

console.log("Webpack output path:", path.resolve(__dirname, "dist"));
console.log("Entry points:", module.exports.entry);
