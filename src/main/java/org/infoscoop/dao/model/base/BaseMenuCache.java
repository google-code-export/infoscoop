package org.infoscoop.dao.model.base;

import java.io.Serializable;


/**
 * This is an object that contains data related to the IS_MENUCACHES table.
 * Do not modify this class because it will be overwritten if the configuration file
 * related to this class is modified.
 *
 * @hibernate.class
 *  table="IS_MENUCACHES"
 */

public abstract class BaseMenuCache  implements Serializable {

	public static String REF = "MenuCache";
	public static String PROP_ID = "Id";
	public static String PROP_MENU_IDS = "MenuIds";


	// constructors
	public BaseMenuCache () {
		initialize();
	}

	/**
	 * Constructor for primary key
	 */
	public BaseMenuCache (org.infoscoop.dao.model.MENUCACHEPK id) {
		this.setId(id);
		initialize();
	}

	protected void initialize () {}



	private int hashCode = Integer.MIN_VALUE;

	// primary key
	private org.infoscoop.dao.model.MENUCACHEPK id;

	// fields
	private byte[] menuIds;



	/**
	 * Return the unique identifier of this class
     * @hibernate.id
     */
	public org.infoscoop.dao.model.MENUCACHEPK getId () {
		return id;
	}

	/**
	 * Set the unique identifier of this class
	 * @param id the new ID
	 */
	public void setId (org.infoscoop.dao.model.MENUCACHEPK id) {
		this.id = id;
		this.hashCode = Integer.MIN_VALUE;
	}




	/**
	 * Return the value associated with the column: MENUIDS
	 */
	public byte[] getMenuIds () {
		return menuIds;
	}

	/**
	 * Set the value related to the column: MENUIDS
	 * @param menuIds the MENUIDS value
	 */
	public void setMenuIds (byte[] menuIds) {
		this.menuIds = menuIds;
	}




	public boolean equals (Object obj) {
		if (null == obj) return false;
		if (!(obj instanceof org.infoscoop.dao.model.MenuCache)) return false;
		else {
			org.infoscoop.dao.model.MenuCache menuCache = (org.infoscoop.dao.model.MenuCache) obj;
			if (null == this.getId() || null == menuCache.getId()) return false;
			else return (this.getId().equals(menuCache.getId()));
		}
	}

	public int hashCode () {
		if (Integer.MIN_VALUE == this.hashCode) {
			if (null == this.getId()) return super.hashCode();
			else {
				String hashStr = this.getClass().getName() + ":" + this.getId().hashCode();
				this.hashCode = hashStr.hashCode();
			}
		}
		return this.hashCode;
	}


	public String toString () {
		return super.toString();
	}


}