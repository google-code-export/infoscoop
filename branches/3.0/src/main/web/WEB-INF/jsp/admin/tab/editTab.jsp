<%@ page contentType="text/html; charset=UTF8" %>
<%@ taglib uri="http://tiles.apache.org/tags-tiles" prefix="tiles" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib uri="http://www.springframework.org/tags/form" prefix="form" %>
<tiles:insertDefinition name="prototype.definition" flush="true">
	<tiles:putAttribute name="type" value="tab"/>
	<tiles:putAttribute name="title" value="tab.title"/>
	<tiles:putAttribute name="body" type="string">
<link rel="stylesheet" type="text/css" href="../../skin/siteaggregationmenu.css">
<link rel="stylesheet" type="text/css" href="../../skin/treemenu.css">
<link rel="stylesheet" type="text/css" href="../../skin/widget.css">

<link rel="stylesheet" type="text/css" href="../../skin/calendar.css">
<link rel="stylesheet" type="text/css" href="../../skin/rssreader.css">

<style>
h1 {
  margin:5px;
}
h2 {
  margin:10px 5px 2px 5px;
}
.column {
	float:left;
}
#modal_container {  
     padding:5px;  
     background-color:#fff;  
     border:1px solid #666;  
     overflow:auto;  
     font-family:"Lucida Grande",Verdana;  
     font-size:12px;  
     color:#333;  
     text-align:left;  
} 

#modal_overlay {  
     background-color:#000;  
}

.staticLayout {
	width: 22%;
	float: left;
	margin-top: 5px;
	margin-left: 5px;
	padding: 5px;
	border: solid 1px #000;
	cursor: pointer;
  width:120px;
  height:194px;
}
.static_column {
  border : dotted 1px gray;
	cursor: pointer;
	position:relative
}
.widget .widgetHeader {
	background-image:url("../../skin/imgs/theme/widget_header.png");
}

.edit_static_gadget{
	position: absolute;top: 0px;left: 0px;
	text-decoration: underline;
	color : blue;
	cursor: pointer;
	text-align:center;
	vertical-align:middle;
	-moz-opacity:0.7;
	opacity:0.7;
	filter:alpha(opacity=70);
	background-color: #F0F0F0;
	z-index: 10;
	width:100%;
	height:100%;
}
</style>

<script src="../../js/resources/resources_ja.js"></script>
<script>
function getInfoScoopURL() {
	var currentUrl = location.href;
	return currentUrl.replace(/\/manager\/.*/, "");
}
var staticContentURL=getInfoScoopURL();
var ajaxRequestTimeout=15000;
var messagePriority = 4;
var localhostPrefix = staticContentURL;
var hostPrefix = staticContentURL;
var proxyServerURL = hostPrefix + "/proxy";
var imageURL = staticContentURL + "/skin/imgs/";
var maxColumnNum=10;
var displayTopMenu  = true;
var displaySideMenu  = true;
var fixedPortalHeader = false;
var useTab = false;
var isTabView = false;
var is_userId = "test";
var refreshInterval=10;
var rssPageSize = 25;
var ajaxRequestRetryCount=2;
var freshDays = 1;
var rssMaxCount = 100;
var commandQueueWait = 15;

IS_R['getResource'] = function(s){return s;}
var gadgets = {'rpc':{'setRelayUrl':function(){},'setAuthToken':function(){}}};
IS_Widget = {};
IS_Widget.getIcon = function() {
	return imageURL + 'widget_add.gif'; 
};
IS_WidgetIcons = {
	'RssReader':imageURL + 'widget_add.gif'
}
var displayTabOrder = "0";
IS_Portal = {
	tabs: {},
	fontSize: '14px',
	isItemDragging: false,
	columnsObjs: {},
	rssSearchBoxList: {},
	isChecked: function(){return false},
	showDragOverlay: function(){},
	hideDragOverlay: function() {},
	displayMsgBar: function(){},
	unDisplayMsgBar: function(){},
	adjustPanelHeight: function(){},
	adjustIframeHeight: function(){},
	deleteCacheByUrl:function(){},
	endIndicator: function(){},
	widgetDisplayUpdated: function(){},
	Trash:{
		add:function(){}
	}
}

