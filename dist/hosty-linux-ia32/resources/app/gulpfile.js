var gulp = require('gulp');
var typescript = require('gulp-tsc');

var config = {
    paths: {
        ts: 'src/**/*.ts'
    }
}

gulp.task('compile', function(){
    gulp.src(config.paths.ts)
        .pipe(typescript({
            //out: 'bundle.js',
            module: 'commonjs',
            declaration: true,
            emitError: false
        }))
        .pipe(gulp.dest('build/js/'))
});

gulp.task('watch', function (cb) {
    gulp.watch(config.paths.ts, ['compile']);
});

gulp.task('default', ['compile','watch']);