package org.infoscoop.dao.model;

// Generated 2010/03/29 15:54:59 by Hibernate Tools 3.3.0.GA

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import static javax.persistence.GenerationType.IDENTITY;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.UniqueConstraint;

/**
 * IsPortaladmins generated by hbm2java
 */
@Entity
@Table(name = "is_portaladmins", uniqueConstraints = @UniqueConstraint(columnNames = "UID"))
public class Portaladmin implements java.io.Serializable {

	private Integer id;
	private Adminrole adminrole;
	private String uid;

	public Portaladmin() {
	}

	public Portaladmin(String uid) {
		this.uid = uid;
	}

	public Portaladmin(Adminrole adminrole, String uid) {
		this.adminrole = adminrole;
		this.uid = uid;
	}

	@Id
	@GeneratedValue(strategy = IDENTITY)
	@Column(name = "id", unique = true, nullable = false)
	public Integer getId() {
		return this.id;
	}

	public void setId(Integer id) {
		this.id = id;
	}

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "ROLEID")
	public Adminrole getAdminrole() {
		return this.adminrole;
	}

	public void setAdminrole(Adminrole adminrole) {
		this.adminrole = adminrole;
	}

	@Column(name = "UID", unique = true, nullable = false, length = 150)
	public String getUid() {
		return this.uid;
	}

	public void setUid(String uid) {
		this.uid = uid;
	}

}