</script>
<script src="../../js/utils/utils.js"></script>
<script src="../../js/utils/ajax304.js"></script>
<script src="../../js/lib/control.modal.js"></script>
<script src="../../js/lib/extras-array.js"></script>
<script src="../../js/lib/date/date.js"></script>
<script src="../../js/utils/domhelper.js"></script>
<script src="../../js/SiteAggregationMenu.js"></script>
<script src="../../js/SiteMap.js"></script>
<script src="../../js/TreeMenu.js"></script>
<script src="../../js/utils/EventDispatcher.js"></script>
<script src="../../js/Tab.js"></script>	
<script src="../../js/WidgetsContainer.js"></script>
<script src="../../js/utils/ajaxpool/ajax.js"></script>
<script src="../../js/utils/Request.js"></script>
<script src="../../js/utils/msg.js"></script>
<script src="../../js/DragWidget.js"></script>
<script src="../../js/widgets/Widget.js"></script>
<script src="../../js/widgets/WidgetHeader.js"></script>
<script src="../../js/widgets/WidgetEdit.js"></script>
<script src="../../js/commands/UpdatePropertyCommand.js"></script>

<script src="../../js/widgets/rssreader/RssReader.js"></script> 
<script src="../../js/widgets/MultiRssReader/MultiRssReader.js"></script> 
<script src="../../js/widgets/rssreader/RssItemRender.js"></script>
<script src="../../js/widgets/calendar/Calendar.js"></script>
<script src="../../js/widgets/calendar/iCalendar.js"></script>
<script src="../../js/widgets/MiniBrowser/MiniBrowser.js"></script>
<script src="../../js/widgets/MiniBrowser/FragmentMiniBrowser.js"></script>

