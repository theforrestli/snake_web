var gulp = require('gulp');
var path = require('path');

var less = require('gulp-less-sourcemap');
var shell = require('gulp-shell');
var babel = require('gulp-babel');

gulp.task('shrinkwrap', shell.task('npm shrinkwrap'));

gulp.task('less', function () { return gulp.src('./css/main.less')
  .pipe(less({
    paths: [ path.join(__dirname, 'node_modules','bootstrap', 'less') ],
    sourceMap: {
      sourceMapFileInline: false
    }
  }))
  .pipe(uncss({
    html: ['index.debug.html']
  }))
  .pipe(gulp.dest('./css/'));
});
gulp.task('html',function(){ return gulp.src('index.mustache')
    .pipe(mustache({
      ext: ""
    }))
    .pipe(gulp.dest("index.debug.html"));
});
gulp.task('js',function(){
  return gulp.src('js/main.js')
    .pipe(babel({
      sourceMaps: true
    }))
    .pipe(gulp.dest('js/main.min.js'));
});

gulp.task('build',['less', 'html', 'js']);

