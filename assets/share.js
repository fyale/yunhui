var share00=document.getElementsByClassName("share")[0];
if(window.JsInteraction && window.JsInteraction.share){
		share00.onclick = function(){
			report("分享",0,{},"",cid);
			window.JsInteraction.share("https://tips-res-drcn.dbankcdn.com/SmartWear/HUAWEI_WATCH_GT2/EMUI8.0/C001B001/zh-CN/images/share.png","HUAWEI WATCH GT 2 系列 使用指南","玩转app，这里有你想要的！","https://tips-res-drcn.dbankcdn.com/SmartWear/HUAWEI_WATCH_GT2/EMUI8.0/C001B001/zh-CN/index.html?cid=11066");
		}
}else{
	share00.style.display="none";
	document.getElementsByClassName("head_search_box")[0].setAttribute('style', 'width:100%');
}
if(window.JsInteraction && window.JsInteraction.getGooglePlayVersion && window.JsInteraction.getGooglePlayVersion()){
	share00.style.display="none";
	document.getElementsByClassName("head_search_box")[0].setAttribute('style', 'width:100%');
}
