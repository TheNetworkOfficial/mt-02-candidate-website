# Webpack Configuration Guide for SovereignQuest

Welcome to the Webpack guide for **SovereignQuest**! This document will help you understand the purpose of using **Webpack** in our project, how the configuration works, and how you can extend it when needed.

## Introduction to Webpack

**Webpack** is a powerful module bundler for JavaScript applications, providing efficient ways to manage and bundle code, styles, images, and more. Webpack allows us to have a highly customizable build process, ensuring our project is optimized for production while making development straightforward and manageable.

## Key Features Used in SovereignQuest

In our **Webpack** setup for SovereignQuest, we use the following key features:

- **Multi-page support** to handle various entry points for different pages (e.g., login, registration).
- **HTML Templating** using `HtmlWebpackPlugin` for easy customization of page-specific data such as titles.
- **Code Splitting** to improve load time and allow specific JavaScript and CSS to be loaded per page.

## Project Structure

Our Webpack configuration follows a modular approach, where each page has its own JavaScript entry and corresponding HTML template. This ensures each page of the SovereignQuest web app functions as a self-contained module, which can be upgraded, replaced, or deleted independently.

### Key Folders and Files

- **frontend/src**: The root directory for source files.
- **frontend/src/pages**: Subdirectories under `src/pages` contain different pages like `index`, `login`, `registration`, etc., each having their own `index.js` and `index.html` files.
- **webpack.config.js**: The Webpack configuration file located in the project root.

## Webpack Configuration Overview

Here's an overview of our **webpack.config.js** configuration:

```javascript
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const path = require("path");

module.exports = {
  mode: "production",
  entry: {
    main: "./src/main.js",
    index: "./src/pages/index/index.js",
    login: "./src/pages/login/login.js",
    registration: "./src/pages/registration/registration.js",
    forgotUsername: "./src/pages/forgotUsername/forgotUsername.js",
    forgotPassword: "./src/pages/forgotPassword/forgotPassword.js",
    resetPassword: "./src/pages/resetPassword/resetPassword.js",
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
        type: "asset/resource",
        generator: {
          filename: "assets/[name][ext]",
        },
      },
      {
        test: /\.html$/,
        use: ["html-loader"],
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: "css/[name].[contenthash].css",
    }),
    new HtmlWebpackPlugin({
      template: "./src/pages/index/index.html",
      filename: "index.html",
      chunks: ["main", "index"],
      favicon: "./src/assets/images/icons/SovereignQuest.pngnQuest.png",
    }),
    new HtmlWebpackPlugin({
      template: "./src/pages/login/login.html",
      filename: "login.html",
      chunks: ["main", "login"],
      favicon: "./src/assets/images/icons/SovereignQuest.png",
    }),
    // Additional pages...
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, "dist"),
    },
    compress: true,
    port: 9000,
  },
};
```

### Detailed Breakdown

1. **Entry Points**:

   - The `entry` property defines multiple entry points, one for each page. This allows for modular builds where each page has its own JavaScript and dependencies.

2. **Output**:

   - **`output.path`**: Defines the build output directory as `dist`.
   - **`output.filename`**: Each bundle file is named with a unique content hash for caching.

3. **Plugins**:

   - **`HtmlWebpackPlugin`**: Generates HTML files for each page. We provide page-specific configurations like `title` and `favicon`.
   - **`MiniCssExtractPlugin`**: Extracts CSS into separate files for better caching and modular loading.
   - **`CleanWebpackPlugin`**: Cleans the `dist` directory before each build to ensure no old files are kept.

4. **DevServer**:
   - **`devServer`**: Configures the development server with hot-reloading, specifying port `9000`.

## How to Run the Project

- **Development Server**: To start the development server with hot-reloading, use:
  ```bash
  npm run start
  ```
- **Build for Production**: To create an optimized production build, use:
  ```bash
  npm run build
  ```

## Adding New Pages

To add a new page to **SovereignQuest**:

1. **Create a New Directory**: Create a new directory under `frontend/src/pages` for the new page (e.g., `frontend/src/pages/about`).
2. **Add HTML and JavaScript**: Add an `index.html` and `index.js` file inside this directory.
3. **Update `webpack.config.js`**:
   - Add a new entry point under `entry` for the new page.
   - Add a new configuration block under `HtmlWebpackPlugin` for the new page.

Example for adding a new page called `about`:

```javascript
new HtmlWebpackPlugin({
  template: './src/pages/about/index.html',
  filename: 'about.html',
  chunks: ['main', 'about'],
  favicon: './src/assets/images/icons/SovereignQuest.png'
}),
```

## Common Tasks and Tips

- **Hot Module Replacement (HMR)**: The development server provides HMR by default, allowing you to see changes immediately in the browser during development.
- **Optimizing Builds**: Ensure all unused code is removed through tree-shaking, enabled by Webpack by default.

## Summary

**Webpack** provides a flexible and powerful way to build and bundle **SovereignQuest**, supporting multiple pages and enabling efficient builds. It ensures our development environment remains smooth while providing optimized production-ready bundles. If you are adding new features or pages, always make sure to update `webpack.config.js` accordingly.

For more details or questions, feel free to consult the development team or look through additional documentation provided in the repository.