<script type="text/javascript" class="source">
IS_SidePanel.adjustPosition = function(){};
IS_Request.CommandQueue = new IS_Request.Queue("/manager/tab/comsrv", commandQueueWait, !is_userId);
IS_Portal.addTab = function(idNumber, name, type, layout, numCol, columnsWidth, isInitialize, tabOrder){
	var panels = $("panels");
	var panelDiv = IS_Portal.buildPanel( idNumber, type );
	panelDiv.style.display = "";
	panels.appendChild( panelDiv );
	IS_Portal.widgetLists["tab"+idNumber] = new Object();
	IS_Portal.columnsObjs["tab"+idNumber] = {};
	IS_Portal.tabs["tab"+idNumber] = {"numCol":0,panel:panelDiv};
	IS_WidgetsContainer.rebuildColumns("tab"+idNumber, numCol, columnsWidth, false, isInitialize);
}
IS_Customization = {"commandbar":"<table cellpadding=\"0\" cellspacing=\"3\" width=\"100%\">\r\n\t<tr>\r\n\t\t<td width=\"100%\"><div id=\"p_1_w_4\"><\/div><\/td>\r\n\t\t<td><div id=\"p_1_w_6\"><\/div><\/td>\r\n\t\t<td><div id=\"portal-go-home\"><\/div><\/td>\r\n\t\t<td><div id=\"disabled_portal-change-fontsize\" disabledCommand=\"true\"><!--&lt;div id=\"portal-change-fontsize\"&gt;&lt;/div&gt;--><\/div><\/td>\r\n\t\t<td><div id=\"portal-trash\"><\/div><\/td>\r\n\t\t<td><div id=\"portal-preference\"><div class=\"allPreference\"><\/div><\/div><\/td>\r\n\t\t<td><div id=\"disabled_portal-credential-list\" disabledCommand=\"true\"><!--&lt;div id=\"portal-credential-list\"&gt;&lt;/div&gt;--><\/div><\/td>\r\n\t\t<td><div id=\"portal-admin-link\"><\/div><\/td>\r\n\t\t<td><div id=\"disabled_portal-logout\" disabledCommand=\"true\"><!--&lt;div id=\"portal-logout\"&gt;&lt;/div&gt;--><\/div><\/td>\r\n\t<\/tr>\r\n<\/table>\r\n","staticPanel0":"<DIV>\r\n\t<DIV style=\"FLOAT: left; WIDTH: 74.5%\">\r\n\t\t<DIV style=\"HEIGHT: 178px\">\r\n\t\t\t<DIV style=\"FLOAT: left; WIDTH: 100%; HEIGHT: 100%\">\r\n\t\t\t\t<DIV id=\"p_1_w_1\" class=\"static_column\" style=\"MARGIN-LEFT: 2px; HEIGHT: 170px\"><\/DIV>\r\n\t\t\t<\/DIV>\r\n\t\t<\/DIV>\r\n\t<\/DIV>\r\n\t<DIV style=\"FLOAT: right; WIDTH: 25%; HEIGHT: 178px\">\r\n\t\t<DIV id=\"p_1_w_5\" class=\"static_column\" style=\"MARGIN-LEFT: 2px; HEIGHT: 170px\"><\/DIV>\r\n\t<\/DIV>\r\n<\/DIV>\r\n<DIV style=\"CLEAR: both; display:none;\"/>\r\n","contentFooter":[{"type":"mail"},{"type":"message"}],"css":"/* Custom CSS code is described here.  */","header":"<table width=\"100%\" height=\"53px\" cellspacing=\"0\" cellpadding=\"0\" style=\"background:url(skin/imgs/head_blue.png)\">\r\n\t<tbody>\r\n\t\t<tr>\r\n\t\t\t<td><a href=\"javascript:void(0)\" onclick=\"javascript:IS_Portal.goHome();return false;\"><img src=\"skin/imgs/infoscoop.gif\" alt=\"infoScoop\" border=\"0\" style=\"margin:0 0 0 20px;\" height=\"45\"/><\/a>\r\n\t\t\t<\/td>\r\n\t\t\t<td>\r\n\t\t\t\t<form name=\"searchForm\" onsubmit=\"javascript:IS_Portal.SearchEngines.buildSearchTabs(document.getElementById('searchTextForm').value);return false;\">\r\n\t\t\t\t<div style=\"float:right;margin-right:5px\">\r\n\t\t\t\t\t<table>\r\n\t\t\t\t\t\t<tbody>\r\n\t\t\t\t\t\t\t<tr>\r\n\t\t\t\t\t\t\t\t<td colspan=\"2\" align=\"right\" style=\"font-size:80%;\">\r\n\t\t\t\t\t\t\t\t\tWelcome,admin-\r\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<\/td>\r\n\t\t\t\t\t\t\t<\/tr>\r\n\t\t\t\t\t\t\t<tr>\r\n\t\t\t\t\t\t\t\t<td>\r\n\t\t\t\t\t\t\t\t\t<input id=\"searchTextForm\" type=\"text\" style=\"width:200px;height:23px;float:left;\"/>\r\n\t\t\t\t\t\t\t\t\t<input type=\"submit\" value=\"Search\" style=\"padding:0 0.4em;\"/>\r\n\t\t\t\t\t\t\t\t\t<span id=\"editsearchoption\">Search options<\/span>\r\n\t\t\t\t\t\t\t\t<\/td>\r\n\t\t\t\t\t\t\t<\/tr>\r\n\t\t\t\t\t\t<\/tbody>\r\n\t\t\t\t\t<\/table>\r\n\t\t\t\t<\/div>\r\n\t\t\t\t<\/form>\r\n\t\t\t<\/td>\r\n\t\t<\/tr>\r\n\t<\/tbody>\r\n<\/table>","title":"infoScoop"};
IS_Portal.CommandBar = {
  init:function(){}
}

function isHidePanel(){
	return false;
}
// mock for search engines
IS_Portal.searchWidgetAndFeedNode = function(){};
IS_Portal.SearchEngines = {
	matchRssSearch : function(){return false;},
	loadConf : function(){}
};
// mock for behindIframe
IS_Portal.behindIframe = {
	show:function(){},
	hide:function(){}
}
IS_forbiddenURLs = {};

//
IS_Portal.currentTabId = "tab${tabTemplate.id}";
IS_Portal.trueTabId = "tab${tabTemplate.tabId}";
IS_Portal.deleteTempTabFlag = 1;//1-- excute beforeunload, 0-- don't excute beforeunload

