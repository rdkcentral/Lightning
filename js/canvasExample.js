function resizeCanvas(){
	var maxWidth = 784;
	document.getElementsByTagName("canvas")[0].style['transform-origin'] = '0 0';
	if (window.innerWidth < maxWidth){
		var scale = window.innerWidth / maxWidth;
		document.getElementsByTagName("canvas")[0].style.transform = 'scale('+scale+')';
	} else {
		document.getElementsByTagName("canvas")[0].style.transform = null;
	}
}

window.addEventListener('resize', function(event){
	//editor.resize();
	resizeCanvas();
	
});
