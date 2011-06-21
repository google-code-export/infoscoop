<%@ page contentType="text/html; charset=UTF-8" %>
<%@ taglib uri="http://tiles.apache.org/tags-tiles" prefix="tiles" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/functions" prefix="fn" %>

<%@ taglib uri="http://www.springframework.org/tags" prefix="spring" %>
<tiles:insertDefinition name="authentication.side.definition" flush="true">
	<tiles:putAttribute name="type" value="authentication"/>
	<tiles:putAttribute name="title" value="OAuth"/>
	<tiles:putAttribute name="side_body" type="string">

<div id="authentication"></div>

<script>
	$jq(function(){
		ISA_Authentication.build();
	});
</script>
	</tiles:putAttribute>
</tiles:insertDefinition>