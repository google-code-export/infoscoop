/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
package org.infoscoop.gadgets.servlet;

import java.io.IOException;
import java.util.Collection;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;

import javax.servlet.http.HttpServletResponse;

import org.apache.commons.httpclient.HttpStatus;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.shindig.auth.SecurityToken;
import org.apache.shindig.common.JsonProperty;
import org.apache.shindig.common.uri.Uri;
import org.apache.shindig.common.uri.UriBuilder;
import org.apache.shindig.gadgets.AuthType;
import org.apache.shindig.gadgets.GadgetException;
import org.apache.shindig.gadgets.http.HttpRequest;
import org.apache.shindig.gadgets.http.HttpResponse;
import org.apache.shindig.gadgets.http.HttpResponseBuilder;
import org.apache.shindig.gadgets.oauth.OAuthArguments;
import org.apache.shindig.gadgets.oauth2.OAuth2Arguments;
import org.apache.shindig.gadgets.servlet.MakeRequestHandler;
import org.apache.shindig.protocol.BaseRequestItem;
import org.apache.shindig.protocol.Operation;
import org.apache.shindig.protocol.ProtocolException;
import org.apache.shindig.protocol.Service;
import org.infoscoop.acl.SecurityController;
import org.infoscoop.web.JsonProxyServlet;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Maps;

/**
 * An alternate implementation of the Http proxy service using the standard API dispatcher for REST
 * / JSON-RPC calls. The basic form of the request is as follows
 * ...
 * method : http.<HTTP method name>
 * params : {
 *    href : <endpoint to fetch content from>,
 *    headers : { <header-name> : [<header-value>, ...]},
 *    format : <"text", "json", "feed">
 *    body : <request body>
 *    gadget : <url of gadget spec for calling application>
 *    authz: : <none | oauth | signed>,
 *    sign_owner: <boolean, default true>
 *    sign_viewer: <boolean, default true>
 *    ...<additional auth arguments. See OAuthArguments>
 *    summarize : <If contentType == "FEED" summarize the results. Default false>
 *    entryCount : <If contentType == "FEED" limit results to specified no of items. Default 3>
 * }
 *
 * A successful response response will have the form
 *
 * data : {
 *    status : <HTTP status code.>
 *    headers : { <header name> : [<header val1>, <header val2>, ...], ...}
 *    content : <response body>: string if 'text', JSON is 'feed' or 'json' format
 *    token : <If security token provides a renewed value.>
 *    metadata : { <metadata entry> : <metadata value>, ...}
 * }
 *
 * It's important to note that requests which generate HTTP error responses such as 500 are returned
 * in the above format. The RPC itself succeeded in these cases. If an RPC error occurred the client
 * should introspect the error message for information as to the cause.
 *
 * TODO: send errors using "result", not plain content
 *
 * @see MakeRequestHandler
 */
@Service(name = "http")
public class HttpRequestHandler {
  private static Log log = LogFactory.getLog(HttpRequestHandler.class);
  static final Set<String> BAD_HEADERS = ImmutableSet.of("HOST", "ACCEPT-ENCODING");

  /** Execute an HTTP GET request */
  @Operation(httpMethods = {"POST","GET"}, path = "/get")
  public HttpApiResponse get(BaseRequestItem request) {
    HttpApiRequest httpReq = request.getTypedRequest(HttpApiRequest.class);
    assertNoBody(httpReq, "GET");
    return execute("GET", httpReq, request);
  }

  /** Execute an HTTP POST request */
  @Operation(httpMethods = "POST", path = "/post")
  public HttpApiResponse post(BaseRequestItem request) {
    HttpApiRequest httpReq = request.getTypedRequest(HttpApiRequest.class);
    return execute("POST", httpReq, request);
  }

  /** Execute an HTTP PUT request */
  @Operation(httpMethods = "POST", path = "/put")
  public HttpApiResponse put(BaseRequestItem request) {
    HttpApiRequest httpReq = request.getTypedRequest(HttpApiRequest.class);
    return execute("PUT", httpReq, request);
  }

  /** Execute an HTTP DELETE request */
  @Operation(httpMethods = "POST", path = "/delete")
  public HttpApiResponse delete(BaseRequestItem request) {
    HttpApiRequest httpReq = request.getTypedRequest(HttpApiRequest.class);
    assertNoBody(httpReq, "DELETE");
    return execute("DELETE", httpReq, request);
  }

  /** Execute an HTTP HEAD request */
  @Operation(httpMethods = {"POST","GET"}, path = "/head")
  public HttpApiResponse head(BaseRequestItem request) {
    HttpApiRequest httpReq = request.getTypedRequest(HttpApiRequest.class);
    assertNoBody(httpReq, "HEAD");
    return execute("HEAD", httpReq, request);
  }

