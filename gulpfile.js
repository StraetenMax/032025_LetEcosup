const gulp = require('gulp');
const pug = require('gulp-pug');
const mjml = require('gulp-mjml');
const nunjucks = require('gulp-nunjucks');
const data = require('gulp-data');
const rename = require('gulp-rename');
const beautify = require('gulp-beautify');
const plumber = require('gulp-plumber');
const cache = require('gulp-cache');
const htmlmin = require('gulp-htmlmin');
const notify = require('gulp-notify');
const imagemin = require('gulp-imagemin');
const w3cHtmlValidator = require('gulp-w3c-html-validator');

// Chemin des fichiers sources et de sortie
const srcPath = 'src/';
const distPath = 'dist/';

// Fonction pour obtenir les données à injecter dans les templates Nunjucks
function getData() {
  return require('./data.json');
}

// Tâche pour compiler Pug en templates intermédiaires
function compilePugToIntermediate() {
  return gulp.src(`${srcPath}**/*.pug`)
    .pipe(plumber({ errorHandler: notify.onError("Error: <%= error.message %>") }))
    .pipe(cache(pug({ pretty: true })))
    .pipe(rename({ extname: '.njk' }))
    .pipe(gulp.dest(`${srcPath}intermediate/`));
}

// Tâche pour compiler les templates intermédiaires Nunjucks en MJML
function compileNunjucksToMjml() {
  return gulp.src(`${srcPath}intermediate/**/*.njk`)
    .pipe(plumber({ errorHandler: notify.onError("Error: <%= error.message %>") }))
    .pipe(data(getData))
    .pipe(nunjucks.compile())
    .pipe(rename({ extname: '.mjml' }))
    .pipe(gulp.dest(`${srcPath}mjml/`));
}

// Tâche pour compiler MJML en HTML
function compileMjmlToHtml() {
  return gulp.src(`${srcPath}mjml/**/*.mjml`)
    .pipe(plumber({ errorHandler: notify.onError("Error: <%= error.message %>") }))
    .pipe(mjml())
    .pipe(beautify.html({ indent_size: 2 }))
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(w3cHtmlValidator())
    .pipe(gulp.dest(distPath));
}

// Tâche pour optimiser les images
function optimizeImages() {
  return gulp.src(`${srcPath}images/**/*`)
    .pipe(imagemin())
    .pipe(gulp.dest(`${distPath}images/`));
}

// Tâche par défaut
const build = gulp.series(compilePugToIntermediate, compileNunjucksToMjml, compileMjmlToHtml, optimizeImages);

// Surveillance des fichiers pour les changements
function watchFiles() {
  gulp.watch(`${srcPath}**/*.pug`, build);
  gulp.watch(`${srcPath}intermediate/**/*.njk`, compileNunjucksToMjml);
  gulp.watch(`${srcPath}mjml/**/*.mjml`, compileMjmlToHtml);
  gulp.watch(`${srcPath}images/**/*`, optimizeImages);
}

// Exporter les tâches
exports.build = build;
exports.watch = watchFiles;
exports.default = build;