function prepareStaticArea(){
	var static_columns = $$('#staticAreaContainer .static_column');
	IS_Portal.deleteTempTabFlag = 1;
	var tabId = IS_Portal.currentTabId.replace("tab","");
	for (var j=0; j<static_columns.length; j++ ) {
		var containerId = IS_Portal.trueTabId + '_static_column_' + j;
		var div = static_columns[j];
		div.id = containerId;

		var edit_cover = document.createElement('div');
		edit_cover.id = "edit_div_" + j;
		edit_cover.className = "edit_static_gadget";
		edit_cover.style.display = "none";
		edit_cover.href = hostPrefix + "/manager/tab/editStaticGadget?tabId=" + tabId + "&containerId=" + containerId;
		div.appendChild(edit_cover);
		
		var modal = new Control.Modal(
			edit_cover,
			{
			  opacity: 0.4,
			  width: 580,
			 height: 440,
			 iframe:true// ajax is better
			}
		);

		var editLayoutMouseOver = function(parent, child,containerId) {
				setModal(parent,child,containerId);
				Element.show(child);
		};
		var editLayoutMouseOut = function(parent, child) {
				Element.hide(child);
		};
		

		Event.observe(div, 'mouseover', editLayoutMouseOver.bind(null, div, edit_cover, containerId),false);
		Event.observe(div, 'mouseout', editLayoutMouseOut.bind(null, div, edit_cover), false);
		function setModal(parent, edit_cover, containerId){
			if(parent.id !== containerId){
				edit_cover.innerHTML = 'Edit';
			}else{
				edit_cover.innerHTML = 'New';
			}
		}
	}
};

