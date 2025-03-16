import gulp from 'gulp';
//import { compile as nunjucksCompile } from 'gulp-nunjucks';
import nunjucksRender from 'gulp-nunjucks-render';
import data from 'gulp-data';
import mjml from 'gulp-mjml';
import beautify from 'gulp-beautify';
import rename from 'gulp-rename';
import matter from 'gray-matter';
import fm from 'front-matter';
//import plumber from 'gulp-plumber';
//import notify from 'gulp-notify';
import { createRequire } from 'module';
import pkg from'lodash';
const {merge} = pkg;
//import { merge } from 'lodash';
import fs from 'fs';
import path from 'path';

const require = createRequire(import.meta.url);

// Chemin des fichiers sources et de sortie
const srcPath = 'src/';
const distPath = 'dist/';
const dataPath = 'data/';

// Fonction pour obtenir les données JSON
const getJsonData = () => {
  const userDataJson = require(path.join(process.cwd(), dataPath, 'user.json'));
  const productDataJson = require(path.join(process.cwd(), dataPath, 'product.json'));
  return merge({}, userDataJson, productDataJson);
};

// Fonction pour obtenir les données Markdown
/*const getMarkdownData = () => {
  const userDataMd = fm(fs.readFileSync(path.join(process.cwd(), dataPath, 'user.md'), 'utf-8'));
  const productDataMd = fm(fs.readFileSync(path.join(process.cwd(), dataPath, 'product.md'), 'utf-8'));
  const siteDataMd = fm(fs.readFileSync(path.join(process.cwd(), dataPath, 'site.md'), 'utf-8'));
  return merge({}, userDataMd.attributes, productDataMd.attributes, siteDataMd.attributes);
};*/

// Tâche pour compiler Nunjucks en MJML
const compileNunjucksToMjml = () =>
  gulp.src(`${srcPath}**/*.njk`)
    //.pipe(plumber({ errorHandler: notify.onError("Error: <%= error.message %>") }))
    //.pipe(data(() => ({jsonData: getJsonData(), markdownData: getMarkdownData()})))
    .pipe(data(() => ({jsonData: getJsonData()})))
    .pipe(nunjucksRender({
        path: ['src/templates', 'src/partials'],
        filters: {
          uppercase: function(str) {
            return str.toUpperCase();
          }
        },
        globals: {
          siteName: 'Mon Site'
        }
      }))
    .pipe(rename({ extname: '.mjml' }))
    .pipe(gulp.dest(`${srcPath}mjml/`));


// Tâche pour compiler MJML en HTML
function compileMjmlToHtml() {
  return gulp.src(`${srcPath}mjml/**/*.mjml`)
    //.pipe(plumber({ errorHandler: notify.onError("Error: <%= error.message %>") }))
    .pipe(mjml())
    .pipe(beautify.html({ indent_size: 2 }))
    .pipe(gulp.dest(distPath));
}

// Tâche par défaut
const build = gulp.series(compileNunjucksToMjml, compileMjmlToHtml);

// Surveillance des fichiers pour les changements
function watchFiles() {
  gulp.watch(`${srcPath}**/*.njk`, build);
  gulp.watch(`${srcPath}mjml/**/*.mjml`, compileMjmlToHtml);
}

// Exporter les tâches
export const buildTask = build;
export const watchTask = watchFiles;
export default build;
