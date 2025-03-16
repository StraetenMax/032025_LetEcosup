import gulp from 'gulp';
import pug from 'gulp-pug';
import nunjucksRender from 'gulp-nunjucks-render';
import data from 'gulp-data';
import mjml from 'gulp-mjml';
import beautify from 'gulp-beautify';
import rename from 'gulp-rename';
import fm from 'front-matter';
import { createRequire } from 'module';
import pkg from 'lodash';
const { merge } = pkg;
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
const getMarkdownData = () => {
  try {
    const userDataMd = fm(fs.readFileSync(path.join(process.cwd(), dataPath, 'user.md'), 'utf-8'));
    const productDataMd = fm(fs.readFileSync(path.join(process.cwd(), dataPath, 'product.md'), 'utf-8'));
    const siteDataMd = fm(fs.readFileSync(path.join(process.cwd(), dataPath, 'site.md'), 'utf-8'));
    return merge({}, userDataMd.attributes, productDataMd.attributes, siteDataMd.attributes);
  } catch (error) {
    console.warn('Attention: Certains fichiers Markdown n\'ont pas été trouvés', error);
    return {};
  }
};

// Tâche pour compiler Pug en Mjml
const compilePugToMjml = () =>
  gulp.src(`${srcPath}templates/**/*.pug`)
    .pipe(pug())
    //.pipe(beautify.html({ indent_size: 2 }))
    .pipe(rename({ extname: '.mjml' }))
    .pipe(gulp.dest(`${srcPath}mjml/`));

// Tâche pour compiler MJML en Html avec les données Nunjucks
const compileMjmlToHtml = () =>
  gulp.src(`${srcPath}mjml/**/*.mjml`)
    .pipe(mjml())
    .pipe(data(() => {
      const jsonData = getJsonData();
      const markdownData = getMarkdownData();
      return { jsonData, markdownData };
    }))
    .pipe(nunjucksRender({
      path: ['src/templates', 'src/partials'],
      filters: {
        uppercase: (str) => str.toUpperCase(),
      },
      globals: {
        siteName: 'Mon Site',
      },
    }))
    .pipe(beautify.html({ indent_size: 2 }))
    .pipe(gulp.dest(distPath));

// Tâche par défaut
const build = gulp.series(compilePugToMjml, compileMjmlToHtml);

// Surveillance des fichiers pour les changements
const watchFiles = () => {
  gulp.watch(`${srcPath}templates/**/*.pug`, build);
  gulp.watch(`${srcPath}mjml/**/*.mjml`, compileMjmlToHtml);
  gulp.watch(`${dataPath}**/*.json`, compileMjmlToHtml);
  gulp.watch(`${dataPath}**/*.md`, compileMjmlToHtml);
};

// Exporter les tâches
export const buildTask = build;
export const watchTask = watchFiles;
export default build;