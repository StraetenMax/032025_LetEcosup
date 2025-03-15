const path = require("path");
const Config = require("webpack-chain");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const fs = require("fs");

const config = new Config();

config.mode("development");

// Entrée principale
config.entry("main").add(path.resolve(__dirname, "src/templates/index.pug"));

config.output
    .path(path.resolve(__dirname, "dist"))
    .filename("bundle.js");

// Résolution des modules
config.resolve.modules
    .add(path.resolve(__dirname, "src"))
    .add("node_modules");

// Plugin pour extraire le HTML final
config.plugin("html-webpack-plugin")
    .use(HtmlWebpackPlugin, [{
        template: path.resolve(__dirname, "src/templates/index.pug"),
        filename: "index.html",
        inject: true
    }]);

// Gestion des fichiers Pug
config.module
    .rule("pug")
    .test(/\.pug$/)
    .use("html-loader")
    .loader("html-loader")
    .end()
    .use("pug-html-loader")
    .loader("pug-html-loader")
    .options({
        pretty: true
    });

// Transformation MJML directe (alternative à la chaîne Pug → MJML → HTML)
// Ajouter cette règle pour copier le fichier Pug en MJML
config.module
.rule("pug-to-mjml")
.test(/\.pug$/)
.use("file-loader")
.loader("file-loader")
.options({
  name: "[name].mjml"
});

// Ajout d'un plugin personnalisé pour la conversion en plusieurs étapes
config.plugin("mjml-conversion-plugin")
    .use(function() {
        return {
            apply: (compiler) => {
                compiler.hooks.afterEmit.tap("MjmlConversionPlugin", (compilation) => {
                    // Lire le fichier MJML généré
                    const mjmlPath = path.resolve(__dirname, "dist/index.mjml");
                    if (fs.existsSync(mjmlPath)) {
                        const mjmlContent = fs.readFileSync(mjmlPath, "utf8");
                        
                        // Utiliser le module mjml pour convertir en HTML
                        try {
                            const mjml2html = require("mjml");
                            const htmlOutput = mjml2html(mjmlContent, {
                                minify: false,
                                validationLevel: "strict"
                            });
                            
                            // Écrire le fichier HTML final
                            if (htmlOutput.html) {
                                fs.writeFileSync(
                                    path.resolve(__dirname, "dist/email.html"),
                                    htmlOutput.html
                                );
                                console.log("✅ Conversion MJML → HTML réussie : email.html généré");
                            } else {
                                console.error("❌ Erreur lors de la conversion MJML → HTML");
                            }
                        } catch (error) {
                            console.error("❌ Erreur lors du traitement MJML:", error.message);
                        }
                    } else {
                        console.warn("⚠️ Fichier index.mjml non trouvé");
                    }
                });
            }
        };
    });

// Configuration du serveur de développement
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