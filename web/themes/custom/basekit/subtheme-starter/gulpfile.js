// Silence Sass legacy JS API deprecation warnings until gulp-dart-sass migrates.
process.env.SASS_SILENCE_DEPRECATIONS = 'legacy-js-api';

const gulp = require('gulp');
const plumber = require('gulp-plumber');
const sourcemaps = require('gulp-sourcemaps');
const gulpSass = require('gulp-dart-sass');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');

// Compile global SCSS from scss/ into css/
const sassTask = () => {
  return gulp.src('scss/**/*.scss')
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(gulpSass({
      includePaths: ['scss', '../basekit/scss', '../basekit/components'],
      silenceDeprecations: ['legacy-js-api']
    }).on('error', gulpSass.logError))
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('css'));
};

// Compile component SCSS into the same folder as its source
const componentSassTask = () => {
  return gulp.src('components/**/*.scss', { base: 'components' })
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(gulpSass({
      includePaths: ['scss', '../basekit/scss', '../basekit/components'],
      silenceDeprecations: ['legacy-js-api']
    }).on('error', gulpSass.logError))
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('components'));
};

// Watch both SCSS sources
const watchTask = () => {
  gulp.watch('scss/**/*.scss', sassTask);
  gulp.watch('components/**/*.scss', componentSassTask);
};

// Default build compiles both
gulp.task('default', gulp.series(sassTask, componentSassTask));
gulp.task('watch', watchTask);

