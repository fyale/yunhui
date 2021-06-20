window.onload = function(){
  var swiper = new Swiper('.swiper-container', {
  // effect: 'coverflow',
  initialSlide: 0,
  grabCursor: true,
  slidesPerView: 'auto',
  centeredSlides: true,
  spaceBetween: 0,
  autoplay: {
    delay: 2500,
    disableOnInteraction: false,
  },
  loop: true,
  roundLengths : true, 
});
}

function getOpen(target,arr,node){
    if(target.children[0].classList.contains("act")){
      target.children[0].classList.remove("act");
      target.nextElementSibling.style.display = "none";
      if(node=="father"){
        target.parentNode.setAttribute('style', 'border-bottom-color:rgba(0, 0, 0, 0.05)');
        obj.father = null;
      }
      if(node=="son"){
        obj.son = null;
      }
      sessionStorage.setItem("id",JSON.stringify(obj));
    }else{
      for(let i = 0;i<arr.length;i++){
        arr[i].children[0].classList.remove("act");
        arr[i].nextElementSibling.style.display = "none";
        arr[i].parentNode.setAttribute('style', 'border-bottom-color:rgba(0, 0, 0, 0.05)');
      }  
      target.parentNode.setAttribute('style', 'border-bottom-color:rgba(0, 0, 0, 0)');
      target.children[0].classList.add("act");
      target.nextElementSibling.style.display = "block";
      if(node=="father"){
        obj.father = target.index;
      }
      if(node=="son"){
        obj.son = target.index;
      }
      sessionStorage.setItem("id",JSON.stringify(obj));
    }
  }
  function setOpen(Arr,y,node){
    Arr[y].onclick = function (){
      let target = this;
      getOpen(target,Arr,node);
      return false;
    }
  }
let btnArr = document.querySelectorAll(".cont03 h3");
let btnArrSon = document.querySelectorAll(".cont04 h4");
let obj = {
  father:"",
  son:""
};
for (let i = 0; i < btnArr.length; i++) {
  btnArr[i].index = "father"+i;
  setOpen(btnArr,i,"father");
}
for (let j = 0; j < btnArrSon.length; j++) {
  btnArrSon[j].index = btnArrSon[j].parentNode.parentNode.parentNode.getAttribute("id") + "son"+j;
  setOpen(btnArrSon,j,"son");
}
if(sessionStorage.getItem('id')&&document.getElementById(JSON.parse(sessionStorage.getItem('id')).father)){
  let fatherId = JSON.parse(sessionStorage.getItem('id')).father;
  let sonId = JSON.parse(sessionStorage.getItem('id')).son;
  let target1 = document.getElementById(fatherId).children[1];
  target1.index = fatherId; 
  getOpen(target1,btnArr,"father");
  if(document.getElementById(sonId) != null){
    let target2 = document.getElementById(sonId).children[0];
    target2.index = sonId;
    getOpen(target2,btnArrSon,"son");
  }
}