  private void assertNoBody(HttpApiRequest httpRequest, String method) {
    if (httpRequest.body != null) {
      throw new ProtocolException(HttpServletResponse.SC_BAD_REQUEST,
         "Request body not supported for " + method);
    }
  }

  /**
   * Dispatch the request
   *
   * @param method HTTP method to execute
   * @param requestItem TODO
   */
  private HttpApiResponse execute(String method, HttpApiRequest httpApiRequest,
      BaseRequestItem requestItem) {
    if (httpApiRequest.href == null) {
      throw new ProtocolException(HttpServletResponse.SC_BAD_REQUEST, "href parameter is missing");
    }
    // Canonicalize the path
    Uri href = normalizeUrl(httpApiRequest.href);
    try {
      HttpRequest req = new HttpRequest(href);
      req.setMethod(method);
      if (httpApiRequest.body != null) {
        req.setPostBody(httpApiRequest.body.getBytes());
      }

      // Copy over allowed headers
      for (Map.Entry<String, List<String>> header : httpApiRequest.headers.entrySet()) {
        if (!BAD_HEADERS.contains(header.getKey().trim().toUpperCase())) {
          for (String value : header.getValue()) {
            req.addHeader(header.getKey(), value);
          }
        }
      }

      // Extract the gadget URI from the request or the security token
      Uri gadgetUri = getGadgetUri(requestItem.getToken(), httpApiRequest);
      if (gadgetUri == null) {
        throw new ProtocolException(HttpServletResponse.SC_BAD_REQUEST,
            "Gadget URI not specified in request");
      }
      req.setGadget(gadgetUri);

      // Detect the authz parsing
      if (httpApiRequest.authz != null) {
        req.setAuthType(AuthType.parse(httpApiRequest.authz));
      }
      
      HttpResponse results = null;
      String oauthApprovalUrl = null;
      try {
      	Map<String, String> proxyParams = new HashMap<String, String>();
      	
        final AuthType authz = req.getAuthType();
        req.setSecurityToken(requestItem.getToken());

        if (authz == AuthType.OAUTH2) {
            Map<String, String> authSettings = getAuthSettings(requestItem);
            OAuth2Arguments oauth2Args = new OAuth2Arguments(authz, authSettings);

            req.setOAuth2Arguments(oauth2Args);
            
            proxyParams.put("OAUTH_SERVICE_NAME", (String)authSettings.get("OAUTH_SERVICE_NAME"));
        	proxyParams.put("hostPrefix", req.getSecurityToken().getContainer());
        	proxyParams.put("userAuthorizationURL", requestItem.getParameter("userAuthorizationURL"));
        	proxyParams.put("accessTokenURL", requestItem.getParameter("accessTokenURL"));
        	proxyParams.put("OAUTH2_SCOPE", requestItem.getParameter("OAUTH2_SCOPE"));
        } else if(authz == AuthType.OAUTH){
            Map<String, String> authSettings = getAuthSettings(requestItem);
            OAuthArguments oauthArgs = new OAuthArguments(authz, authSettings);
            oauthArgs.setSignOwner(httpApiRequest.signOwner);
            oauthArgs.setSignViewer(httpApiRequest.signViewer);
            
            req.setOAuthArguments(oauthArgs);
            
        	proxyParams.put("OAUTH_SERVICE_NAME", oauthArgs.getServiceName());
        	proxyParams.put("hostPrefix", req.getSecurityToken().getContainer());
        	proxyParams.put("requestTokenURL", requestItem.getParameter("requestTokenURL"));
        	proxyParams.put("requestTokenMethod", requestItem.getParameter("requestTokenMethod"));
        	proxyParams.put("userAuthorizationURL", requestItem.getParameter("userAuthorizationURL"));
        	proxyParams.put("accessTokenURL", requestItem.getParameter("accessTokenURL"));
        	proxyParams.put("accessTokenMethod", requestItem.getParameter("accessTokenMethod"));
        }
    	String contentType = req.getContentType();
    	String uri = req.getUri().toString();
    	proxyParams.put("moduleId", req.getSecurityToken().getAppId());
    	proxyParams.put("gadgetUrl", req.getGadget().toString());
    	proxyParams.put("authz", authz.name());
    	proxyParams.put("url", uri);
    	proxyParams.put("contentType", contentType);
    	proxyParams.put("httpMethod", req.getMethod());
    	proxyParams.put("postData", req.getPostBodyAsString());
    	
    	String uid = SecurityController.getPrincipalByType("UIDPrincipal").getName();
    	
    	// execute request
		JSONObject resJson = JsonProxyServlet.invokeJSONProxyRequest(uid, proxyParams, req.getHeaders());
		resJson = resJson.getJSONObject(uri);
		
		JSONObject headersJson = new JSONObject();
		
		if(resJson.has("headers"))
			headersJson = resJson.getJSONObject("headers");
		if(resJson.has("oauthApprovalUrl"))
			oauthApprovalUrl = resJson.getString("oauthApprovalUrl");
		
		int rc = resJson.getInt("rc");
		
	    results = makeResponse(rc, headersJson, resJson.getString("body"));
	  } catch (Exception e) {
		  log.error(e.getMessage(), e);
		  throw new ProtocolException(HttpStatus.SC_INTERNAL_SERVER_ERROR, e.getMessage(), e);
	  }

      HttpApiResponse httpApiResponse = new HttpApiResponse(results,
          transformBody(httpApiRequest, results),
          httpApiRequest);

      Map<String, String> meta = new HashMap<String, String>();
      if(oauthApprovalUrl != null)
    	  meta.put("oauthApprovalUrl", oauthApprovalUrl);
      httpApiResponse.setMetadata(meta);
      
      // Renew the security token if we can
      if (requestItem.getToken() != null) {
        String updatedAuthToken = requestItem.getToken().getUpdatedToken();
        if (updatedAuthToken != null) {
          httpApiResponse.token = updatedAuthToken;
        }
      }
      return httpApiResponse;
    } catch (GadgetException ge) {
      log.error(ge.getMessage(), ge);
      throw new ProtocolException(ge.getHttpStatusCode(), ge.getMessage(), ge);
    }
  }

