// VARIABLES & PATHS
let preprocessor = 'sass', // Preprocessor (sass, scss)
    fileswatch = 'html, htm, txt, json, md, woff2', // List of files extensions for watching & hard reload (comma separated)
    imageswatch = 'jpg, jpeg, png, webp, svg', // List of images extensions for watching & compression (comma separated)
    baseDir = 'src' // Base directory path without «/» at the end

let paths = {
	styles: {
		src: [
            baseDir + '/' + preprocessor + '/app' + '.*',
            baseDir + '/' + preprocessor + '/vendor' + '.*',
        ],
		dest: baseDir + '/css',
    },
    scripts: {
		src: baseDir + '/js/app.js',
        dest: baseDir + '/js',
    },
    libs: {
        src: [
            'node_modules/swiper/swiper-bundle.min.js',
        ],
        dest: baseDir + '/js',
    },
	images: {
		src: [ baseDir + '!/img/sprite/**/*', baseDir + '/img/src/*.{jpg,png,svg}' ],
		dest: baseDir + '/img/dist',
    },
    sprites: {
		src: baseDir + '/img/src/sprite/*.svg',
		dest: baseDir + '/img/dist',
    },
    jsOutputName: 'app.min.js',
    libsOutputName: 'vendor.min.js'
}

// LOGIC
const { src, dest, parallel, series, watch } = require('gulp');
const sass = require('gulp-sass');
const sassglob = require('gulp-sass-glob');
const concat = require('gulp-concat');
const rename = require('gulp-rename');
const autoprefixer = require('gulp-autoprefixer');
const uglify = require('gulp-uglify-es').default;
const newer = require('gulp-newer');
const imagemin = require('gulp-imagemin');
const svgSprite = require('gulp-svg-sprite');
const del = require('del');
const browserSync = require('browser-sync').create();

function browsersync() {
	browserSync.init({
        server: { baseDir: baseDir + '/' },
        browser: "google chrome",
		notify: false
	})
}

function styles() {
    return src(paths.styles.src)
        .pipe(eval(`${preprocessor}glob`)())
        .pipe(eval(preprocessor)({ outputStyle: 'compressed' }))
        .pipe(autoprefixer({ overrideBrowserslist: ['last 10 versions'], grid: true }))
        .pipe(rename({ suffix: '.min' }))
        .pipe(dest(paths.styles.dest))
        .pipe(browserSync.stream())
}

function scripts() {
	return src(paths.scripts.src)
        .pipe(uglify())
        .pipe(rename({ suffix: '.min' }))
        .pipe(dest(paths.scripts.dest))
        .pipe(browserSync.stream())
}

function libs() {
	return src(paths.libs.src)
        .pipe(concat(paths.libsOutputName))
        .pipe(uglify())
        .pipe(dest(paths.libs.dest))
        .pipe(browserSync.stream())
}

function images() {
	return src(paths.images.src)
        .pipe(newer(paths.images.dest))
        .pipe(imagemin())
        .pipe(dest(paths.images.dest))
}

function sprites() {
    return src(paths.sprites.src)
        .pipe(svgSprite({
                mode: {
                    stack: {
                        sprite: "../sprite.svg"
                    }
                },
            }
        ))
        .pipe(dest(paths.sprites.dest))
}

function cleaningimages() {
	return del('' + paths.images.dest + '/**/*', { force: true })
}

function startwatch() {
    watch(baseDir  + '/**/*.{' + fileswatch + '}').on('change', browserSync.reload);
	watch(baseDir  + '/**/' + preprocessor + '/**/*', styles);
    watch([baseDir + '/**/*.js', '!' + paths.scripts.dest + '/*.min.js'], scripts);
    watch(baseDir  + '/img/src/**/*.{' + imageswatch + '}', images);
}

exports.cleaningimages = cleaningimages;
exports.sprites = sprites;
exports.images = images;
exports.libs = libs;
exports.scripts = scripts;
exports.styles = styles;
exports.browsersync = browsersync;
exports.default = parallel(styles, scripts, libs, images, sprites, browsersync, startwatch);