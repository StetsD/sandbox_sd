//Require plugins
var gulp = require('gulp'),
		sass = require('gulp-sass'),
		jade = require('gulp-jade'),
		concat = require('gulp-concat'),
		jshint = require('gulp-jshint'),
		merge = require('merge-stream'),
		uglify = require('gulp-uglify'),
		newer = require('gulp-newer'),
		bs = require('browser-sync');
		
//Utility vars
var path = {
	dev : 'dev/',
	app : 'app/'
}

//Js link
gulp.task('lint', function(){
	return gulp.src([path.dev + 'js/**/*.js', '!' + path.dev + 'js/require.js', '!' + path.dev + 'js/vendor/**/*.js'])
	pipe(jshint())
	.pipe(jshint.reporter('default'));
});

//Sass compile
gulp.task('sass', function(){
	return gulp.src(path.dev + 'css/style.scss')
	.pipe(sass())
	.pipe(gulp.dest(path.app + 'css/'))
	.pipe(bs.stream());
});

//Sass compile + minify css
gulp.task('css-min', function(){
	return gulp.src(path.dev + 'css/style.scss')
	.pipe(sass({
		outputStyle: 'compressed'
	}))
	.pipe(gulp.dest(path.app + 'css/'));
});

//Jade compile
gulp.task('jade', function(){
	return gulp.src(path.dev + '*.jade')
	.pipe(jade({
		pretty: true
	}))
	.pipe(gulp.dest(path.app))
	.pipe(bs.stream());
});

//js dev compile
gulp.task('js', function(){
	var vendor = gulp.src(path.dev + 'js/vendor/*.js')
	.pipe(concat('vendor.js'))
	.pipe(gulp.dest(path.app + 'js'))
	.pipe(bs.stream());

	var custom = gulp.src(path.dev + 'js/custom/*.js')
	.pipe(concat('custom.js'))
	.pipe(gulp.dest(path.app + 'js'))
	.pipe(bs.stream());

	var common = gulp.src([path.dev + 'js/**/*.js', '!' + path.dev + 'js/vendor/**/*.js', '!' + path.dev + 'js/custom/**/*.js'])
		.pipe(newer(path.app + '/js'))
		.pipe(gulp.dest(path.app + '/js'));

	return merge(vendor, custom, common);
});

//Js compile + minify
gulp.task('js-min', function(){
	var vendor = gulp.src(path.dev + 'js/vendor/*.js')
	.pipe(concat('vendor.js'))
	.pipe(uglify())
	.pipe(gulp.dest(path.app + 'js'));

	var custom = gulp.src(path.dev + 'js/custom/*.js')
	.pipe(concat('custom.js'))
	.pipe(uglify())
	.pipe(gulp.dest(path.app + 'js'));

	var common = gulp.src([path.dev + 'js/**/*.js', '!' + path.dev + 'js/vendor/**/*.js', '!' + path.dev + 'js/custom/**/*.js'])
		.pipe(uglify())
		.pipe(newer(path.app + '/js'))
		.pipe(gulp.dest(path.app + '/js'));

	return merge(vendor, custom, common);
});

//Image pass
gulp.task('img', function(){
	return gulp.src([path.dev + 'img/**/*'])
	.pipe(newer(path.app + '/img'))
	.pipe(gulp.dest(path.app + '/img'));
});

//Create Browser-sync server
gulp.task('serve', ['sass', 'jade'], function(){
	bs.init({
		server: path.app
	});
	gulp.watch(path.dev + 'css/**/*.scss', ['sass']);
	gulp.watch([path.dev + '*.jade', path.dev + 'templates/**/*.jade'], ['jade']);
	gulp.watch([path.dev + 'js/**/*.js', '!' + path.dev + 'js/require.js', '!' + path.dev + 'js/vendor/**/*.js'], ['lint']);
	gulp.watch(path.dev + 'js/**/*.js', ['js']);
});

gulp.task('default', ['serve', 'lint', 'sass', 'js', 'jade', 'img']);
gulp.task('deploy', ['lint', 'css-min', 'js-min', 'jade', 'img']);