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

package org.infoscoop.request;

import java.io.UnsupportedEncodingException;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLDecoder;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import net.oauth.OAuthAccessor;
import net.oauth.OAuthConsumer;
import net.oauth.OAuthMessage;
import net.oauth.OAuthServiceProvider;
import net.oauth.client.OAuthClient;
import net.oauth.client.httpclient3.HttpClient3;
import net.oauth.signature.RSA_SHA1;

import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.HttpMethod;
import org.apache.commons.httpclient.NameValuePair;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.infoscoop.acl.SecurityController;
import org.infoscoop.dao.OAuthCertificateDAO;
import org.infoscoop.dao.model.OAuthCertificate;

public class SignedAuthenticator implements Authenticator {
	public static final OAuthClient CLIENT = new OAuthClient(new HttpClient3());
	private static final String PUBLIC_KEY_NAME = "public.cer";

	private static Log log = LogFactory.getLog(SignedAuthenticator.class);

	public SignedAuthenticator() {
	}

	public void doAuthentication(HttpClient client, ProxyRequest request,
			HttpMethod method, String uid, String pwd)
			throws ProxyAuthenticationException {
		try {
			OAuthConsumer consumer = newConsumer();
			OAuthAccessor accessor = new OAuthAccessor(consumer);

			Map<String, String> optionParams = new HashMap<String, String>(
					request.getFilterParameters());

			String targetUrlPath = analyzeUrl(request.getTargetURL(),
					optionParams);

			String userId = SecurityController.getPrincipalByType(
					"UIDPrincipal").getName();
			optionParams.put("opensocial_viewer_id", userId);
			optionParams.put("opensocial_owner_id", userId);
			optionParams.put("opensocial_app_url", request
					.getRequestHeader("gadgetUrl"));
			optionParams.put("opensocial_app_id", request
					.getRequestHeader("moduleId"));
			optionParams.put("opensocial_instance_id", request
					.getRequestHeader("moduleId"));
			optionParams.put("xoauth_signature_publickey", PUBLIC_KEY_NAME);
			optionParams.put("xoauth_public_key", PUBLIC_KEY_NAME);

			OAuthMessage message = new OAuthMessage("GET", targetUrlPath,
					optionParams.entrySet());
			message.addRequiredParameters(accessor);
			List<Map.Entry<String, String>> authParams = message
					.getParameters();
			List<NameValuePair> queryParams = buildQueryParams(authParams);
			method.setQueryString((NameValuePair[]) queryParams
					.toArray(new NameValuePair[0]));
		} catch (Exception e) {
			throw new ProxyAuthenticationException(e);
		}
	}

	public int getCredentialType() {
		return 3;
	}

	protected OAuthConsumer newConsumer() throws ProxyAuthenticationException {
		OAuthCertificate certificate = OAuthCertificateDAO.newInstance().get();
		if (certificate == null)
			throw new ProxyAuthenticationException(
					"a container's certificate is not set.");
		OAuthServiceProvider serviceProvider = new OAuthServiceProvider(null,
				null, null);
		OAuthConsumer consumer = new OAuthConsumer(null, certificate
				.getConsumerKey(), null, serviceProvider);
		consumer.setProperty("oauth_signature_method", "RSA-SHA1");
		consumer.setProperty(RSA_SHA1.PRIVATE_KEY, certificate.getPrivateKey());
		
		return consumer;
	}

	private static String getRequestUrl(URL url) {
		StringBuilder requestUrl = new StringBuilder();
		String scheme = url.getProtocol();
		int port = url.getPort();

		requestUrl.append(scheme);
		requestUrl.append("://");
		requestUrl.append(url.getHost());

		if ((port != -1)
				&& ((scheme.equals("http") && port != 80) || (scheme
						.equals("https") && port != 443))) {
			requestUrl.append(":");
			requestUrl.append(port);
		}

		requestUrl.append(url.getPath());
		return requestUrl.toString();
	}

	private String analyzeUrl(String url, Map<String, String> optionParams)
			throws MalformedURLException {
		URL u = new URL(url);
		String query = u.getQuery();
		if (query != null) {
			String[] params = query.split("&");
			for (int i = 0; i < params.length; i++) {
				try {
					String[] param = params[i].split("=");
					String name = URLDecoder.decode(param[0], "UTF-8");
					if (name.startsWith("oauth") || name.startsWith("xoauth")
							|| name.startsWith("opensocial"))
						continue;
					String value = URLDecoder.decode(param[1], "UTF-8");
					optionParams.put(name, value);
				} catch (UnsupportedEncodingException e) {
					e.printStackTrace();
				}
			}
		}
		return getRequestUrl(u);
	}

	private List<NameValuePair> buildQueryParams(
			List<Map.Entry<String, String>> authParams) {
		List<NameValuePair> params = new ArrayList<NameValuePair>();
		for (Map.Entry<String, String> entry : authParams) {
			params.add(new NameValuePair(entry.getKey(), entry.getValue()));
		}
		return params;
	}
}
