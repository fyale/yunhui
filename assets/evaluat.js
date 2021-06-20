// 追加点赞和吐槽
function add(){
    let Ediv = document.createElement('div');
    Ediv.className = "EvaluationArea";
    Ediv.innerHTML =
    '<div  class="function-block">'+
    '<div class="function-block-item">'+
      '<a class="button praise">'+
      '<span class="change-text">点赞</span>'+
      '<span class="icon icon1"></span>'+
      '</a>'+
    '</div>'+
    '</div> '+
    '<div class="function-block " >'+
      '<div class="function-block-item">'+
        '<a class="button comment-button">'+
        '<span class="versionControl">'+
        '<span class="change-text">吐槽</span>'+
          '<span class="icon icon2"></span>'+
        '</span>'+
        '</a>'+
      '</div>'+
    '</div>';
    document.getElementById("jd-content").appendChild(Ediv);
    let Bdiv =  document.createElement('div');
    Bdiv.innerHTML =
    '<div class="mask hide">'+
    '<div class="tip">谢谢您的反馈</div>'+
    '</div>'+
    '<div class="evaluate hide">'+
      '<div class="font"></div>'+
      '<div class="evaluateHead">意见反馈</div>'+
      '<div class="evaluateContent">'+

      '</div>'+
      '<div class="result">'+
        '<span class="close">关闭</span>'+
        '<span class="submit">提交</span>'+
        '<span class="disable"></span>'+
      '</div>'+
    '</div>';
    document.body.appendChild(Bdiv);
}
    //打点
    let funNum;
    let cid;
    // 获取url中cid的值
    function GetRequest() {
       var theRequest;
       var url = location.search; //获取url中"?"符后的字串
        // url = "https://tips-res-drcn.dbankcdn.com/EMUISpeaker/0070/EMUI8.0/C001B001/zh-CN/index.html?cid=11055"
       if (url.indexOf("?") != -1) {    //判断是否有参数
          var str = url.substr(1); //从第一个字符开始 因为第0个是?号 获取所有除问号的所有符串
          strs = str.split("=");   //用等号进行分隔 （因为知道只有一个参数 所以直接用等号进分隔 如果有多个参数 要用&号分隔 再用等号进行分隔）
          theRequest = strs[1];//直接弹出第一个参数 （如果有多个参数 还要进行循环的）
       }
       return theRequest;
    }

    // 上报数据
    function report(funNum,result,tags,evaluate,cid){
        var biJson = {};
        biJson.product = "GT2";
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
    cid = GetRequest()
    // 点赞、吐槽
    window.onload = function(){
        if(document.getElementById("jd-content") != null){
            add();
        }
        //页面打点
        report(funNum,0,{},"",cid);
        // 判断是否有点赞吐槽
        if(document.getElementsByClassName("EvaluationArea").length > 0){
           //点赞
            const praise = document.querySelector(".praise");
            praise.onclick = function(){
          // 点赞的标签及代表的id
             let likeTags = [{id:"IDp001",tag:"操作方便"},{id:"IDp002",tag:"功能很有用"},{id:"IDp003",tag:"内容描述清晰"},{id:"IDp004",tag:"内容对我有帮助"}];
              getClick(likeTags);
            }

           //吐槽
           const commentButton = document.querySelector(".comment-button");
           commentButton.onclick = function(){
            //  吐槽的标签及代表的id
            let complaintsTags = [{id:"IDc001",tag:"找不到该功能"},{id:"IDc002",tag:"操作不成功"},{id:"IDc003",tag:"使用不方便"},{id:"IDc004",tag:"效果不如预期"},{id:"IDc005",tag:"内容描述不清晰"},{id:"IDc006",tag:"不能解决问题"}];
                getClick(complaintsTags);
           }

            // 添加标签等
            function getTags(tags){
                const evaluateContent = document.querySelector(".evaluateContent");
                for(let k = 0;k<tags.length;k++){
                    const span=document.createElement("span");
                    span.id=tags[k].id;
                    span.innerHTML=tags[k].tag;

                    evaluateContent.appendChild(span);
                }
                const div=document.createElement("div");
                // 创建class属性
                const pClass= document.createAttribute('class');
                pClass.value = 'Comment';
                div.setAttributeNode(pClass);
                // 创建contenteditable属性
                const contenteditable= document.createAttribute('contenteditable');
                contenteditable.value = 'true';
                div.setAttributeNode(contenteditable);
                // 创建placeholder属性
                const placeholder= document.createAttribute('placeholder');
                placeholder.value = '您还想说...';
                div.setAttributeNode(placeholder);

                evaluateContent.appendChild(div);

            }

            // 去掉标签等
            function removeTags(){
               const evaluateContent = document.querySelector(".evaluateContent");
               evaluateContent.innerHTML="";

            }
            function isSubmittable(){
                var commentValue = document.querySelector(".evaluateContent").querySelector(".Comment").innerText.trim();
                const evaluateSpan = document.querySelector(".evaluateContent").querySelectorAll(".color");
                if(commentValue != "" || evaluateSpan.length > 0){
                    document.querySelector(".disable").style.display = 'none';
                 }else{
                    document.querySelector(".disable").style.display = 'block';
                 }

            }

            //
            function getClick(tags){
                document.querySelector(".mask").classList.remove("hide");
                document.getElementsByTagName("body")[0].classList.add("band");

                // document.getElementsByTagName("video").pause();
                document.querySelector(".evaluate").classList.remove("hide");
                getTags(tags);
                // 点击标签
                const evaluateSpan = document.querySelector(".evaluateContent").getElementsByTagName("span");
                for(let i = 0;i<evaluateSpan.length;i++){
                    evaluateSpan[i].onclick = function(){
                        if(evaluateSpan[i].classList.contains('color')){
                            evaluateSpan[i].classList.remove("color")
                        }else{
                            evaluateSpan[i].classList.add("color")
                        }
                        isSubmittable();
                    }
                }

                // 开放式评价
                document.querySelector(".evaluateContent .Comment").onkeyup = function(){
                    isSubmittable();
                }

                // 取消点赞或吐槽
                document.querySelector(".close").onclick = function(){
                    removeTags();
                    document.querySelector(".disable").style.display = "block";
                    document.querySelector(".evaluate").classList.add("hide");
                    document.querySelector(".mask").classList.add("hide");
                    document.getElementsByTagName("body")[0].classList.remove("band");
                }

                // 箭头取消点赞吐槽
                document.querySelector(".font").onclick = function(){
                    document.querySelector(".evaluateContent").innerHTML="";
                    document.querySelector(".disable").style.display = "block";
                    document.querySelector(".evaluate").classList.add("hide");
                    document.querySelector(".mask").classList.add("hide");

                }


                // 提交上报数据
                document.querySelector(".submit").onclick = function(){
                    let w;        //分类是点赞还是吐槽
                    let arrTags = {};//点击的标签
                    let e = "";         //开放式评价
                    const eSpan = document.querySelector(".evaluateContent").getElementsByTagName("span");
                    for(let i = 0;i < eSpan.length;i++){
                        let r = eSpan[i].id;
                        w = r.split("")[2];
                        if(eSpan[i].classList.contains('color')){
                            arrTags[r] = eSpan[i].innerText;
                        }
                    }

                    var commentValue = document.querySelector(".evaluateContent").querySelector(".Comment").innerText.trim();
                   // console.log(commentValue.trim())
                    if(commentValue !=""){
                        e = commentValue.trim();
                        // 敏感词过滤
                        //字符串尾位和之前的三位以内（不包含）由*星号替换
                        function getEndString(str){
                            return str.length<4? new Array(str.length+1).join("*"):str.substr(0,str.length-3) + new Array(4).join("*")
                        }
                        //字符串保留首位，之后十位以内由*星号替换
                        function getHomeString(str){
                            return str.length<11?str.substr(0,1)+new Array(str.length).join("*"):str.substr(0,1)+new Array(11).join("*")+str.substr(11)
                        }
                        //过滤邮箱——匹配@符号，对前三个字符进行替换为星号
                        let arrString01 = [];
                        let strNew01 = '';
                        arrString01 = e.split("@");
                        for(var m = 0; m<arrString01.length-1;m++){
                            strNew01 = strNew01 + getEndString(arrString01[m])+"@";
                        }
                        e = strNew01+arrString01[arrString01.length-1];
                        //[0-9]{6,13}"正则匹配数字，替换为等长6个星号。
                        e = e.replace(/[0-9]{6,13}/g,"******");
                        //address后面10个字符替换为星号。如果不够10个字符，就都替换为星号。
                        let arrString03 = [];
                        let strNew03 = '';
                        arrString03 = e.split("address");
                        for(var n = 1; n<arrString03.length;n++){
                            strNew03 = strNew03 + "address" + getHomeString(arrString03[n]);
                        }
                        e = arrString03[0] + strNew03;
                        // 过滤防止脚本攻击
                        e = e.replace(/</g,"&gt;");
                        e = e.replace(/>/g,"&lt;");

                    }
                    if(w=="p"){
                        report(funNum,"like",arrTags,e,cid);
                    }
                    if(w=="c"){
                        report(funNum,"complaint",arrTags,e,cid);
                    }
                    document.querySelector(".disable").style.display = "block";
                    removeTags();
                    document.querySelector(".evaluate").classList.add("hide");
                    setTimeout(function(){
                        document.querySelector(".mask").classList.add("hide");
                        document.getElementsByTagName("body")[0].classList.remove("band");
                    },1000)
                }
            }
        }
    }
