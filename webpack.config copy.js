const path = require("path");
const Config = require("webpack-chain");
const config = new Config();

config.mode("development")

config.entry("main").add(path.resolve(__dirname, "src/templates/index.pug"));
    //.entry("./src/templates/index.pug")
config.output
    .path(path.resolve(__dirname, "dist"))
    .filename("bundle.js");

// Assurer que Webpack peut résoudre les modules dans `src/` et `node_modules/`
config.resolve.modules
    .add(path.resolve(__dirname, "src"))
    .add("node_modules");

//Étape1: Convertir Pug en Mjml (étape1)
config.module
    .rule("pug-to-mjml")
    .test(/\.pug$/)
    .use("raw-loader")
    .loader("raw-loader")
    .end()
    .use("pug-loader")
    .loader("pug-loader")
    .options({pretty: true }) //Générer un Mjml lisible
    .end()
    .use("file-loader")
    .loader("file-loader")
    .options({
        name: "[name].mjml",
        //outputPath: "dist/",
    });

//Étape2 Convertir Mjml en Html (étape2)
config.module
    .rule("pug-to-mjml")
    .test(/\.mjml$/)
    .use("raw-loader")
    .loader("raw-loader")
    .end()
    .use("mjml-loader")
    .loader("mjml-loader");

config.devServer
    .merge({
        static: {
            directory: path.join(__dirname, "dist"),
        },
        compress: true,
        port: 3000,
        hot: true,
        setupMiddlewares: (middlewares, devServer) => {
            console.log("MailHog devrait être en cours d'exécution sur http://localhost:8025");
            return middlewares;
            },
        });

module.exports = config.toConfig();