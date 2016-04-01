/**
 * Generates all SVG and PNG logo variations from a single SVG template.
 *
 * The generated files are stored at 'assets' (or whatever value of '*_dist' variables) folder.
 * There are 4 types of output that can be used (copied to desired location):
 *
 * (1) SVG files located at 'assets/svg' and generated directly from 'src/template.svg'
 * (2) PNG files located at 'assets/png' and generated from all the SVG files from previous step
 * (3) ICO files located at 'assets/ico' and generated from 'assets/png/logo_512@2x.png'
 * (4) SVG SPRITE files located at 'assets/sprite' in two format, symbol and css,
 *
 * @link          http://pyrocms.com/
 * @author        PyroCMS, Inc. <support@pyrocms.com>
 * @author        Adnan M.Sagar, PhD. <adnan@websemantics.ca>
 */

var gulp           = require("gulp");
var template       = require("gulp-nunjucks-render");
var rename         = require("gulp-rename");
var minify         = require("gulp-svgmin");
var sprite 	  	   = require("gulp-svg-sprite");
var svg2png 	     = require("gulp-svg2png");
var favicons       = require("gulp-favicons");

var svg_template   = 'src/template.svg';
var index_template = 'src/template.html';
var index_dist 	   = 'assets/';
var png_dist 	     = 'assets/png/';
var svg_dist 	     = 'assets/svg/';
var ico_dist 	     = 'assets/ico/';
var sprite_dist    = 'assets/sprite/';

var white_fill     = '#ffffff';
var brand_fill     = '#61269E';

/* Preview index.html */
var files          = {svg:[],png:[]};

/*
	List of all required PNG files and sizes for both, logo and logo+text
	key : file name
	value : 'svg' and image configs
*/

var logo_variants  = {
  'logo-inverted' : {
    svg : {
       symbol_fill: white_fill,
       background_fill: brand_fill,
       scale: 0.1
    },
    img : {
      height : [512,128,32,16]
    }
  },
  'logo' : {
    svg : {
       symbol_fill: brand_fill,
       scale: 0.1
    },
    img : {
      height : [512,128,32,16]
    }
  },
  'logo-full' : {
    svg : {
       symbol_fill: brand_fill
    },
    img : {
      height :[512,128,32,16]
    }
  },
  'logo-text' : {
    svg : {
      show_text: true,
      symbol_fill: brand_fill,
      text_fill: brand_fill,
      scale: 0.5
    },
    img : {
      height :[512,128,32,16]
    }
  },
  'logo-text-full' : {
    svg : {
      show_text: true,
      symbol_fill: brand_fill,
      text_fill: brand_fill,
    },
    img : {
      height :[512,128,32,16]
    }
  },
  'logo-text-inverted' : {
    svg : {
      show_text: true,
      symbol_fill: white_fill,
      text_fill: white_fill,
      background_fill: brand_fill,
      scale: 0.5
    },
    img : {
      height :[512,128,32,16]
    }
   }
	};

  /*
    Info used to generate ICO files
  */
  var fav_icon = {
          appName: "PyroCMS",
          appDescription: "Built for everyone",
          developerName: "Ryan Thompson",
          developerURL: "https://github.com/RyanThompson",
          background: "#fff",
          path: ico_dist,
          url: "http://pyrocms.com/",
          display: "standalone",
          orientation: "portrait",
          version: 1.0,
          logging: false,
          online: false,
          replace: true
  };

  /*
    Config params for the SVG Sprite Generator
  */
  var svg_sprite_config   = {
      mode                : {
          view            : {
              bust        : false,
              render      : {
                  css    : true
              }
          },
          symbol          : true
      }
  };

/**
 * Generate SVG files from the logo template
 *
 * @param {filename} string, the output filename
 * @param {data} array, the template data
 * @return {stream}.
 */

