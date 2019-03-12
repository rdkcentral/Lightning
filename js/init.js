window.onload = function() {
	window.addEventListener('resize', function(event){
		resizeIframe();
	});

	function resizeIframe(){
		const maxWidth = 600;
		if (document.getElementById('live-demo__iframe')){
			if (window.innerWidth < maxWidth){
				document.getElementById('live-demo__iframe').style.height = document.getElementById('live-demo__iframe').offsetWidth+'px';
			} else {
				document.getElementById('live-demo__iframe').style.height = null;
			}
		}
	}

	function refresh(){
		var code = editor.getValue();
		var iframe = document.getElementById('live-demo__iframe'),
			iframeWin = iframe.contentWindow || iframe,
			iframeDoc = iframe.contentDocument || iframeWin.document;

		iframeDoc.open();
		iframeDoc.write('<style type="text/css" media="screen">body {padding: 0; margin:0}</style>');
		iframeDoc.write('\<script src="/Lightning/js/lightning/lib/lightning-web.js" type="text/javascript" charset="utf-8">\<\/script>');
		iframeDoc.write('\<script src="/Lightning/js/canvasExample.js" type="text/javascript" charset="utf-8">\<\/script>');
		iframeDoc.write('\<script src="/Lightning/js/lightning/src/ux.js" type="module" charset="utf-8">\<\/script>');
		iframeDoc.write('\<script>window.onload = function() {'+code+' resizeCanvas();}\<\/script>');
		iframeDoc.close();
	}

	if (document.getElementsByClassName('language-jsLightning') && document.getElementsByClassName('language-jsLightning')[0]){
		let el = document.getElementsByClassName('language-jsLightning')[0];
		let parentCon = document.createElement('div');
		parentCon.id = 'live-demo';
		el.parentNode.parentNode.insertBefore(parentCon, el.parentNode);
		parentCon.appendChild(el.parentNode);

		let iframe = document.createElement('iframe');
		iframe.id = 'live-demo__iframe';
		iframe.scrolling = 'no';
		parentCon.insertBefore(iframe, el.parentNode);
		el.parentNode.id = 'live-demo__editor';
		resizeIframe();
	}

	if (document.getElementById('live-demo__editor')){
		var editor = ace.edit('live-demo__editor');
		editor.setOptions({
			wrap: true,
			maxLines: Infinity
		});
		editor.setTheme("ace/theme/monokai");
		editor.session.setMode("ace/mode/javascript");
		editor.on("change", function(e){
			refresh();
		})
		refresh();
	}
}
