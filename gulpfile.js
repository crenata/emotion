const gulp = require("gulp");
const cssMinifier = require("gulp-csso");
const jsMinifier = require("gulp-uglify");

gulp.task("css-minifier", () => {
	return gulp.src("./build/static/css/**/*.css").pipe(cssMinifier()).pipe(gulp.dest("./build/static/css"));
});

gulp.task("js-minifier", () => {
	return gulp.src("./build/static/js/**/*.js").pipe(jsMinifier()).pipe(gulp.dest("./build/static/js"));
});