$(function(){
	var valuestr = document.getElementById("searchtext");
	valuestr.value = '';
	valuestr.innerHTML = valuestr;
	valuestr.focus();
	var t=$("#searchtext").val();
    $("#searchtext").val("").focus().val(t);

	$("#searchtext").bigAutocomplete({
		width:window.innerWidth,
		data:titledata,
		callback:function(data){
			tishi.style.display = "none";
			window.location.href=data.result;
		}
	});


	$("#searchtext").keydown();
	$("#searchtext").keyup();
	$("#searchtext").focus();
})
var clearValue = $(".head_searchClear")[0];
var tishi = $(".tishi")[0];
var tishi_out = $(".tishi_out")[0];
var oShade = $(".shade")[0];
var searchValue = $("#searchtext")[0];

searchValue.oninput = function(){
	if(searchValue.length <= 0){
		// clearValue.style.display = 'none';
		oShade.style.display = "block";
	}else{
		search();
	}
}

function search() {
	var search_value = document.getElementById('searchtext').value;
	var key = titledata;


	for(i=0;i<titledata.length;i++)
	{

		clearValue.style.display = 'block';
	   if(search_value == key[i].title)
	   {
		tishi.style.display = "none";
	      window.location.href=key[i].result;
		  return;
	   }
	}

    if(gflag != 1)
	{
	   tishi.style.display = "block";
	   oShade.style.display = "none";

	}

}
function entersearch(){
        var event = window.event || arguments.callee.caller.arguments[0];
        if (event.keyCode == 13)
        {
			search();
        }
	}
	clearValue.onclick = function(){
	$("#searchtext").val("");
	// this.style.display = 'none';
	$("#bigAutocompleteContent").hide();
	tishi.style.display = "none";
	oShade.style.display = "block";
}