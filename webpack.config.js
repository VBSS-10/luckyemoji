const path = require('path');
const childProcess = require('child_process');

const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const StyleLintPlugin = require('stylelint-webpack-plugin');
const webpack = require('webpack');
const WorkboxWebpackPlugin = require('workbox-webpack-plugin');

const pkg = require('./package.json');

module.exports = (env, { mode }) => {
    const DEV = /development|dev/i.test(mode);
    const PROD = /production|prod/i.test(mode);
    const COMMIT_HASH = childProcess.execSync('git rev-parse HEAD').toString().trim();
    const BUILD_DATE = new Date();

    const config = {
        devtool: DEV ? 'eval-source-map' : 'source-map',

        entry: {
            main: [
                './src/app/main.js',
                './src/app/main.scss',
            ],
            wallet: './src/app/components/wallet/wallet.component.js', // Добавляем новый entry point для страницы Wallet
            tasks: './src/app/components/tasks/tasks.component.js', // Добавляем новый entry point для страницы Tasks
            info: './src/app/components/info/info.component.js', // Добавляем новый entry point для страницы Info
        },

        output: {
            filename: PROD ? '[name].[contenthash].js' : '[name].[fullhash].js',
            path: path.resolve(__dirname, 'dist'),
            publicPath: '/',  // Измените на '/' для работы в корне
        },

        devServer: {
            static: {
                directory: path.resolve(__dirname, 'static'),
            },
            devMiddleware: {
                publicPath: '/',  // Измените на '/' для работы в корне
            },
            client: {
                overlay: {
                    warnings: false,
                    errors: false,
                },
            },
        },

        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                    },
                },
                {
                    test: /\.scss/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        'css-loader',
                        'postcss-loader',
                        'sass-loader',
                    ],
                },
                {
                    test: /\.ejs$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'ejs-compiled-loader',
                    },
                },
            ],
        },

        plugins: [
            new ESLintPlugin({ fix: true }),

            new HtmlWebpackPlugin({
                filename: path.resolve(__dirname, 'dist/index.html'),
                template: path.resolve(__dirname, 'src/app/components/app/app.template.ejs'),
                chunks: ['main'],
                title: 'Happy Emoji \\ Circular slot machine Emojis!',
                description: pkg.description,
                favicon: path.resolve(__dirname, 'static/favicon.ico'),
                inlineSource: '.(js|css)$', // Inline JS and CSS.
                minify: PROD,
                meta: {
                    author: pkg.author.name,
                    description: pkg.description,
                },
            }),

            // Страница Wallet
            new HtmlWebpackPlugin({
                filename: path.resolve(__dirname, 'dist/wallet.html'),
                template: path.resolve(__dirname, 'src/app/components/wallet/wallet.template.ejs'),
                chunks: ['wallet'], // Только wallet.bundle.js будет подключен на этой странице
                title: 'Wallet',
                description: 'Manage your wallet in Happy Emoji!',
                minify: PROD,
                meta: {
                    author: pkg.author.name,
                    description: 'Manage your wallet in Happy Emoji!',
                    title: 'Wallet',
                },
            }),

            // Страница Tasks
            new HtmlWebpackPlugin({
                filename: path.resolve(__dirname, 'dist/tasks.html'),
                template: path.resolve(__dirname, 'src/app/components/tasks/tasks.template.ejs'),
                chunks: ['tasks'], // Только tasks.bundle.js будет подключен на этой странице
                title: 'Tasks',
                description: 'Manage your tasks in Happy Emoji!',
                minify: PROD,
                meta: {
                    author: pkg.author.name,
                    description: 'Manage your tasks in Happy Emoji!',
                    title: 'Tasks',
                },
            }),

            // Страница Info
            new HtmlWebpackPlugin({
                filename: path.resolve(__dirname, 'dist/info.html'),
                template: path.resolve(__dirname, 'src/app/components/info/info.template.ejs'),
                chunks: ['info'], // Только info.bundle.js будет подключен на этой странице
                title: 'Instructions',
                description: 'Manage your info in Happy Emoji!',
                minify: PROD,
                meta: {
                    author: pkg.author.name,
                    description: 'Manage your info in Happy Emoji!',
                    title: 'Instructions',
                },
            }),

            new MiniCssExtractPlugin({
                filename: PROD ? '[name].[contenthash].css' : '[name].[fullhash].css',
            }),

            new StyleLintPlugin({
                fix: true,
            }),

            new CopyWebpackPlugin({
                patterns: [
                    {
                        from: 'static',
                    },
                ],
            }),

            new webpack.EnvironmentPlugin({
                DEV,
                PROD,
                BUILD_DATE,
                COMMIT_HASH,
            }),

            new WorkboxWebpackPlugin.GenerateSW({
                clientsClaim: true,
                skipWaiting: true,
            }),

            // Анализатор пакетов (опционально)
            // new BundleAnalyzerPlugin(),
        ],

        optimization: {
            minimize: true,

            splitChunks: {
                cacheGroups: {
                    styles: {
                        name: 'styles',
                        test: /\.css$/,
                        chunks: 'all',
                        enforce: true,
                    },
                },
            },

            minimizer: PROD
                ? ['...', new CssMinimizerPlugin()]
                : [],
        },
    };

    return config;
};
