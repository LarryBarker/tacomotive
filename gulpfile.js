// Load plugins
const browsersync = require("browser-sync").create();
const gulp = require("gulp");

// Copy third party libraries from /node_modules into /public
gulp.task('vendor', function (cb) {

    // Bootstrap
    gulp.src([
        './node_modules/bootstrap/dist/css/*'
    ])
        .pipe(gulp.dest('./public/css'))

    // Bootstrap
    gulp.src([
        './node_modules/bootstrap/dist/js/*'
    ])
        .pipe(gulp.dest('./public/js'))

    // jQuery
    gulp.src([
        './node_modules/jquery/dist/*',
        '!./node_modules/jquery/dist/core.js'
    ])
        .pipe(gulp.dest('./public/js'))

    cb();

});

// BrowserSync
function browserSync(done) {
    browsersync.init({
        server: {
            baseDir: "./"
        }
    });
    done();
}

// BrowserSync Reload
function browserSyncReload(done) {
    browsersync.reload();
    done();
}

// Watch files
function watchFiles() {
    gulp.watch("./css/*", browserSyncReload);
    gulp.watch("./**/*.html", browserSyncReload);
}

gulp.task("default", gulp.parallel('vendor'));

// dev task
gulp.task("dev", gulp.parallel(watchFiles, browserSync));
