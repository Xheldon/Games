var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var sass = require('gulp-sass');
var browserify = require('gulp-browserify');
var plumber = require('gulp-plumber');//错误处理，避免因为保存js时候watch任务检测js错误而中断gulp执行
var uglify = require('gulp-uglify');

// 静态服务器
gulp.task('server', ['sass'], function() {
    browserSync.init({
        server: {
            baseDir: "./"
        }
    });
    gulp.watch("app/sass/*.scss", ['sass']);
    gulp.watch("app/js/*.js", ['js']);
    gulp.watch("*.html").on('change', browserSync.reload);
});

gulp.task('js', function () {
    return gulp.src('app/js/*.js')
        .pipe(plumber())
        .pipe(browserify())
        // .pipe(uglify())
        .pipe(gulp.dest('static/js/'))
        .pipe(browserSync.stream());
});

gulp.task('sass', function(){
    return gulp.src('app/sass/*.scss')
        .pipe(plumber())
        .pipe(sass())
        .pipe(gulp.dest('static/css'))
        .pipe(browserSync.stream());
});