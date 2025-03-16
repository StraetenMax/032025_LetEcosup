import gulp from 'gulp';
//import { compile as nunjucksCompile } from 'gulp-nunjucks';
import nunjucksRender from 'gulp-nunjucks-render';
import data from 'gulp-data';
import mjml from 'gulp-mjml';
import beautify from 'gulp-beautify';
import rename from 'gulp-rename';
//import plumber from 'gulp-plumber';
//import notify from 'gulp-notify';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// Chemin des fichiers sources et de sortie
const srcPath = 'src/';
const distPath = 'dist/';

// Fonction pour obtenir les données à injecter dans les templates Nunjucks
function getData() {
  return require('./data/data.json');
}

// Tâche pour compiler Nunjucks en MJML
function compileNunjucksToMjml() {
  return gulp.src(`${srcPath}**/*.njk`)
    //.pipe(plumber({ errorHandler: notify.onError("Error: <%= error.message %>") }))
    .pipe(data(getData))
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
}

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
