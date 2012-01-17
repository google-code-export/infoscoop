/* infoScoop OpenSource
 * Copyright (C) 2010 Beacon IT Inc.
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License version 3
 * as published by the Free Software Foundation.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public
 * License along with this program.  If not, see
 * <http://www.gnu.org/licenses/lgpl-3.0-standalone.html>.
 */

package org.infoscoop.service;

import java.util.List;
import java.util.Set;

import javax.security.auth.Subject;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.infoscoop.acl.ISPrincipal;
import org.infoscoop.acl.SecurityController;
import org.infoscoop.dao.MenuItemDAO;
import org.infoscoop.dao.MenuTreeDAO;
import org.infoscoop.dao.model.GadgetInstance;
import org.infoscoop.dao.model.GadgetInstanceUserpref;
import org.infoscoop.dao.model.MenuItem;
import org.infoscoop.dao.model.MenuTree;
import org.infoscoop.dao.model.Role;
import org.infoscoop.dao.model.RolePrincipal;
import org.infoscoop.util.RoleUtil;
import org.infoscoop.util.XmlUtil;

public class SiteAggregationMenuService {

	private static Log log = LogFactory.getLog(SiteAggregationMenuService.class);
	
	public String getMenuTreeXml(String menuType, boolean ignoreAccessControl)
			throws Exception {
		try {
			List<MenuTree> trees = null;
			if(menuType.equals("topmenu"))
				trees = MenuTreeDAO.newInstance().getTopMenus();
			else
				trees = MenuTreeDAO.newInstance().getSideMenus();

			for (MenuTree tree : trees) {
				tree.setChildItems();
			}
			
			StringBuffer buf = new StringBuffer();
			buf.append("<sites>\n");

			for(MenuTree tree : trees){
				buildAuthorizedMenuXml(tree, buf, ignoreAccessControl);
			}
			buf.append("</sites>");

			return buf.toString();
		} catch (Exception e) {
			log.error("Unexpected error occurred.", e);
			throw e;
		}
	}
	
	private static void buildAuthorizedMenuXml(MenuTree menuTree, StringBuffer buf, boolean noAuth ) throws ClassNotFoundException{
		if(menuTree.getPublish() == 0)
			return;
		//TODO: make following block to function.
		if(!menuTree.getRoles().isEmpty()){
			Set<Role> roles = menuTree.getRoles();			
			if(!RoleUtil.isAccessible(noAuth, roles))return;
		}
		
		buf.append("<site-top id=\"tree_" + menuTree.getId() + "\"");
		buf.append(" title=\"" + XmlUtil.escapeXmlEntities(menuTree.getTitle())
				+ "\"");
		if(menuTree.getHref() != null)
			buf.append(" href=\""
					+ XmlUtil.escapeXmlEntities(menuTree.getHref()) + "\"");
		buf.append(" alert=\"").append(menuTree.getAlert()).append("\"");
		buf.append(">\n");
		for(MenuItem item: menuTree.getChildItems())
			buildAuthorizedMenuXml(item, buf, noAuth );
		
		buf.append("</site-top>\n");
	}
	
	private static void buildAuthorizedMenuXml(MenuItem menuItem, StringBuffer buf, boolean noAuth ) throws ClassNotFoundException{
		if(!menuItem.isPublishBool())
			return;
		//TODO: make following block to function.
		if(!menuItem.getRoles().isEmpty()){
			Set<Role> roles = menuItem.getRoles();			
			if(!RoleUtil.isAccessible(noAuth, roles))return;
		}
			
		
		buf.append("<site id=\"" + menuItem.getId() + "\"");
		buf.append(" title=\"" + XmlUtil.escapeXmlEntities(menuItem.getTitle())
				+ "\"");
		if(menuItem.getHref() != null)
			buf.append(" href=\""
					+ XmlUtil.escapeXmlEntities(menuItem.getHref()) + "\"");
		GadgetInstance gadgetInstance = menuItem.getGadgetInstance();
		boolean isRemoteGadget = false;
		if (gadgetInstance != null) {
			buf.append(" ginstid=\"" + gadgetInstance.getId() + "\"");
			if(gadgetInstance.getIcon() != null)
				buf.append(" iconUrl=\"" + gadgetInstance.getIcon() +"\"");
			String type = gadgetInstance.getType();
			if (type.indexOf("http") == 0) {
				buf.append(" type=\"Gadget\"");
				isRemoteGadget = true;
			} else if (type.indexOf("upload_") == 0) {
				buf.append(" type=\"g_" + XmlUtil.escapeXmlEntities(type)
						+ "/gadget\"");
			} else
				buf.append(" type=\"" + XmlUtil.escapeXmlEntities(type) + "\"");
		}
		buf.append(" alert=\"").append(menuItem.getAlert()).append("\"");
		buf.append(">\n");
		
		buf.append("<properties>\n");
		if(isRemoteGadget){
			buf.append("<property name=\"url\">");
			buf.append("g_" + gadgetInstance.getType() + "/gadget");
			buf.append("</property>");
		}
		if(gadgetInstance != null && !gadgetInstance.getGadgetInstanceUserPrefs().isEmpty()){
			for(GadgetInstanceUserpref userPref: gadgetInstance.getGadgetInstanceUserPrefs()){
				setElement2Buf(userPref, buf);
			}
		}
		buf.append("</properties>\n");
		
		for(MenuItem item: menuItem.getChildItems())
			buildAuthorizedMenuXml(item, buf, noAuth );
		
		buf.append("</site>\n");
		
	}
	
	private static void setElement2Buf(GadgetInstanceUserpref userPref, StringBuffer buf){
		buf.append("<property name=\"" + userPref.getId().getName() + "\">");
		buf.append(XmlUtil.escapeXmlEntities(userPref.getValue())); 
		buf.append("</property>");
	}
	
}