var XHR_PROXY_PORT_NAME_ = 'baNdit_XHRProxy_';

function setupImageCheckerProxy() {
	chrome.extension.onConnect.addListener(function(port) {
		if (port.name != XHR_PROXY_PORT_NAME_)
			return;
		
		port.onMessage.addListener(function(xhrOptions) {
			var xhr = $.ajax({
				async: false,
				type: "HEAD",
				url: xhrOptions.url,
				timeout: xhrOptions.timeout,
				complete : function(xhr, status) {
					switch(status) {
						case "success":
							port.postMessage({data: xhr.getResponseHeader("Content-Type")});
							break;
						default:
							port.postMessage({data: ""});
							break;
					}
				},
			});
		});
	});
}

var baNdit_isImage = undefined;

function proxyIsImage(xhrOptions) {
	baNdit_isImage = undefined;
	xhrOptions = xhrOptions || {};

	var reImageContentType = /image\/(jpeg|pjpeg|gif|png|bmp)/i;

	var port = chrome.extension.connect({name: XHR_PROXY_PORT_NAME_});
	
	port.onMessage.addListener(function(msg) {
		baNdit_isImage = reImageContentType.test(msg.data);
	});
	
	port.postMessage(xhrOptions);
}