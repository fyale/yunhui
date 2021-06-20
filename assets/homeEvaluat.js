//打点
let funNum;
let cid;
let prodId;
// 获取url中cid的值
function GetRequest() {
   var theRequest;
   var url = location.search; //获取url中"?"符后的字串
    // url = "https://tips-res-drcn.dbankcdn.com/EMUISpeaker/0070/EMUI8.0/C001B001/zh-CN/index.html?cid=11055"
   if (url.indexOf("?") != -1) {    //判断是否有参数
      var str = url.substr(1);      //从第一个字符开始 因为第0个是?号 获取所有除问号的所有符串
      strs = str.split("=");        //用等号进行分隔 （因为知道只有一个参数 所以直接用等号进分隔 如果有多个参数 要用&号分隔 再用等号进行分隔）
      theRequest = strs[1];         //直接弹出第一个参数 （如果有多个参数 还要进行循环的）
   }
   return theRequest;
}
// 上报数据
function report(funNum,result,tags,evaluate,cid){
    var biJson = {};
    if(document.getElementsByTagName('meta')['businessLabel']){
        biJson.product = document.getElementsByTagName('meta')['businessLabel'].content;
    }else{
        biJson.product = "GT2";
    }
    biJson.funNum = funNum;
    biJson.result = result;
    biJson.tags = tags;
    biJson.evaluate = evaluate;
    biJson.cid = cid;
    if(window.JsInteraction&&window.JsInteraction.setBIEventNew){
        let BIStr = JSON.stringify(biJson);
        window.JsInteraction.setBIEventNew('',2040066,BIStr,'BI_EVENT');
    }else{
        if(typeof(_hasdk)!="undefined"){
            _hasdk.sendData('dadian',funNum,biJson);
        }
    }
    //  console.log(biJson);
}
if(document.getElementsByClassName("wrap").length>0){
    funNum = document.getElementsByClassName("wrap")[0].id;
}
report("首页",0,{},"",cid);