  private HttpResponse makeResponse(int rc, JSONObject headersJson, String body) throws IOException, JSONException {
    HttpResponseBuilder builder = new HttpResponseBuilder();

    if(headersJson != null){
    	for(@SuppressWarnings("rawtypes")
		Iterator ite=headersJson.keys();ite.hasNext();){
    		String key = (String)ite.next();
    		JSONArray values = headersJson.getJSONArray(key);
    		for(int i=0;i<values.length();i++){
        		builder.addHeader(key, (String)values.get(i));
    		}
    	}
    }
    
    return builder
        .setHttpStatusCode(rc)
        .setResponse(body.getBytes())
        .create();
  }

  /**
   * Extract all unknown keys into a map for extra auth params.
   */
  private Map<String, String> getAuthSettings(BaseRequestItem requestItem) {
    // Keys in a request item are always Strings
    @SuppressWarnings("unchecked")
    Set<String> allParameters = requestItem.getTypedRequest(Map.class).keySet();
    
//    Map<String, String> authSettings = Maps.newHashMap();
    Map<String, String> authSettings = new TreeMap<String,String>(String.CASE_INSENSITIVE_ORDER);
    for (String paramName : allParameters) {
      if (!HttpApiRequest.KNOWN_PARAMETERS.contains(paramName)) {
        authSettings.put(paramName, requestItem.getParameter(paramName));
      }
    }
    
    return authSettings;
  }


  protected Uri normalizeUrl(Uri url) {
    if (url.getScheme() == null) {
      // Assume http
      url = new UriBuilder(url).setScheme("http").toUri();
    }

    if (url.getPath() == null || url.getPath().length() == 0) {
      url = new UriBuilder(url).setPath("/").toUri();
    }

    return url;
  }


  /** Format a response as JSON, including additional JSON inserted by chained content fetchers. */
  protected Object transformBody(HttpApiRequest request, HttpResponse results)
      throws GadgetException {
    String body = results.getResponseAsString();
    /*
    if ("feed".equalsIgnoreCase(request.format)) {
      return processFeed(request, body);
    } else
    */ 
    if ("json".equalsIgnoreCase(request.format)) {
      try {
        body = body.trim();
        if(body.length() > 0 && body.charAt(0) == '[') {
          return new JSONArray(body);
        } else {
          return new JSONObject(body);
        }
      } catch (JSONException e) {
        // TODO: include data block with invalid JSON
        throw new ProtocolException(HttpServletResponse.SC_NOT_ACCEPTABLE, "Response not valid JSON", e);
      }
    }
    
    return body;
  }

  /** Processes a feed (RSS or Atom) using FeedProcessor. */
  /*
  protected Object processFeed(HttpApiRequest req, String responseBody)
      throws GadgetException {
    return feedProcessorProvider.get().process(req.href.toString(), responseBody, req.summarize,
        req.entryCount);
  }
  */

  /** Extract the gadget URL from the request or the security token */
  protected Uri getGadgetUri(SecurityToken token, HttpApiRequest httpApiRequest) {
    if (token != null && token.getAppUrl() != null) {
      return Uri.parse(token.getAppUrl());
    }
    return null;
  }

