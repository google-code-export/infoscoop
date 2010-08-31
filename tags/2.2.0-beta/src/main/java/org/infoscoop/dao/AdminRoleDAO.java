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

package org.infoscoop.dao;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.hibernate.Criteria;
import org.hibernate.HibernateException;
import org.hibernate.Session;
import org.hibernate.criterion.DetachedCriteria;
import org.hibernate.criterion.Expression;
import org.hibernate.criterion.Order;
import org.infoscoop.dao.model.Adminrole;
import org.infoscoop.util.SpringUtil;
import org.springframework.orm.hibernate3.HibernateCallback;
import org.springframework.orm.hibernate3.support.HibernateDaoSupport;

public class AdminRoleDAO extends HibernateDaoSupport {

	private static Log log = LogFactory.getLog(AdminRoleDAO.class);

	public static AdminRoleDAO newInstance() {
		return (AdminRoleDAO) SpringUtil.getContext().getBean(
				"adminRoleDAO");
	}

	/**
	 * get the data.
	 * 
	 * @return List
	 */
	@SuppressWarnings("unchecked")
	public List select() {
		List result = super.getHibernateTemplate().findByCriteria(DetachedCriteria.forClass(Adminrole.class).addOrder(Order.asc("Id")));
		return result;
	}

	/**
	 * get the Adminrole of appointed ID.
	 * 
	 * @return Adminrole
	 */
	public Adminrole selectById(String id) {
		Adminrole entity = (Adminrole)super.getHibernateTemplate().get(Adminrole.class, id);
		return entity;
	}

	public Adminrole selectByRoleId(String roleId) {
		List<Adminrole> result = (List)super.getHibernateTemplate().findByCriteria(
				DetachedCriteria.forClass(Adminrole.class).add(Expression.eq("Roleid", roleId)));
		return (result.size() > 0)? result.get(0) : null;
	}

	public List<String> getNotAllowDeleteRoleIds() {
		
		List<String> result = (List)super.getHibernateTemplate().executeFind(new HibernateCallback() {
			
			public Object doInHibernate(Session session) throws HibernateException,
					SQLException {
				
				Criteria crit = session.createCriteria(Adminrole.class).add(
						Expression.eq("Allowdelete", new Integer(0)));
				
				List roleIdsList = new ArrayList();
				List<Adminrole> resultList = crit.list();
				for(Iterator<Adminrole> ite=resultList.iterator();ite.hasNext();){
					Adminrole adminRole = ite.next();
					roleIdsList.add(adminRole.getRoleid());
				}
						
				return roleIdsList;
			}
		});
		
		return result;
	}
	
	/**
	 * delete the data.
	 * 
	 */
	public void delete(String id) {
		super.getHibernateTemplate().delete(selectById(id));
	}

	/**
	 * delete the data
	 * 
	 */
	public void delete() {
		String queryString = "delete from Adminrole";
		
		super.getHibernateTemplate().bulkUpdate( queryString );
	}
	/**
	 * insert the data
	 * 
	 * @param uid
	 */
	public void insert(String roleId, String name, String authData, boolean allowDelete) {
		Adminrole adminrole = new Adminrole(null, roleId, name, authData);
		
		adminrole.setAllowdelete((allowDelete)? 1 : 0);
		super.getHibernateTemplate().save( adminrole );
		
		if (log.isInfoEnabled())
			log.info("param[id=" + roleId + ", name=" + name + ", authData=" + authData + "]: insert successfully.");
	}

}
