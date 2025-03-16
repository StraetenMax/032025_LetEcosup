const gulp = require('gulp');
const pug = require('gulp-pug');
const mjml = require('gulp-mjml');
const nunjucks = require('gulp-nunjucks');
const data = require('gulp-data');
const rename = require('gulp-rename');
const beautify = require('gulp-beautify');
const plumber = require('gulp-plumber');
const cache = require('gulp-cache');
const htmlmin = require('htmlmin');
const notify = require('gulp-notify');
const imagemin = require('gulp-imagemin');
const w3cHtmlValidator = require('gulp-w3c-html-validator');

// Chemin des fichiers sources et sortie
const srcPath = 'src/';
const distPath = 'dist/';

// Fonction pour obtenir les données à injecter dans les templates Nunjucks
function getData() {
    return require('./data.json');
}

// Tâche pour compiler Pug en Mjml
function compilePugToMjml(){
    return gulp.src(`${srcPath}**/*.pug`)
        .pipe(plumber({ errorHandler: notify.onError("Error: <%= error.message %>")}))
        .pipe(cache(pug({pretty:true})))
        .pipe(rename({ extname: '.mjml'}))
        .pipe(gulp.dest(srcPath));
    }
    
// Tâche pour compiler Mjml en Html
function compileMjmlToHtml() {
    return gulp.src(`${srcPath}**/*.mjml`)
        .pipe(plumber({ errorHandler: notify.onError("Error: <%= error.message %>")}))
        .pipe(mjml())
        .pipe(beautify.html({indent_size:2}))
        .pipe(htmlmin({collapseWhitepace: true}))
        .pipe(w3cHtmlValidator())
        .pipe(gulp.dest(distPath));
    }
    
// Tâche pour compiler Nunjucks en Html
function compileNunjucksToHtml(){
    return gulp.src(`${srcPath}**/*.njk`)
        .pipe(plumber({ errorHandler: notify.onError("Error: <%= error.message %>")}))
        .pipe(data(getData))
        .pipe(nunjucks.compile())
        .pipe(beautify.html({indent_size: 2}))
        .pipe(htmlmin({collapseWhitepace: true}))
        .pipe(w3cHtmlValidator())
        .pipe(gulp.dest(distPath));
}

// Tâche pour optimiser les images
function optimizeImages() {
    return gulp.src(`${srcPath}images/**/*`)
      .pipe(imagemin())
      .pipe(gulp.dest(`${distPath}images/`));
  }

// Tâche par defaut
const build = gulp.series(compilePugToMjml, gulp.parallel(compileMjmlToHtml, compileNunjucksToHtml, optimizeImages));


// Surveillance des fichiers pour les changements
function watchFiles() {
    gulp.watch(`${srcPath}**/*.pug`, build);
    gulp.watch(`${srcPath}**/*.mjml`, compileMjmlToHtml);
    gulp.watch(`${srcPath}**/*.njk`, compileNunjucksToHtml);
    gulp.watch(`${srcPath}images/**/*`, optimizeImages);
  }

// Exporter les tâches
    exports.build = build;
    exports.watch = watchFiles;
    exports.default = build;