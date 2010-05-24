package org.infoscoop.account;

import java.util.Collection;

import javax.security.auth.Subject;

import org.infoscoop.util.SpringUtil;
import org.springframework.beans.factory.NoSuchBeanDefinitionException;

public class AuthenticationService {

	private IAccountManager manager;
	
	public static AuthenticationService getInstance() {
		try {
			return (AuthenticationService) SpringUtil
					.getBean("authenticationService");
		} catch (NoSuchBeanDefinitionException e) {
			return null;
		}
	}

	public void setAccountManager(IAccountManager manager){
		this.manager = manager;
	}

	public void login(String userid, String password) throws AuthenticationException{
		this.manager.login(userid, password);
	}
	
	public Subject getSubject(String userid) throws Exception{
		return this.manager.getSubject(userid);
	}

	public boolean enableChangePassword(){
		return this.manager.enableChangePassword();
	}

	public void changePassword(String userid, String password, String oldPassword) throws AuthenticationException{
		this.manager.changePassword(userid, password, oldPassword);
	}

	public Collection<PrincipalDef> getPrincipalDefs(){
		return this.manager.getPrincipalDefs();
	}

	public IAccountManager getAccountManager() {
		return this.manager;
	}
}