<%@ page contentType="text/html; charset=UTF8" %>
<%@ taglib uri="http://tiles.apache.org/tags-tiles" prefix="tiles" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<tiles:insertDefinition name="base.definition" flush="true">
	<tiles:putAttribute name="type" value="user"/>
	<tiles:putAttribute name="title" value="syncmaster.title"/>
	<tiles:putAttribute name="body" type="string">

<link href="http://jsajax.com/jQuery/prettyLoader/css/prettyLoader.css" rel="stylesheet" type="text/css" />
<script type="text/javascript" src="http://jsajax.com/jQuery/prettyLoader/js/jquery.prettyLoader.js"></script>
<script type="text/javascript">

$(function(){
	$.prettyLoader({ loader: 'http://jsajax.com/jQuery/prettyLoader/images/prettyLoader/ajax-loader.gif' });

	$("#syncButton").button().click(function(){
		$.prettyLoader.show();
		$("#message").css("visibility","visible");
		$("#message").html('<img src="../../skin/imgs/ajax-loader.gif"/>同期しています。');
		$.get('sync', function(data){
			$("#message").html(data);
		});
	});
});

</script>

<p>
Google Appsのユーザとグループ(メーリングリスト)をinfoScoopに取り込みます。<br>
この処理は、ユーザ数およびグループ数に応じて数分から数十分の時間がかかります。
</p>

<div>
	<input id="syncButton" type="button" value="同期"/>
	<span id="message" style="visibility:hidden"></span>
	<div id="prog" style="width:250px; visibility:hidden"></div>
	
</div>

	</tiles:putAttribute>
</tiles:insertDefinition>