function init() {

	Event.observe('submit_button', 'click', changeFlag, false);
	prepareStaticArea();

	new IS_WidgetsContainer("/manager/tab/widsrv");
	new IS_SiteAggregationMenu();
	new IS_SidePanel.SiteMap();

	//Holiday information
	IS_Holiday = new IS_Widget.Calendar.iCalendar(localhostPrefix + "/holidaysrv");
	IS_Holiday.load(false);

	//menuItem to panel
	var panelBody = document.body;
	var widopt = {
	  accept: function(element, widgetType, classNames){
		  return (classNames.detect( 
			  function(v) { return ["widget", "subWidget"].include(v) } ) &&
				  (widgetType != "mapWidget") );
	  },
	  onHover: function(element, dropElement, dragMode, point) {
		var x = point[0] - element.boxLeftDiff;
		var y = point[1];//Leave y axis as getNearDropTarget

		var min = 10000000;
		var nearGhost = null;// widget near widget ghost
		var widgetGhost = IS_Draggable.ghost;
		widgetGhost.style.display = "block";//for Safari
		var scrollOffset = IS_Portal.tabs[IS_Portal.currentTabId].panel.scrollTop;//IS_Portal.columnsObjs must be in the panel.
		for ( var i=1; i <= IS_Portal.tabs[IS_Portal.currentTabId].numCol; i++ ) {
			var col = IS_Portal.columnsObjs[IS_Portal.currentTabId]["col_dp_" + i];
			for (var j=0; j<col.childNodes.length; j++ ) {
				var div = col.childNodes[j];
				if (div == widgetGhost) {
					continue;
				}
				
				var left = div.posLeft;//Coordinate exclude ghost
				var top = div.posTop - scrollOffset;
				
				var tmp = Math.sqrt(Math.pow(x-left,2)+ Math.pow(y-top,2));
				if (isNaN(tmp)) {
					continue;
				}
				
				if ( tmp < min ) {
					min = tmp;
					nearGhost = div;
					nearGhost.col = col;
				}
				
			}
		}
		var staticWidget = null;
		var static_columns = $$('.static_column');
		for (var j=0; j<static_columns.length; j++ ) {
			var div = static_columns[j];
			if (div == widgetGhost) {
				continue;
			}
			
			var left = findPosX(div);
			var top = findPosY(div) - scrollOffset;
			
			var tmp = Math.sqrt(Math.pow(x-left,2)+ Math.pow(y-top,2));
			if (isNaN(tmp)) {
				continue;
			}
			
			if ( tmp < min ) {
				min = tmp;
				staticWidget = div;
				staticWidget.col = col;
			}
			
		}
		
		if (nearGhost != null && widgetGhost.nextSibling != nearGhost) {
			widgetGhost.style.display = "block";
			nearGhost.parentNode.insertBefore(widgetGhost,nearGhost);
			widgetGhost.col = nearGhost.col;
		}else if(staticWidget){
			if(this.staticWidget)this.staticWidget.style.backgroundColor = "#FFFFFF";
			staticWidget.style.backgroundColor = "#F0F0F0";
			this.staticWidget = staticWidget;
			widgetGhost.style.display = "none";
		}else if(this.staticWidget){
			this.staticWidget.style.backgroundColor = "#FFFFFF";
			widgetGhost.style.display = "block";
			this.staticWidget = null;
		}
	  },
	  onDrop : function(element, lastActiveElement, widget, event) {
		if(!IS_Portal.canAddWidget()) return;
		var widgetGhost = IS_Draggable.ghost;
		if( !Browser.isSafari ||( widgetGhost && widgetGhost.style.display != "none")){
			var ghostColumnNum = (widgetGhost.col)? widgetGhost.col.getAttribute("colNum"):1;
			widget.widgetConf.column = ghostColumnNum;
			widgetGhost.col.replaceChild(element, widgetGhost);
		} else {
		    widgetGhost.col.removeChild( widgetGhost );
		}
		if(this.staticWidget){
			if(this.staticWidget.firstChild)
			  this.staticWidget.replaceChild(element, this.staticWidget.firstChild);
			else
			  this.staticWidget.appendChild(element);
		}
		element.style.position = "";

		var tmpParent =false;
		if(widget.parent){// If sub widget is dropped on the panel.
			element.className="widget";
			widget.tabId = IS_Portal.currentTabId;

			tmpParent = widget.parent;
			IS_Portal.removeSubWidget(widget.parent.id, widget.id);
			//widget.parent.content.removeRssReader(widget.id, false, true);
			//The item deleted from Multi is not removeWidget but setWidgetLocationCommand.
			IS_EventDispatcher.newEvent("applyIconStyle", widget.id);
			IS_EventDispatcher.newEvent("changeConnectionOfWidget", widget.id);
			IS_EventDispatcher.newEvent("applyIconStyle", tmpParent.id);
			
			tmpParent.content.mergeRssReader.isComplete = false;
		}
		
		//Send to Server
		IS_Widget.setWidgetLocationCommand(widget);

		if(tmpParent)
			tmpParent.content.checkAllClose(true);
		
		// TODO: Processing of removing edit tip of title. Processing should be within WidgetHeader
		if(widget.headerContent && widget.headerContent.titleEditBox){
			widget.headerContent.titleEditBox.style.display = "none";
		}
		
		if( widget.isGadget()) {
			if( Browser.isIE ) {
				IS_Portal.adjustGadgetHeight( widget,true );
			} else {
				widget.loadContents();
			}
		}
		
		IS_EventDispatcher.newEvent("moveWidget", widget.id);
	  }
	}
	IS_Droppables.add(panelBody, widopt);
	
	var menuopt = {};
	menuopt.accept = "menuItem";
	menuopt.onDrop = function(element, lastActiveElement, menuItem, event) {
		if(!IS_Portal.canAddWidget()) return;
		
		var widgetGhost = IS_Draggable.ghost;
		var ghostColumnNum = (widgetGhost.col)? widgetGhost.col.getAttribute("colNum"):1;
		
		var parentItem = menuItem.parent;
		var p_id;
		var divParent;
		
		if(parentItem){
			p_id = IS_Portal.currentTabId+"_p_" + parentItem.id;
			divParent = $(p_id);
		}

		var widgetConf;
		var subWidgetConf;
		if(/MultiRssReader/.test(menuItem.type)){
			if(!divParent){
				// TODO: Processing of cooperative menu
				var parentItem = menuItem.parent;
				var w_id = IS_Portal.currentTabId + "_p_" + parentItem.id;

				var childMenuList = [];
				var children = parentItem.children;
				for(var i = 0; i < children.length ;i++){
					var feedNode = children[i];
					if(feedNode.type && /MultiRssReader/.test(feedNode.type)){
						childMenuList.push(feedNode.id);
					}
				}
				if(!parentItem.properties)parentItem.properties = [];
				parentItem.properties.children = childMenuList;

				parentItem.properties["itemDisplay"] = parentItem["display"];
				widgetConf = IS_WidgetsContainer.WidgetConfiguration.getConfigurationJSONObject(
					"MultiRssReader", w_id, ghostColumnNum, parentItem.title, parentItem.href, parentItem.properties);
				
				subWidgetConf = IS_WidgetsContainer.WidgetConfiguration.getFeedConfigurationJSONObject(
								"RssReader", "w_" + menuItem.id, menuItem.title, menuItem.href, "false", menuItem.properties);
				subWidgetConf.menuId = menuItem.id;
				subWidgetConf.parentId = "p_" + menuItem.parentId;
			}
		}else{
			/* Recreate config everytime becasue menu can be changed */
			// Create JSONObject from menuItem
			widgetConf = IS_SiteAggregationMenu.getConfigurationFromMenuItem(menuItem, ghostColumnNum);
		}
		
		var widget;
		if(/MultiRssReader/.test(menuItem.type) && divParent){//Drop cooperative menu from menu
			var parentItem = menuItem.parent;
//			var targetWidget = IS_Portal.widgetLists[IS_Portal.currentTabId][p_id];
			var targetWidget = IS_Portal.getWidget(p_id, IS_Portal.currentTabId);
			
			// Head at order display of time.
			var siblingId;
			var nextSiblingId;
			if(targetWidget.getUserPref("displayMode") == "time"){
				siblingId = "";
				nextSiblingId = "";
			}else{
				siblingId = (widgetGhost.previousSibling) ? widgetGhost.previousSibling.id : "";
				nextSiblingId = (widgetGhost.nextSibling) ? widgetGhost.nextSibling.id : "";
			}
			var w_id = "w_" + menuItem.id;
//			menuItem.type="RssReader";
			var widgetConf = IS_SiteAggregationMenu.getConfigurationFromMenuItem(menuItem, ghostColumnNum);
			widgetConf.type = "RssReader";
			
			// subWidget in the same tab is always built
			var currentTabId = IS_Portal.currentTabId;
			if( Browser.isSafari1 && targetWidget.content.isTimeDisplayMode())
				IS_Portal.currentTabId = "temp";
			
			widgetConf.parentId = "p_" + menuItem.parentId;
			widget = IS_WidgetsContainer.addWidget( currentTabId, widgetConf , true, function(w){
				w.elm_widget.className = "subWidget";
				widgetGhost.parentNode.replaceChild(w.elm_widget, widgetGhost);
			});//TODO: The way of passing sub widget.
			
			IS_Portal.widgetDropped( widget );
			
			if( Browser.isSafari1 && targetWidget.content.isTimeDisplayMode())
				IS_Portal.currentTabId = currentTabId;
			
//			IS_Portal.subWidgetMap[targetWidget.id].push(widget.id);
			IS_Portal.addSubWidget(targetWidget.id, widget.id);
			targetWidget.content.addSubWidget(widget, nextSiblingId);
			if(widget.isBuilt)widget.blink();
			
			//Send to Server
			IS_Widget.setWidgetLocationCommand(widget);

			if( targetWidget.content.isTimeDisplayMode() ) {
				IS_EventDispatcher.addListener("loadComplete",targetWidget.id,function() {
					targetWidget.elm_widgetBox.className = "widgetBox";
					targetWidget.headerContent.applyAllIconStyle();
				},null,true );
				
				targetWidget.loadContents();
			}
		}else{
			addWidgetFunc( IS_Portal.currentTabId,widgetGhost );
		}
		
		function addWidgetFunc( tabId,target ) {
			widget = IS_WidgetsContainer.addWidget( tabId, widgetConf , false, function(w){
					target.parentNode.replaceChild( w.elm_widget,target );
				}, (subWidgetConf)? [subWidgetConf] : null);//TODO: The way of passing sub widget.
			
			//Send to Server
			IS_Widget.setWidgetLocationCommand(widget); //Add SiblingId
			
			var menuId;
			if(/MultiRssReader/.test(menuItem.type)){
				var subWidgets = IS_Portal.getSubWidgetList(widget.id);
				for (var i=0; i < subWidgets.length; i++){
					var feedWidget = subWidgets[i];
					if(feedWidget)
						IS_Portal.widgetDropped( feedWidget );
				}
			}else{
				IS_Portal.widgetDropped( widget );
			}
		}
	}
	menuopt.onHover = function(element, dropElement, dragMode, point) {
		var widgetGhost = IS_Draggable.ghost;
		if(widgetGhost.menuItem && /MultiRssReader/.test(widgetGhost.menuItem.type)){
			var parentItem = widgetGhost.menuItem.parent;
			var p_id = IS_Portal.currentTabId+"_p_" + parentItem.id;
			var divParent = $(p_id);
			if( divParent ) return;
		}
		
		var x = point[0] - element.boxLeftDiff;
		var y = point[1] - element.boxTopDiff;

		var min = 10000000;
		var nearGhost = null;
		var scrollOffset = IS_Portal.tabs[IS_Portal.currentTabId].panel.scrollTop;//IS_Portal.columnsObjs must be in the panel.
		for ( var i=1; i <= IS_Portal.tabs[IS_Portal.currentTabId].numCol; i++ ) {
			var col = IS_Portal.columnsObjs[IS_Portal.currentTabId]["col_dp_" + i];
			for (var j=0; j<col.childNodes.length; j++ ) {
				var div = col.childNodes[j];
				if (div == widgetGhost) {
					continue;
				}
				
				if(dragMode == "menu"){
					var left = findPosX(div);
					var top = findPosY(div) - scrollOffset;
				}else{
					var left = div.posLeft;
					var top = div.posTop - scrollOffset;
				}
				
				var tmp = Math.sqrt(Math.pow(x-left,2)+ Math.pow(y-top,2));
				if (isNaN(tmp)) {
					continue;
				}
				
				if ( tmp < min ) {
					min = tmp;
					nearGhost = div;
					nearGhost.col = col;
				}
				
			}
		}
		
		var staticWidget = null;
		var static_columns = $$('.static_column');
		for (var j=0; j<static_columns.length; j++ ) {
			var div = static_columns[j];
			if (div == widgetGhost) {
				continue;
			}
			
			var left = findPosX(div);
			var top = findPosY(div) - scrollOffset;
			
			var tmp = Math.sqrt(Math.pow(x-left,2)+ Math.pow(y-top,2));
			if (isNaN(tmp)) {
				continue;
			}
			
			if ( tmp < min ) {
				min = tmp;
				staticWidget = div;
				staticWidget.col = col;
			}
			
		}
		/*
		if (nearGhost != null && widgetGhost.nextSibling != nearGhost) {
			widgetGhost.style.display = "block";
			nearGhost.parentNode.insertBefore(widgetGhost,nearGhost);
			widgetGhost.col = nearGhost.col;
		}
		*/
		if (nearGhost != null && widgetGhost.nextSibling != nearGhost) {
			widgetGhost.style.display = "block";
			nearGhost.parentNode.insertBefore(widgetGhost,nearGhost);
			widgetGhost.col = nearGhost.col;
		}else if(staticWidget){
			if(this.staticWidget)this.staticWidget.style.backgroundColor = "#FFFFFF";
			staticWidget.style.backgroundColor = "#F0F0F0";
			this.staticWidget = staticWidget;
			widgetGhost.style.display = "none";
		}else if(this.staticWidget){
			this.staticWidget.style.backgroundColor = "#FFFFFF";
			widgetGhost.style.display = "block";
			this.staticWidget = null;
		}

	}
	IS_Droppables.add(panelBody, menuopt);
	
	new Control.Modal(
			'select_layout_link',
			{
			  opacity: 0.4,
			  width: 580,
			  height: 440,
				afterOpen:function(){
					var staticLayoutList = $$('#modal_container .staticLayout');
					for(var i = 0; i < staticLayoutList.length; i++){
						var layoutDiv = staticLayoutList[i];
						var layoutMouseOver = function(el) {
							el.style.backgroundColor = "#9999cc";
						};
						var layoutMouseOut = function(el) {
							el.style.backgroundColor = "";
						};
						var layoutClick = function(el,e) {
							$('staticAreaContainer').innerHTML = el.innerHTML;
							prepareStaticArea();
							$('layout').value = $('staticAreaContainer').innerHTML;
							$('layoutModified').value = "true";
							reloadStaticGadgets();
							clearStaticGadgets();
							//TODO:remove ols static gadgets;
							Event.stop(e);
							Control.Modal.close();
						};
						Event.observe(layoutDiv, 'mouseover', layoutMouseOver.bind(null, layoutDiv),false);
						Event.observe(layoutDiv, 'mouseout', layoutMouseOut.bind(null, layoutDiv), false);
						Event.observe(layoutDiv, 'click', layoutClick.bind(null, layoutDiv), false);
					}
					Event.observe( $('select_layout_cancel'), 'click', function(){
						Control.Modal.close();
					},false);
				}
			}
		);
	
	new Control.Modal(
		'edit_layout_link',
		{
			opacity: 0.4,
			width: 580,
			height: 460,
			afterOpen:function(){
				$("edit_layout_textarea").value = $('layout').value;
				Event.observe( $('edit_layout_ok'), 'click', function(){
					var layout = $("edit_layout_textarea").value;
					$('staticAreaContainer').innerHTML = layout;
					prepareStaticArea();
					$('layout').value = $('staticAreaContainer').innerHTML;
					$('layoutModified').value = "true";
					reloadStaticGadgets();
					clearStaticGadgets();
					Control.Modal.close();
				},false);
				Event.observe( $('edit_layout_cancel'), 'click', function(){
					Control.Modal.close();
				},false);
			}
		}
	);
	
};

