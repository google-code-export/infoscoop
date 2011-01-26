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

import java.util.List;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.hibernate.criterion.DetachedCriteria;
import org.hibernate.criterion.Expression;
import org.hibernate.criterion.Order;
import org.infoscoop.dao.model.Portaladmins;
import org.infoscoop.util.SpringUtil;
import org.springframework.orm.hibernate3.support.HibernateDaoSupport;

public class PortalAdminsDAO extends HibernateDaoSupport {

	private static Log log = LogFactory.getLog(PortalAdminsDAO.class);

	public static PortalAdminsDAO newInstance() {
		return (PortalAdminsDAO) SpringUtil.getContext().getBean(
				"portalAdminsDAO");
	}

	/**
	 * Get the data.
	 * 
	 * @return List
	 */
	public List select() {
		//select * from ${schema}.portaladmins
		return super.getHibernateTemplate().findByCriteria(
				DetachedCriteria.forClass(Portaladmins.class).addOrder(Order.asc("Id")));
	}

	/**
	 * Delete the data.
	 * 
	 */
	public void delete() {
		//delete from ${schema}.portaladmins
		String queryString = "delete from Portaladmins";
		
		super.getHibernateTemplate().bulkUpdate( queryString );
	}

	/**
	 * Insert the data.
	 * 
	 * @param uid
	 */
	public void insert(String uid, String roleId) {
		Portaladmins portalAdmin = new Portaladmins( null, uid );
		portalAdmin.setRoleid(roleId);
		
		super.getHibernateTemplate().save( portalAdmin );
		
		if (log.isInfoEnabled())
			log.info("param[uid=" + uid + ", roleId=" + roleId + "]: insert successfully.");
	}
	
	/**
	 * Get the entitiy of Portaladmins by a key.
	 * 
	 * @param uid
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public Portaladmins selectById(String uid){
		List<Portaladmins> result = super.getHibernateTemplate().findByCriteria(
				DetachedCriteria.forClass(Portaladmins.class).add(Expression.eq("Uid", uid)));
		
		return (result.size() > 0)? result.get(0) : null;
	}
}
