import gulp from 'gulp';
import eslint from 'gulp-eslint';
import nsp from 'gulp-nsp';
import coveralls from 'gulp-coveralls';
import excludeGitignore from 'gulp-exclude-gitignore';
import path from 'path';
import jsdoc from 'gulp-jsdoc3';
import nodemon from 'gulp-nodemon';
import istanbul from 'gulp-istanbul';
import mocha from 'gulp-mocha';
import plumber from 'gulp-plumber';


gulp.task('lint', () => {
  return gulp.src(['**/*.js'])
    .pipe(excludeGitignore())
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});


gulp.task('nsp', cb => {
  nsp({package: path.resolve('package.json')}, cb);
});


gulp.task('pre-test', () => {
  return gulp.src([
    '**/*.js',  '!gulpfile.babel.js',
    '!test/**', '!config/**',
    '!client/**'
  ])
  .pipe(excludeGitignore())
  .pipe(istanbul({
    includeUntested: true
  }))
  .pipe(istanbul.hookRequire());
});


gulp.task('test', ['pre-test'], cb => {
  var mochaErr;
  gulp.src('test/**/*.js')
    .pipe(plumber())
    .pipe(mocha({reporter: 'spec'}))
    .on('error', err => {
      mochaErr = err;
    })
    .pipe(istanbul.writeReports())
    .on('end', () => {
      cb(mochaErr);
    });
});


gulp.task('coveralls', ['test'], () => {
  if (!process.env.CI) {
    return;
  }
  return gulp.src(path.join(__dirname, 'coverage/lcov.info'))
    .pipe(coveralls());
});


gulp.task('run', () => {
  var opts = {
    script : './server/app.js',
    ignore : ['test', 'node_modules', 'gulpfile.babel.js'],
    ext    : 'js html',
    env    : {DEBUG : 'app'}
  };
  nodemon(opts);
});


gulp.task('docs', cb => {
  var config = {
    opts: {
      destination : 'docs',
      recurse     : true
    }
  };
  gulp.src([
    'Readme.md', '**/*.js', '!gulpfile.babel.js',
    '!config/**', '!test/**'
  ], {
    read: false
  })
  .pipe(excludeGitignore())
  .pipe(jsdoc(config, cb));
});


gulp.task('serve', ['run']);
gulp.task('prepublish', ['nsp']);
gulp.task('default', ['lint', 'test', 'coveralls']);