function changeFlag(){
	IS_Portal.deleteTempTabFlag =0;//Don't excute beforeunload
}

function isTemp(flag){
	return flag == 1;
}

function clearStaticGadgets(){
	var widgets = IS_Portal.widgetLists[IS_Portal.currentTabId];
	var removeIds = [];
	for(var id in widgets){
		if(!widgets[id]) removeIds.push(id);
	};
	if(removeIds.length == 0) return;
	new Ajax.Request(
		"clearStaticGadgets",
		{
			"method": "post",
			"parameters": {tabid: '${tabTemplate.id}', widgetids:removeIds},
			asynchronous: false,
			onFailure: function(request) {
				alert('読み込みに失敗しました');
			},
			onException: function (request) {
				alert('読み込み中にエラーが発生しました');
			}
		}
	);
}

function deleteTempTabTemplate(){
	try{
		IS_Request.asynchronous = false;
		IS_Request.CommandQueue.fireRequest();
	}catch(e){
	}
	if(isTemp(IS_Portal.deleteTempTabFlag)){
		var a = new Ajax.Request(
			"deleteTempTab",
			{
				"method": "get",
				"parameters": "id=${tabTemplate.id}",
				asynchronous: false,
				onSuccess: function(request) {
					alert('temp=1のタブを削除しました');
				},
				onFailure: function(request) {
					alert('読み込みに失敗しました');
				},
				onException: function (request) {
					alert('読み込み中にエラーが発生しました');
				}
			}
		);
	}
}

