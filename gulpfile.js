var gulp = require('gulp');
var path = require('path');
var less = require('gulp-less');
var shell = require('gulp-shell');
var babel = require('gulp-babel');
var mustache = require('gulp-mustache');
var uncss = require('gulp-uncss');
var ext_replace=require('gulp-ext-replace');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var browserify = require('gulp-browserify');

var browserSync = require("browser-sync").create();
var reload=browserSync.reload;

gulp.task('shrinkwrap', shell.task('npm shrinkwrap'));

gulp.task('less', function () { return gulp.src('./css/main.less')
  .pipe(sourcemaps.init())
  .pipe(less({
    paths: [ path.join(__dirname, 'node_modules','bootstrap', 'less') ],
  }))
  .pipe(sourcemaps.write('./'))
  .pipe(gulp.dest('css/'));
});
gulp.task('html',function(){ return gulp.src('index.mustache')
  .pipe(mustache({
    ext: ""
  }))
  .pipe(ext_replace('.debug.html'))
  .pipe(gulp.dest("./"));
});
gulp.task('babel', function(){
  gulp.src('js6/**/*.js')
    .pipe(sourcemaps.init())
    .pipe(babel())
    .on('error', swallowError)
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('js/'));
})

gulp.task('js',['babel'],function(){

  gulp.src('js/test/main.js')
    .pipe(ext_replace('.min.js'))
    .pipe(sourcemaps.init())
    .pipe(browserify({
      debug:true
    }))
    .on('error', swallowError)
    .pipe(uglify())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('js/test'));

  gulp.src('js/main.js')
    .pipe(ext_replace('.min.js'))
    .pipe(sourcemaps.init())
    .pipe(browserify({
      debug:true
    }))
    .on('error', swallowError)
    .pipe(uglify())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('js'));
});
gulp.task('build',['less', 'html', 'js']);

gulp.task('html2', function(){ return gulp.src('index.mustache')
  .pipe(mustache({
    ext: ".min"
  }))
  // .pipe(html_minify())
  .pipe(ext_replace('.html'))
  .pipe(gulp.dest("./"));
});
gulp.task('less2', ['html2'], function () { return gulp.src('./css/main.css')
  .pipe(uncss({
    html: ['index.html']
  }))
  .pipe(ext_replace('.min.css'))
  .pipe(gulp.dest("./"));
});
gulp.task('build2',['less2', 'html2', 'js']);
gulp.task('serve', ['build'], function () {
  browserSync.init({
    server: {
      baseDir: "./",
      index: "index.debug.html"
    }
  });
  gulp.watch(['css/**/*.less'],['less',reload]);
  gulp.watch(['index.mustache','partials/**'], ['html',reload]);
  gulp.watch(['js6/**'],['js',reload]);
});

function swallowError (error) {
  console.log(error.toString());
  this.emit('end');
}
