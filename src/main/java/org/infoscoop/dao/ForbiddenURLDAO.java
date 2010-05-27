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

import java.util.Collection;


import org.infoscoop.dao.model.Forbiddenurls;
import org.infoscoop.util.SpringUtil;
import org.springframework.orm.hibernate3.support.HibernateDaoSupport;

public class ForbiddenURLDAO extends HibernateDaoSupport {
//	private static Log log = LogFactory.getLog(ForbiddenURLDAO.class);
	
	public static ForbiddenURLDAO newInstance() {
        return (ForbiddenURLDAO)SpringUtil.getContext().getBean("forbiddenURLDAO");
	}
	
	public Collection getForbiddenUrls() {
		String queryString = "from Forbiddenurls order by Id desc";
		
		return super.getHibernateTemplate().find( queryString );
	}
	
	public boolean isForbiddenUrl( String url ){
		String queryString = "from Forbiddenurls where Url = ?";
		
		return super.getHibernateTemplate().find( queryString,
				new Object[]{ url }).iterator().hasNext();
	}
	
	
	public void delete(Forbiddenurls forbiddenUrl) {
		super.getHibernateTemplate().delete( forbiddenUrl );
	}

	public void update(Forbiddenurls forbiddenUrl) {
		super.getHibernateTemplate().update( forbiddenUrl );
	}

	public void insert(Forbiddenurls forbiddenUrl) {
		super.getHibernateTemplate().save( forbiddenUrl );
		
	}
}