Event.observe(window, "load", init, false);
Event.observe(window, "beforeunload", deleteTempTabTemplate, false);


IS_Portal.widgetDropped = function( widget ) {
	if( IS_TreeMenu.isMenuItem( widget.id ) )
		IS_EventDispatcher.newEvent( IS_Widget.DROP_WIDGET, IS_TreeMenu.getMenuId( widget.id ) );
}

IS_WidgetConfiguration = <jsp:include page="/widconf" flush="true" />;

function displayStaticGadget(widgetOpt){
	var containerId = widgetOpt.id;
	var container = $(containerId);
	if(!container) {
		IS_Portal.widgetLists[IS_Portal.currentTabId][containerId] = false;
		return;
	}
	var realContainer = $("s_"+containerId);
	if(realContainer) {
		container.parentNode.removeChild(container);
		container = realContainer;
	}else{
		container.id = "s_" + containerId;
	}
	var widget = new IS_Widget(false, widgetOpt);
	widget.panelType = "StaticPanel";
	widget.containerId = containerId;
	widget.build();
	container.appendChild(widget.elm_widget);
	
	widget.loadContents();
	IS_Portal.widgetLists[IS_Portal.currentTabId][widget.id] = widget;
}
function reloadStaticGadgets(){
	var widgets = IS_Portal.widgetLists[IS_Portal.currentTabId];
	for(var id in widgets){
		var widget = widgets[id];
		if(widget.panelType != "StaticPanel") return;
		displayStaticGadget(widget.widgetConf);
	}
}
</script>

<c:import url="/WEB-INF/jsp/admin/tab/_formTab.jsp"/>

<div style="display:none" id='edit_layout_modal'>
	<div>HTMLの編集を行い、[OK]ボタンをクリックしてください。</div>
	<div style="text-align:center;"><textarea id='edit_layout_textarea' rows='20' style='width:90%'></textarea></div>
	<center><input id='edit_layout_ok' type="button" value="OK"/><input id='edit_layout_cancel' type="button" value="キャンセル"/></center>
</div>
<div style="display:none" id='select_layout_modal'>
	<c:import url="/WEB-INF/jsp/admin/tab/_layoutTemplates.jsp"/>
	<div style="clear:both;text-align:center;"><input id='select_layout_cancel' type="button" value="キャンセル"/></div>
</div>
	</tiles:putAttribute>
</tiles:insertDefinition>