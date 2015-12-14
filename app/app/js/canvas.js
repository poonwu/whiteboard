/**
 * Render canvas
 *
 * @author poonwu
 * @version 1.0.0
 */

(function($, _) {
	'use strict';

	// dependencies
	if (typeof $ === 'undefined') {
		throw 'jQuery not found';
	}
	else if (typeof _ === 'undefined') {
		throw 'lodash not found';
	}

	function isCanvasSupported() {
		var elem = document.createElement('canvas');
		return !!(elem.getContext && elem.getContext('2d'));
	}
	function hexToRgb(hex) {
	    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	    return result ? {
	        r: parseInt(result[1], 16),
	        g: parseInt(result[2], 16),
	        b: parseInt(result[3], 16)
	    } : null;
	}
	// whiteboard class
	var Whiteboard = function(jqObj, jqGlobal, options) {

		// global instances
		var vm = this;
		this.canvas = jqObj.get(0);
		this.context = this.canvas.getContext('2d');

		// canvas setting
		this.canvas.width = options.width;
		this.canvas.height = options.height;

		// whiteboard setting
		this.sprite =
		this.strokeColor = options.strokeColor;
		this.strokeSize = options.strokeSize;
		this.strokeOpacity = options.strokeOpacity;
		this.state = 'mouseup';
		this.lastPoint = {};
		this.curPoint = {};

		// whiteboard functions
		this.startLine = function(x, y) {
			this.lastPoint = this.getCanvasPoint(x, y);
		};
		this.endLine = function(x, y) {
			this.curPoint = this.getCanvasPoint(x, y);
			this.drawLine(this.lastPoint.x, this.lastPoint.y, this.curPoint.x, this.curPoint.y);
			this.lastPoint = this.curPoint;
		};
		this.drawLine = function(x0, y0, x1, y1) {
			// bresenham line algorithm
			var dx = Math.abs(x1 - x0),
				sx = x0 < x1 ? 1 : -1;
			var dy = Math.abs(y1 - y0),
				sy = y0 < y1 ? 1 : -1;
			var err = (dx > dy ? dx : -dy) / 2;

			while (true) {
			  this.drawBrush(x0, y0);
			  if (x0 === x1 && y0 === y1) {
			  	break;
			  }
			  var e2 = err;
			  if (e2 > -dx) {
			  	err -= dy;
			  	x0 += sx;
			  }
			  if (e2 < dy) {
			  	err += dx;
			  	y0 += sy;
			  }
			}
		};
		this.drawBrush = function(x, y) {
			this.context.drawImage(this.brush, x - this.brush.width/2, y - this.brush.height/2, this.brush.width, this.brush.height);
		};
		this.drawBrushCursor = function(x, y) {
			var pt = this.getCanvasPoint(x, y);
			this.context.save();
			this.context.globalCompositeOperation = 'multiply';
			this.context.strokeStyle = '#B3B3B3';
			this.context.beginPath();
      		this.context.arc(pt.x - this.strokeSize/2, pt.y - this.strokeSize/2, this.strokeSize/2, 0, 2 * Math.PI, false);
      		this.context.stroke();
      		this.context.restore();
		}
		this.createBrush = function() {
			var color = hexToRgb(this.strokeColor);
			var alpha = 255;
			var image = this.context.createImageData(this.strokeSize, this.strokeSize);
			var radius = this.strokeSize/2;
			var makePixelIndexer = function(width){
				return function(i,j){
					var index = j*(width*4) + i*4;
					return index;
				};
			};
			var pixelIndexer = makePixelIndexer(this.strokeSize);
			var pixelData = image.data;
			var drawPixel = function(x,y,rgb,a) {
				 var idx = pixelIndexer(x,y);
				 // out of bound
				 if(idx >= pixelData.length || idx < 0) {
				 	return;
				 }
				 pixelData[idx] = rgb.r;	//red
				 pixelData[idx+1] = rgb.g;	//green
				 pixelData[idx+2] = rgb.b;	//blue
				 pixelData[idx+3] = a;	//alpha
			};

			var x = 0,
				y = 0;

			for (y = 0; y < this.strokeSize; y++) {
				for (x = 0; x < this.strokeSize; x++) {
					drawPixel(x,y, color, 0);
				}
			}

			for (y = -radius; y <= radius; y++) {
				for (x = -radius; x <= radius; x++) {
					if (x*x + y*y <= radius*radius) {
						drawPixel(Math.round(radius + x), Math.round(radius + y), color, alpha);
					}
				}
			}

			if (image.width === 1) {
				drawPixel(0, 0, color, alpha);
			}

			// render to temp canvas
			var tmpCanvas = document.createElement('canvas');
			tmpCanvas.width = image.width;
			tmpCanvas.height = image.height;
			tmpCanvas.getContext('2d').putImageData(image, 0, 0);
			var img = document.createElement('img');
			img.src = tmpCanvas.toDataURL('image/png');
			return img;
		};
		this.getCanvasPoint = function(x, y) {
			return {
					x: x - this.canvas.offsetLeft,
					y: y - this.canvas.offsetTop
				};
		};

		this.brush = this.createBrush();

		// add listeners
		jqGlobal.mousedown(function(e) {
			vm.state = 'mousedown';
			vm.startLine(e.pageX, e.pageY);
		});
		jqGlobal.mousemove(function(e) {
			if (vm.state === 'mousedown') {
				vm.endLine(e.pageX, e.pageY);
			}
		});
		jqGlobal.mouseup(function() {
			vm.state = 'mouseup';
		});
		/*
		jqObj.mousemove(function(e) {
			vm.drawBrushCursor(e.pageX, e.pageY);
		});*/
	};

	// jquery plugin
	$.fn.extend({
		whiteboard: function(options) {
			if (!isCanvasSupported()) {
				throw 'HTML5 Canvas is not supported';
			}
			else if ($(this).get(0).tagName !== 'CANVAS') {
				throw 'Not a canvas';
			}
			var _options = _.extend({
				width: 1200,
				height: 800,
				strokeSize: 10,
				strokeColor: '#FF0000',
				strokeOpacity: 0.1
			}, options);

			return new Whiteboard($(this), $(document), _options);
		}
	});
})(jQuery, _);
