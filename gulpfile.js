'use strict';

const gulp = require('gulp');
const gulp_tslint = require('gulp-tslint');
var sourcemaps = require('gulp-sourcemaps');
var path = require('path');
const ts = require('gulp-typescript');

gulp.task('default', ['tslint']);

gulp.task('build', () => {
    return gulp.src(['**/*.ts', '!**/*.d.ts', '!node_modules/**'])
      .pipe(gulp_tslint())
      .pipe(gulp_tslint.report());
});

var tsProject = ts.createProject('tsconfig.json');

gulp.task('build', function () {
  var tsResult = tsProject
    .src()
    .pipe(sourcemaps.init())
    .pipe(tsProject());

  return tsResult.js
    .pipe(sourcemaps.write({
      // Return relative source map root directories per file.
      sourceRoot: function (file) {
        var sourceFile = path.join(file.cwd, file.sourceMap.file);
        return path.relative(path.dirname(sourceFile), file.cwd);
      }
    }))
    .pipe(gulp.dest('./lib'));
});