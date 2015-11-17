var gulp = require('gulp');
var path = require('path');
var less = require('gulp-less');
var shell = require('gulp-shell');
var mustache = require('gulp-mustache');
var uncss = require('gulp-uncss');
var ext_replace=require('gulp-ext-replace');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');

var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var watchify = require('watchify');
var babel = require('babelify');

var gutil = require('gulp-util');

var browserSync = require("browser-sync").create();
var reload=browserSync.reload;

var jsConfigs = [
  {
    inPath: "js6/main.js",
    outDir: "js",
    outFile:"main.js",
    bundler: undefined
  },{
    inPath: "js6/test/main.js",
    outDir: "js/test",
    outFile:"main.js",
    bundler: undefined
  }
]
function rebundle(cfg){
  cfg.bundler.bundle()
    .on('error', swallowError)
    .pipe(source(cfg.outFile))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(cfg.outDir));
}

gulp.task('shrinkwrap', shell.task('npm shrinkwrap'));

gulp.task('less', function () { return gulp.src('./less/main.less')
  .pipe(sourcemaps.init())
  .pipe(less({
    paths: [ path.join(__dirname, 'node_modules','bootstrap', 'less') ],
  }))
  .pipe(sourcemaps.write('./'))
  .pipe(gulp.dest('css/'));
});
gulp.task('html',function(){ return gulp.src('./*.mustache')
  .pipe(mustache({
    ext: ""
  }))
  .pipe(ext_replace('.debug.html'))
  .pipe(gulp.dest("./"));
});

gulp.task('js', function(){
  jsConfigs.forEach(function(cfg){
    if(cfg.bundler == null){
      cfg.bundler = watchify(browserify(cfg.inPath, { debug: true }).transform(babel));
    }
    rebundle(cfg);
  });
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
  gulp.watch(['js6/**/*.js'],['js',reload]);
});

function swallowError (error) {
  console.error(error.message);
  this.emit("end");
}
