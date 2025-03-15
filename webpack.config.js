const path = require('path');
 
module.exports = {
    mode: 'development', // ou 'production'
    entry: './src/index.pug', // Point d'entrée de votre application
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'index.mjml', // Fichier JS de sortie (optionnel si vous ne générez que du HTML)
    },
    module: {
        rules: [
        {
            test: /\.pug$/, // Appliquer le loader aux fichiers .pug
            use: [
            {
                loader: path.resolve(__dirname, 'pug-to-mjml-loader.js'),
            },
            ],
        },
        ],
  },
};