module.exports = function override(config, env) {
        config.module.rules.push({
                test: /\.worker\.js$/i,
                use: [
                        {
                                loader: 'worker-loader'
                        }, {
                                loader: 'babel-loader'
                        }
                ]
        });
        config.output['globalObject'] = 'this';

        if (env === 'production') {

                const isFilenameSet = config.output.filename && config.output.filename.includes('hash');
                const isChunkFilenameSet = config.output.chunkFilename && config.output.chunkFilename.includes('hash');

                if (!isFilenameSet || !isChunkFilenameSet) {
                        if (!isFilenameSet) {
                                config.output.filename = 'static/js/[name].[contenthash:8].js';
                        }
                        if (!isChunkFilenameSet) {
                                config.output.chunkFilename = 'static/js/[name].[contenthash:8].chunk.js';
                        }
                }

                const miniCssExtractPlugin = config.plugins.find(
                        plugin => plugin.constructor.name === 'MiniCssExtractPlugin'
                );
                if (miniCssExtractPlugin) {
                        const cssFilename = miniCssExtractPlugin.options.filename;
                        const cssChunkFilename = miniCssExtractPlugin.options.chunkFilename;

                        if (!cssFilename || !cssFilename.includes('[contenthash]')) {
                                miniCssExtractPlugin.options.filename = 'static/css/[name].[contenthash:8].css';
                        }
                        if (!cssChunkFilename || !cssChunkFilename.includes('[contenthash]')) {
                                miniCssExtractPlugin.options.chunkFilename = 'static/css/[name].[contenthash:8].chunk.css';
                        }
                }
        }

        return config;
}
