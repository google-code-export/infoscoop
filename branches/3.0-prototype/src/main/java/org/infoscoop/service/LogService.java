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

import java.util.Date;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.infoscoop.dao.AccessLogDAO;
import org.infoscoop.util.SpringUtil;

public class LogService {
	
	private static Log log = LogFactory.getLog(LogService.class);
	
	private AccessLogDAO accessLogDAO;
	
	public static LogService getHandle() {
		return (LogService) SpringUtil.getBean("LogService");
	}

	public void setAccessLogDAO(AccessLogDAO accessLogDAO) {
		this.accessLogDAO = accessLogDAO;
	}


	public void insertDailyAccessLog(String uid) {
		Date today = new Date();
		this.accessLogDAO.deleteOldLog();

		if (this.accessLogDAO.selectCountByDate(uid, today) == 0) {
			this.accessLogDAO.insert(uid, new Date());
		}
	}
}
