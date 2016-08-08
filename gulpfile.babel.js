import _gulp from 'gulp';
import gulpHelp from 'gulp-help';
import babel from 'gulp-babel';
import eslint from 'gulp-eslint';
import del from 'del';
import path from 'path';
import nodemon from 'gulp-nodemon';
import mocha from 'gulp-spawn-mocha';
import plumber from 'gulp-plumber';
import sourcemaps from 'gulp-sourcemaps';
import colors from 'colors';
import watch from 'gulp-watch';

const gulp = gulpHelp(_gulp);
const src = 'src',
    srcPath = path.resolve(src),
    srcExtension = 'js',
    srcGlob = srcPath + '/**/*.' + srcExtension,
    conf = 'conf',
    confPath = path.resolve(conf),
    confExtensions  = '{json, js}',
    confSrcExtension  = 'js',
    confGlob = confPath + '/**/*.' + confExtensions,
    confSrcGlob = confPath + '/**/*.' + confSrcExtension,
    lib = 'lib',
    libPath = path.resolve(lib),
    libExtension = 'js',
    libGlob = libPath + '/**/*.' + libExtension,
    test = 'test',
    testPath = path.resolve(test),
    testExtension = 'spec.js',
    testGlob = testPath + '/**/*.' + testExtension,
    entryFile    = 'app.js';

gulp.task('default', ['dev']);

gulp.task('clean' , () => {
    return del(libGlob, () => {});
});

gulp.task('compile', () => {
  return gulp.src([srcGlob, confSrcGlob])
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(libPath));
});

gulp.task('build-raw', ['clean', 'compile']);

gulp.task('eslint', () => {
    return gulp.src([srcGlob, confSrcGlob])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('unit-tests', () => {
    return gulp.src(testGlob)
        .pipe(mocha({
            compilers: 'js:babel-register',
            require: 'babel-polyfill'
        }));
});

gulp.task('test', ['eslint', 'unit-tests']);

gulp.task('build', ['build-raw', 'test']);

gulp.task('dev', ['build-raw', 'watch', 'nodemon']);

gulp.task('watch', () => {
    return watch([srcGlob, confSrcGlob], ['build-raw'], (file) => {
        let path = file.path,
        event = file.event;

        if (event === "unlink") {
            event = "removed";
        }
        console.log(colors.blue(event + ': ') + colors.magenta(path));

        gulp.start('build-raw');
    });
});

gulp.task('nodemon', () => {
    nodemon({
        script: entryFile,
        ext: '',
        watch: [libGlob, confGlob]
    });
});
