package org.infoscoop.util.spring;

import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.web.servlet.view.AbstractView;

public class XmlView extends AbstractView {
	private String body;

	public void setResponseBody(String body) {
		this.body = body;
	}

	public String getContentType() {
		return "text/xml; charset=UTF-8";
	}

	@Override
	protected void renderMergedOutputModel(Map<String, Object> map,
			HttpServletRequest request, HttpServletResponse response)
			throws Exception {
		response.setContentType("text/xml; charset=UTF-8");
		response.getWriter().write(body);
	}
}
