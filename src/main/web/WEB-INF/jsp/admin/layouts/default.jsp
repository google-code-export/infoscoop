<!doctype HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<%@ page contentType="text/html; charset=UTF-8" errorPage="/jspError.jsp" %>
<%@ page import="org.infoscoop.util.RSAKeyManager"%>
<%@ page import="org.infoscoop.service.ForbiddenURLService" %>
<%@ page import="org.infoscoop.service.PortalAdminsService" %>

<%@ taglib uri="http://tiles.apache.org/tags-tiles" prefix="tiles" %>
<%@ taglib uri="http://www.springframework.org/tags" prefix="spring" %>
<%
	String uid = (String) session.getAttribute("Uid");
	if(uid == null || uid.length() == 0) {
		response.sendRedirect("./login.jsp");
	}
%>
<tiles:useAttribute name="title"/>
<tiles:useAttribute name="type" scope="request"/>
<html>
	<head>
		<meta http-equiv="content-type" content="text/html; charset=UTF-8">
		<meta http-equiv="Pragma" content="no-cache">
		<meta http-equiv="Cache-Control" content="no-cache">

		<title>infoscoop %{alb_administration} - %{${title}}</title>
		
		<link rel="stylesheet" type="text/css" href="../../skin/admin.css">
		<link rel="stylesheet" type="text/css" href="../../skin/admintreemenu.css">
		
		<!--start styles css-->
	    <link rel="stylesheet" type="text/css" href="../../skin/styles.css">
	    <link rel="stylesheet" type="text/css" href="../../skin/siteaggregationmenu.css">
	    <link rel="stylesheet" type="text/css" href="../../skin/treemenu.css">
	    <link rel="stylesheet" type="text/css" href="../../skin/calendar.css">
	    <link rel="stylesheet" type="text/css" href="../../skin/pulldown.css">
	    <link rel="stylesheet" type="text/css" href="../../skin/calendarinput.css">
	    <link rel="stylesheet" type="text/css" href="../../skin/mySiteMap.css">
	    <link rel="stylesheet" type="text/css" href="../../skin/commandbar.css">
	    <link rel="stylesheet" type="text/css" href="../../skin/tab.css">
	    <link rel="stylesheet" type="text/css" href="../../skin/widget.css">
	    
	    <link rel="stylesheet" type="text/css" href="../../skin/groupsettingmodal.css">
	    <link rel="stylesheet" type="text/css" href="../../skin/message.css">
	    <link rel="stylesheet" type="text/css" href="../../skin/minibrowser.css">
	    <link rel="stylesheet" type="text/css" href="../../skin/ranking.css">
	    <link rel="stylesheet" type="text/css" href="../../skin/widgetranking.css">
	    <link rel="stylesheet" type="text/css" href="../../skin/rssreader.css">
	    <link rel="stylesheet" type="text/css" href="../../skin/maximizerssreader.css">
	    <link rel="stylesheet" type="text/css" href="../../skin/information.css">
	    <link rel="stylesheet" type="text/css" href="../../skin/ticker.css">
		<!--end styles css-->

		<script>
			<jsp:include page="/prpsrv" flush="true" />
			var isTabView = false;

			function getInfoScoopURL() {
				var currentUrl = location.href;
				return currentUrl.replace(/\/(manager)\/.*/, "");
			}
			var hostPrefix = getInfoScoopURL();
			
			staticContentURL = /^(http|https):\/\//.test(staticContentURL) ? staticContentURL : hostPrefix;
			var imageURL = staticContentURL + "/skin/imgs/";
			
			var IS_Portal = {};
			var is_userId = <%=uid != null ? "\"" + uid + "\"" : "null" %>;

			var IS_forbiddenURLs = <%= ForbiddenURLService.getHandle().getForbiddenURLsJSON() %>;
			
			var localhostPrefix = "<%=request.getScheme()%>://localhost:<%=request.getServerPort()%><%=request.getContextPath()%>";
		</script>

		<script src="../../js/resources/resourceBundle.jsp"></script>
		<script src="../../admin/js/resources/resourceBundle.jsp"></script>
	    <script src="../../js/gadget/features/core:rpc:pubsub:infoscoop.js?c=1"></script>
		
		<!--start script-->
	    <script src="../../js/lib/prototype-1.6.0.3.js"></script>
		<script src="../../js/lib/scriptaculous-js-1.8.2/effects.js"></script>
		<script src="../../js/lib/scriptaculous-js-1.8.2/dragdrop.js"></script>
		<script src="../../js/lib/syntacticx-livepipe-ui/livepipe.js"></script>
		<script src="../../js/lib/syntacticx-livepipe-ui/tabs.js"></script>
		<script src="../../admin/js/lib/popupmenu.js"></script>

		<script src="../../js/utils/utils.js"></script>
		<script src="../../js/utils/domhelper.js"></script>
		<script src="../../js/utils/ajaxpool/ajax.js"></script>
		<script src="../../js/utils/ajax304.js"></script>
		<script src="../../js/lib/control.modal.js"></script>
		<script src="../../js/lib/date/date.js"></script>
		<script src="../../js/lib/rsa/jsbn.js"></script>
		<script src="../../js/lib/rsa/prng4.js"></script>
		<script src="../../js/lib/rsa/rng.js"></script>
		<script src="../../js/lib/rsa/rsa.js"></script>
		<script src="../../js/lib/extras-array.js"></script>
		<script src="../../js/utils/msg.js"></script>
		<script src="../../js/utils/EventDispatcher.js"></script>
		<script src="../../js/utils/CalendarInput.js"></script>
		<script src="../../js/utils/Request.js"></script>
		<script src="../../js/utils/Validator.js"></script>
		<script src="../../js/utils/groupSettingModal.js"></script>

		
		<script src="../../js/commands/UpdatePropertyCommand.js"></script>
		<script src="../../js/widgets/Widget.js"></script>
		<script src="../../js/widgets/WidgetHeader.js"></script>
		<script src="../../js/widgets/WidgetEdit.js"></script>
		<script src="../../js/DragWidget.js"></script>
		<script src="../../js/widgets/rssreader/RssReader.js"></script>
		<script src="../../js/widgets/rssreader/RssItemRender.js"></script>
		<script src="../../js/widgets/MultiRssReader/MultiRssReader.js"></script>
	    <script src="../../js/widgets/information/Information.js"></script>
	    <script src="../../js/widgets/information/Information2.js"></script>
	    <script src="../../js/widgets/calendar/Calendar.js"></script>
	    <script src="../../js/widgets/calendar/iCalendar.js"></script>
	    <script src="../../js/widgets/MiniBrowser/MiniBrowser.js"></script>
	    <script src="../../js/widgets/MiniBrowser/FragmentMiniBrowser.js"></script>
	    <script src="../../js/widgets/WidgetRanking/WidgetRanking.js"></script>
	    <script src="../../js/widgets/Message/Message.js"></script>
		
		<script src="../../admin/js/Admin.js"></script>
		<script src="../../admin/js/AdminDragDrop.js"></script>
		<script src="../../admin/js/AdminInstantEdit.js"></script>
		<script src="../../admin/js/AdminSiteAggregationMenu.js"></script>
		<script src="../../admin/js/AdminSearchEngine.js"></script>
		<script src="../../admin/js/AdminProperties.js"></script>
		<script src="../../admin/js/AdminProxyConf.js"></script>
		<script src="../../admin/js/AdminI18N.js"></script>
		<script src="../../admin/js/AdminCommonModals.js"></script>
		<script src="../../admin/js/AdminDefaultPanel.js"></script>
		<script src="../../admin/js/AdminDefaultPanelModals.js"></script>
		<script src="../../admin/js/AdminPortalLayout.js"></script>
		<script src="../../admin/js/AdminWidgetConf.js"></script>
		<script src="../../admin/js/AdminEditWidgetConf.js"></script>
		<script src="../../admin/js/AdminHTMLFragment.js"></script>
		<script src="../../admin/js/AdminPortalAdmins.js"></script>
		<script src="../../admin/js/AdminMenuExplorer.js"></script>
		<script src="../../admin/js/AdminForbiddenURL.js"></script>
		<script src="../../admin/js/AdminGadgetUploadForm.js"></script>
		<script src="../../admin/js/AdminInformation.js"></script>
		<script src="../../admin/js/AdminAuthentication.js"></script>
		<!--end script-->
<script src="../../skin/test.js"></script>
		
	    <script src="../../js/lib/jquery-1.6.1.min.js"></script>
		<script>
			jQuery.noConflict();
			$jq = jQuery;
		</script>
	</head>
	<body class="infoScoop admin">
		<div id="admin-leftbox">
			<tiles:insertAttribute name="header" />
			<tiles:insertAttribute name="menu" />
		</div>
		
		<div id="body"><tiles:insertAttribute name="body" /></div>
		
		<div id="admin-menu-navigator"></div>
		<div id="properties"></div>
		
		<div id="footer"><tiles:insertAttribute name="footer" /></div>
	</body>
	
	<script>
		$jq(function(){
			$jq("#messageIcon").click(function(){
				msg.showPopupDialog(adminHostPrefix);
			});
		});
	</script>
</html>