  /**
   * Simple type that represents an Http request to execute on the callers behalf
   */
  public static class HttpApiRequest {
    static final Set<String> KNOWN_PARAMETERS = ImmutableSet.of(
        "href", "headers", "body", "gadget", "authz", "sign_owner",
        "sign_viewer", "format", "refreshInterval", "noCache", "sanitize",
        "summarize", "entryCount");

    // Content to fetch / execute
    Uri href;

    Map<String, List<String>> headers = Maps.newHashMap();

    /** POST body */
    String body;

    /** Authorization type ("none", "signed", "oauth") */
    String authz = "none";
    
    /** Should the request be signed by owner? */
    boolean signOwner = true;
    
    /** Should the request be signed by viewer? */
    boolean signViewer = true;
    
    // The format type to coerce the response into. Supported values are
    // "text", "json", and "feed".
    String format;

    // Use Integer here to allow for null
    Integer refreshInterval;

    // Bypass http caches
    boolean noCache;

    // Use HTML/CSS sanitizer
    boolean sanitize;

    // Control feed handling
    boolean summarize;
    int entryCount = 3;

    public Uri getHref() {
      return href;
    }

    public void setHref(Uri url) {
      this.href = url;
    }

    public Map<String, List<String>> getHeaders() {
      return headers;
    }

    public void setHeaders(Map<String, List<String>> headers) {
      this.headers = headers;
    }

    public String getBody() {
      return body;
    }

    public void setBody(String body) {
      this.body = body;
    }

    public Integer getRefreshInterval() {
      return refreshInterval;
    }

    public void setRefreshInterval(Integer refreshInterval) {
      this.refreshInterval = refreshInterval;
    }

    public boolean isNoCache() {
      return noCache;
    }

    public void setNoCache(boolean noCache) {
      this.noCache = noCache;
    }

    public boolean isSanitize() {
      return sanitize;
    }

    public void setSanitize(boolean sanitize) {
      this.sanitize = sanitize;
    }

    public String getFormat() {
      return format;
    }

    public void setFormat(String format) {
      this.format = format;
    }

    public String getAuthz() {
      return authz;
    }
    
    public void setAuthz(String authz) {
      this.authz = authz;
    }

    public boolean isSignViewer() {
      return signViewer;
    }
    
    @JsonProperty("sign_viewer")
    public void setSignViewer(boolean signViewer) {
      this.signViewer = signViewer;
    }
    
    public boolean isSignOwner() {
      return signOwner;
    }
    
    @JsonProperty("sign_owner")
    public void setSignOwner(boolean signOwner) {
      this.signOwner = signOwner;
    }
    
    public boolean isSummarize() {
      return summarize;
    }

    public void setSummarize(boolean summarize) {
      this.summarize = summarize;
    }

    public int getEntryCount() {
      return entryCount;
    }

    public void setEntryCount(int entryCount) {
      this.entryCount = entryCount;
    }
  }

  /**
   * Response to request for Http content
   */
  public static class HttpApiResponse {
    // Http status code
    int status;
    
    // Returned headers
    Map<String, Collection<String>> headers;

    // Body content, either a String or a JSON-type structure
    Object content;

    // Renewed security token if available
    String token;

    // Metadata associated with the response.
    Map<String, String> metadata;

    public HttpApiResponse(int status) {
      this.status = status;
    }

    /**
     * Construct response based on HttpResponse from fetcher
     */
    public HttpApiResponse(HttpResponse response, Object content, HttpApiRequest httpApiRequest) {
      this.status = response.getHttpStatusCode();
      this.headers = new TreeMap<String, Collection<String>>(String.CASE_INSENSITIVE_ORDER);

      if (response.getHeaders().containsKey("set-cookie")) {
        this.headers.put("set-cookie", response.getHeaders("set-cookie"));
      }
      if (response.getHeaders().containsKey("location")) {
        this.headers.put("location", response.getHeaders("location"));
      }
      
      this.content = content;

      this.metadata = response.getMetadata();
    }

    public int getStatus() {
      return status;
    }

    public void setStatus(int status) {
      this.status = status;
    }

    public Map<String, Collection<String>> getHeaders() {
      return headers;
    }

    public void setHeaders(Map<String, Collection<String>> headers) {
      this.headers = headers;
    }

    public Object getContent() {
      return content;
    }

    public void setContent(Object content) {
      this.content = content;
    }

    public String getToken() {
      return token;
    }

    public void setToken(String token) {
      this.token = token;
    }

    public Map<String, String> getMetadata() {
      // TODO - Review this once migration of JS occurs. Currently MakeRequestHandler suppresses
      // this on output but that choice may not be the best one for compatibility.
      // Suppress metadata on output if it's empty
      if (metadata != null && metadata.isEmpty()) {
        return null;
      }
      return metadata;
    }

    public void setMetadata(Map<String, String> metadata) {
      this.metadata = metadata;
    }
  }
}
