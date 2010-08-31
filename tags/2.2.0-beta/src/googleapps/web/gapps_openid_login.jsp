<%--
# infoScoop Calendar
# Copyright (C) 2010 Beacon IT Inc.
# 
# This program is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License
# as published by the Free Software Foundation; either version 2
# of the License, or (at your option) any later version.
# 
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
# 
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see
# <http://www.gnu.org/licenses/old-licenses/gpl-2.0.html>.
--%>

<%@ page session="true" %>
<html>
<body>
<%
    if (request.getParameter("logout")!=null)
    {
        session.removeAttribute("user");
        session.removeAttribute("Uid");
%>
    Logged out!<p>
<%
    }
	if (session.getAttribute("openid")==null) {
%>
<form method="POST" action="openid_login">
<strong>Your Domain for Google Apps:</strong>
<input type="text" name="hd" size="60"/>
<input type="submit" value="Login"/>
</form>
<%	
} else {
%>
Logged in as <%= session.getAttribute("openid") %><p>
<a href="?logout=true">Log out</a>

<% } %>
</body>
</html>
