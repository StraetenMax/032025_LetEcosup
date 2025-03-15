const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { exec } = require("child_process");

module.exports = {
    mode: "development",
    entry: "./src/templates/index.html",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "bundle.js",
    },
    module: {
        rules: [
            {
                test: /\.pug$/,
                use: ["pug-loader"],
            },
            {
                test: /\.mjml$/,
                use: [
                   /* {
                        loader: "file-loader",
                        options: { name: "[name].html"},
                    },*/
                    {
                        loader: "mjml-loader",
                    },
                ],
            },
            {
                test: /\.html$/,
                exclude: [require.resolve('./src/templates/index.html')],
                use: ['file-loader'],
            },
            /*{
                test: /\.html$/,
                use: ["html-loader"],
            },*/
        ],
    },
    plugins:[
        new HtmlWebpackPlugin({
            template: "./src/templates/index.pug",
            filename: "index.html",
        }),
    ],
    devServer: {
        static: path.join(__dirname, "dist"),
        compress: true,
        port: 3000,
        hot: true,
        onAfterSetupMiddleware: function () {
            console.log("MailHog devrait être en cours d'exécution sur http://localhost:8025");
        }
    },
};

//Générer l'émail MJML en HTML après la compilation
exec("npx mjml src/templates/index.mjml -o dist/index.html", (err, stdout, stderr) => {
    if (err) {
        console.error(`Erreur MJML : ${stderr}`);
        return;
    }
    console.log("✅ Email MJML généré !");
});