function svg(filename, data)
{
    data = JSON.parse(JSON.stringify(data)); /* clone */

    /* Oddly behaving scale factor, range 1 (full size) to 0.1, smallest )*/
    var scale                = data['scale'] || 1;

    data['text_fill']        = data['text_fill'] || '';
    data['width']            = data['width'] || (data['show_text'] ? 1405 : 512);
    data['height']           = data['height'] || 512;
    data['show_text']        = data['show_text'] || false;
    data['background_fill']  = data['background_fill'] || 'none';
    data['transform_symbol'] = data['show_text'] ? 'translate(950)' : 'translate(0)';   ;

    data['viewbox_x']        = data['viewbox_x'] || 0;
    data['viewbox_y']        = data['viewbox_y'] || 0;
    data['viewbox_width']    = data['viewbox_width'] || data['width'];
    data['viewbox_height']   = data['viewbox_height'] || data['height'];

    /* Apply the scale via the document viewbox */
    data['viewbox_x']        = data['viewbox_x'] - (1-scale) * data['width'] / 2;
    data['viewbox_y']        = data['viewbox_y'] - (1-scale) * data['height'] / 2;
    data['viewbox_width']    = data['width'] + data['width'] * (1-scale);
    data['viewbox_height']   = data['height'] + data['height'] * (1-scale);

    /* Append file */ files.svg.push(filename);

  	return gulp.src(svg_template)
		.pipe(template({ext:'.svg', data: data}))
		.pipe(minify())
		.pipe(rename(filename + '.svg'))
		.pipe(gulp.dest(svg_dist));
}


/**
 * Generate PNG file from an svg image
 *
 * @param {filename} string, the svg filename without extension
 * @param {height} int, the height in pixels
 * @return {void}.
 */

function png(filename, height)
{
  var scale = height / 512;

  /* Append file */ files.png.push({name: filename + '_'+ height , height: height });

  /* Generate normal image */
    gulp.src(svg_dist+filename + '.svg')
        .pipe(svg2png([scale]))
        .pipe(rename(filename + '_'+ height + '.png'))
        .pipe(gulp.dest(png_dist));

    /* Append file */ files.png.push({name: filename + '_'+ height +'@2x', height: height });

    /* Generate retina image */
    return gulp.src(svg_dist+filename + '.svg')
        .pipe(svg2png([scale * 2]))
        .pipe(rename(filename + '_' + height +'@2x.png'))
        .pipe(gulp.dest(png_dist));

};

// ---------------------------------------------------
// TASK : default - Generate index.html
// ---------------------------------------------------

gulp.task('default', ['process-favicons'], function() {

  return gulp.src(index_template)
  .pipe(template({ext:'.html', data: files}))
  .pipe(rename('index.html'))
  .pipe(gulp.dest(index_dist));

});

// ---------------------------------------------------
// TASK : process SVG sprites
// ---------------------------------------------------

gulp.task('process-sprites', ['process-favicons'], function() {

	return gulp
			.src(svg_dist+'*.svg')
			.pipe(sprite(svg_sprite_config ))
			.pipe(gulp.dest(sprite_dist));

});

// ---------------------------------------------------
// TASK : process-favicons
// ---------------------------------------------------

gulp.task('process-favicons', ['process-png'], function() {

    return gulp
		    .src(png_dist+'logo-inverted_512@2x.png') /* or logo_512@2x.png */
		    .pipe(favicons(fav_icon))
		    .on('error', function(){})
		    .pipe(gulp.dest(ico_dist));

});

// ---------------------------------------------------
// TASK : process-png
// ---------------------------------------------------

gulp.task('process-png', ['process-svg'], function() {

	var stream = gulp;

	/* Generate all PNG files */
	for (var filename in logo_variants) {

		var img = logo_variants[filename].img;

		/* Generate all icons */
		for (var i in img.height) {
			stream = png(filename, img.height[i]);
		}

	}

	return stream;
});

// ---------------------------------------------------
// TASK : process-svg
// ---------------------------------------------------

gulp.task('process-svg', function() {

  var stream = gulp;

	for (var filename in logo_variants) {
		stream = svg(filename , logo_variants[filename].svg);
	}

	return stream;
});
