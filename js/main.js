require.config({
	paths: {
		'jquery': 'lib/jquery-1.11.2.min',//如果在另一台主机上，可以直接指定网址
	  'math': 'math',
	  'lightbox': 'lightbox'
	},
	shim: {
		'lightbox':{
			deps: ['jquery'],
			exports: 'lightbox'
		}
	}
});
require(['jquery','lightbox'],function(jquery,lightbox){
	var $ = jQuery;
	$(function(){
		var lightbox = new Lightbox();
	});
	//alert(require === requirejs);
});