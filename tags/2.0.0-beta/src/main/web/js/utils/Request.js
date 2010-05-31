/* CommandQueue */
IS_Request = {};
IS_Request.Queue = function (servName, time, disabled, checkDuplicate){
	this.url=hostPrefix + servName;
	var queued=new Array();
	var sent=new Array();

	var isLoading = false;
	
	this.STATUS_QUEUED=-1;
	this.STATE_UNINITIALIZED=0;
	this.STATE_LOADING=1;
	this.STATE_LOADED=2;
	this.STATE_INTERACTIVE=3;
	this.STATE_COMPLETE=4;
	this.STATE_PROCESSED=5;

	this.PRIORITY_NORMAL=0;
	this.PRIORITY_IMMEDIATE=1;


	this.addCommand = function(command){
		if(disabled) return;
		if (this.isCommand(command)){
			if( ["AddLog","UpdateRssMeta"].contains( command.type ) && accessLogEntry === false ) {
				return;
			}
			
			queued.push(command);
			if (command.priority==this.PRIORITY_IMMEDIATE){
				this.fireRequest();
			}
		}
	}

	this.fireRequest = function(){
		//if (queued.length==0 || isLoading || this.freeze || disabled){
		if ( isLoading || this.freeze || disabled){
			return;
		}
		isLoading = true;
		var data="<?xml version=\"1.0\"?><commands buildVersion=\"" + IS_Portal.buildVersion + "\">";
		var registeredCmd = new Object();
		var cmdList = new Array();
		for(var i = queued.length; i > 0;  i--){
			var cmd=queued[(i - 1)];
			if (this.isCommand(cmd)){
				if(!checkDuplicate || !registeredCmd[cmd.id]){
					registeredCmd[cmd.id]=cmd;
					cmdList.push(cmd);
				}
			}
		}
		for(var i = cmdList.length; i > 0; i--){
			var cmd=cmdList[(i - 1)];
			data+=cmd.toRequestString();
			
			sent[cmd.id]=cmd;
		}
		data +="</commands>";
		
		queued = new Array();
//		IS_Request.send(this.url,"POST",this.onload,data,true);
//		IS_Request.send(this.url,"POST",this.onload.bind(this),data,true);
		function postError(){
			for(var i = 0; i < cmdList.length; i++){
				var cmd = cmdList[i];
				if(!cmd.firstFailed){
					cmd.firstFailed = true;
					queued.push(cmd);
				}else{

					msg.error(IS_R.getResource(IS_R.ms_doubleEntryFailure, [cmd.id]));

				}
			}
			isLoading = false;
		}
				
		var opt = {
			method: 'post',
			postBody: data,
			asynchronous: IS_Request.asynchronous,
			requestHeaders: is_userId ? ["Uid", is_userId] : false,
			contentType: "application/xml",
			onSuccess: this.onload.bind(this),
			onFailure: function(t) {

				msg.warn(IS_R.getResource(IS_R.ms_commandonFailure, [t.status,t.statusText]));
				postError();
			},
			onException: function(r, t){

				msg.warn(IS_R.getResource(IS_R.ms_commandonException, [t]));
				postError();
			}
		};
		
		//new Ajax.Request(this.url, opt);
		AjaxRequest.invoke(this.url, opt);
	}

	this.isCommand = function(obj){
		return (
			obj.id
			&& obj.toRequestString
			&& obj.parseResponse
			&& (obj.id.indexOf("previewWidget_") < 0)
		);
	}

	this.repeat = function(freq){
		if(disabled) return;
		this.unrepeat();
		if (freq>0){
			this.freq=freq;
//			this.repeater=setInterval('this.fireRequest()',freq*1000);
			this.repeater=setInterval(this.fireRequest.bind(this),freq*1000);
		}
	}

	this.unrepeat = function(){
		if (this.repeater){
			clearInterval(this.repeater);
		}
		this.repeater=null;
	}

	this.onload=function(req){
		var xmlDoc=req.responseXML;
		var elDocRoot=xmlDoc.getElementsByTagName("responses")[0];
		try{
		if (elDocRoot){
			for(var i=0;i<elDocRoot.childNodes.length && !this.freeze;i++){
				elChild=elDocRoot.childNodes[i];
				if (elChild.nodeName=="command"){
					var attrs=elChild.attributes;
					var id=attrs.getNamedItem("id").value;
					var status=attrs.getNamedItem("status").value;
					if(id == '' || status != 'ok') {
						var reason = attrs.getNamedItem("message").value;
//						msg.error("failed to execute command.\n\n" + reason);
						alert(IS_R.ms_custmizeFailedReload + "\n\n" + reason);
						this.freeze = true;
						window.location.reload();
					} else {
						var command=sent[id];
						if (command){
							command.parseResponse(elChild);
						}
					}
				}
			}
		}
		if( Browser.isSafari1 ) {
			req.responseText = Browser.Safari.responseText( req.responseText );
		}
		
		}catch(e){
			msg.warn(getText(e));
		}
		isLoading = false;
	}

	this.onerror=function(){
	  alert("problem sending the data to the server");
	}

	this.repeat(time);
}

/*
 * Form where you enter userID and password for Authentication Widget
 */
IS_Request.createAuthForm = function(elmId, authFormSubmitFunc){

	var authDiv = document.createElement('div');
	
	authDiv.innerHTML = "<div style='color:red;font-size:90%;padding:2px;'>" + IS_R.ms_noPermission + "</div>";
	authDiv.innerHTML += "<div style='font-size:90%;padding:2px;'>" + IS_R.ms_inputCredential + "</div>";
	
	var authFormDiv = document.createElement('div');

	authFormDiv.style.textAlign = 'center';
	authFormDiv.style.padding = '3px';
	var authFormTable = document.createElement('table');
	var authFormTbody = document.createElement('tbody');

	var tr = document.createElement('tr');
	var td = document.createElement('td');
	td.style.textAlign = 'right';
	//User ID
	td.appendChild(document.createTextNode(IS_R.lb_userID));
	tr.appendChild(td);

	td = document.createElement('td');
	td.style.textAlign = 'left';
	var uidInput = document.createElement('input');
	uidInput.id = elmId + "_authUid";
	uidInput.maxLength = 100;
	td.appendChild(uidInput);
	tr.appendChild(td);
	authFormTbody.appendChild(tr);
	
	var tr = document.createElement('tr');
	var td = document.createElement('td');
	td.style.textAlign = 'right';
	//Password
	td.appendChild(document.createTextNode(IS_R.lb_password));
	tr.appendChild(td);

	var td = document.createElement('td');
	var passwdInput = document.createElement("input");
	passwdInput.id = elmId + "_authPasswd";
	passwdInput.type = 'password';
	passwdInput.maxLength = 50;
	td.appendChild(passwdInput);
	tr.appendChild(td);
	authFormTbody.appendChild(tr);
	authFormTable.appendChild(authFormTbody);
	authFormDiv.appendChild(authFormTable);
	
	
	var okInput = document.createElement("input");
	okInput.type = "button";
	//Register
	okInput.value = IS_R.lb_entry;
	IS_Event.observe(okInput, "click", function(){ 
		if(!uidInput.value){
			//Enter user ID
			alert(IS_R.ms_userIdEmpty);
			return;
		}
		IS_Event.unloadCache(elmId + "_authSubmitBtn"); 
		authFormSubmitFunc(); 
	}, false, elmId + "_authSubmitBtn");
	authFormDiv.appendChild(okInput);

	authDiv.appendChild(authFormDiv);
	return authDiv;
}

IS_Request.createModalAuthFormDiv = function(label, element, _callback, isModal, errorMsg){
	var credentialFormDiv = document.createElement('div');
	credentialFormDiv.id = 'credentialFormDiv';
	if(errorMsg)credentialFormDiv.innerHTML =  "<div style='color:red;font-size:90%;padding:2px;'>" + errorMsg + "</div>";
	var credentialFieldSet = document.createElement('fieldSet');
	var credentialLegend = document.createElement('legend');
	//Enter authentication information：
	credentialLegend.appendChild(document.createTextNode(IS_R.ms_inputCredential));
	credentialFieldSet.appendChild(credentialLegend);
	
	var credentialFormTable = document.createElement('table');
	credentialFormTbody = document.createElement('tbody');
	userNameTr = document.createElement('tr');
	userNameLabelTd = document.createElement('td');
	//User ID
	userNameLabelTd.appendChild(document.createTextNode(IS_R.lb_userID));
	userNameTr.appendChild(userNameLabelTd);
	
	userNameInputTd = document.createElement('td');
	var userNameInput = document.createElement("input");
	userNameInput.id = "previewUserNameForm";
	userNameInputTd.appendChild(userNameInput);
	userNameInput.maxLength = 100;
	userNameTr.appendChild(userNameInputTd);
	
	credentialFormTbody.appendChild(userNameTr);
	
	passwordTr = document.createElement('tr');
	passwordLabelTd = document.createElement('td');
	//Password
	passwordLabelTd.appendChild(document.createTextNode(IS_R.lb_password));
	passwordTr.appendChild(passwordLabelTd);
	
	passwordInputTd = document.createElement('td');
	var passwordInput = document.createElement("input");
	passwordInput.id = "previewPasswordForm";
	passwordInput.type = "password";
	passwordInput.maxLength = 50;
	passwordInputTd.appendChild(passwordInput);
	passwordTr.appendChild(passwordInputTd);
	
	credentialFormTbody.appendChild(passwordTr);
	credentialFormTable.appendChild(credentialFormTbody);
	
	credentialFieldSet.appendChild(credentialFormTable);

	var credentialFormBtn = document.createElement("input");
	credentialFormBtn.type = "button";
	credentialFormBtn.value = label;
	credentialFieldSet.appendChild(credentialFormBtn);
	
	var cancelBtn = document.createElement("input");
	cancelBtn.type = "button";
	//Cancel
	cancelBtn.value = IS_R.lb_cancel;
	credentialFieldSet.appendChild(cancelBtn);

	var modal;
	credentialFormDiv.appendChild(credentialFieldSet);
	IS_Event.observe( cancelBtn, 'click', function(){
		if(isModal){
			modal.close();
			//_callback();
		}else{
			element.parentNode.removeChild( credentialFormDiv.parentNode );
			_callback();
		}
		IS_Event.unloadCache("_credentialForm");
	}, false, "_credentialForm");

	var isOK = false;
	IS_Event.observe( credentialFormBtn, 'click', function(){
		isOK = true;
		if(isModal){
			modal.close();
		}else{
			element.parentNode.removeChild( credentialFormDiv.parentNode );
		}
		var authUid = userNameInput.value;
		var authPassword = passwordInput.value;
		if(authPassword)
		  authPassword = rsaPK.encrypt(authPassword);
		_callback(authUid, authPassword);
		//is_processUrlContents(url, displayPreview.bind(this, url), function(){}, ["authType", authType, "authuserid",authUid,"authpassword",authPassword]);
		IS_Event.unloadCache("_credentialForm");
	} , false, "_credentialForm");

	if(isModal){
		function afterCloseFunc(){
			if(!isOK)
				_callback();
		}
		modal = new Control.Modal(element,
				  {
					contents: credentialFormDiv,
					opacity: 0.5,
					position: 'relative',
					width: '300',
					afterClose: afterCloseFunc
				  }
			  );
		modal.open();
		element.onclick = function(){};//stopObserving does not listen
	}else{
		var div = document.createElement("span");
		div.style.position = "relative";
		div.style.height = 0;
		div.style.width = 0;
		if( element.nextSibling ) {
			element.parentNode.insertBefore( div,element.nextSibling );
		} else {
			element.parentNode.appendChild( div );
		}
		
		credentialFormDiv.style.position = 'absolute';
		credentialFormDiv.style.backgroundColor = '#eeeeee';
		credentialFormDiv.style.top = -element.offsetHeight -4;
		credentialFormDiv.style.right = 0;
		credentialFormDiv.style.zIndex = 10000;
		
		div.appendChild( credentialFormDiv );
		IS_Event.observe( window.document, 'click', function(e){
			var mouseX = Event.pointerX(e);
			var mouseY = Event.pointerY(e);
			if(!isInObject(mouseX,mouseY,'credentialFormDiv')){
				_callback();
				if( element.parentNode )
					element.parentNode.removeChild( credentialFormDiv.parentNode );
				IS_Event.unloadCache("_credentialForm");
			}
		}, false, "_credentialForm");
	}
	userNameInput.focus();
};

IS_Request.showCredentialList = function(e){
	IS_Event.unloadCache("_authCredentialList");
	
	var window = new Window({
	  className: "alphacube",
	  
	  title: IS_R.lb_credentialList,
	  width:600,
	  height:350,
	  minimizable: false,
	  maximizable: false,
	  resizable: true,
	  showEffect: Element.show,
	  hideEffect: Element.hide,
	  recenterAuto: false,
		//destroyOnClose: true,
	  onClose:function(){
	  },
	  zIndex: 10000
	});

	function getAuthUrlList(_credentialId){
		var authUrlList = [];
		for(tabId in IS_Portal.widgetLists ){
			for(widgetId in IS_Portal.widgetLists[tabId] ) {
				if(IS_Portal.widgetLists[tabId][widgetId].getUrlByCredentialId){
					var result = IS_Portal.widgetLists[tabId][widgetId].getUrlByCredentialId(_credentialId);
					authUrlList = result.urlList.concat(authUrlList);
				}
			}
		}
		return authUrlList;
	}
	
	var opt = {
	  method: 'get',
	  asynchronous: true,
	  contentType: "application/xml",
	  onSuccess: function(req, obj){
		  var credentialList = eval(req.responseText);
		  var credentialListDiv = document.createElement('div');
		  credentialListDiv.className = 'authCredentialInfoList';
		  
		  for(var i = 0; i < credentialList.length; i++){
			  
			  var authUrlList = getAuthUrlList(credentialList[i].id);
			  authUrlList = authUrlList.uniq();
			  
			  if(credentialList[i].sysNum == 0 && authUrlList.length == 0){
				  IS_Request.removeCredential(credentialList[i].id);
				  //the function of deleting authentication infomation is put on hold and invalied in 1.2.1
				  /*
				  var deleteIcon = document.createElement('img');
				  deleteIcon.id = credentialList[i].id + "_deleteCredentialInfoIcon";
				  deleteIcon.style.cssFloat = 'right';
				  deleteIcon.style.styleFloat = 'right';
				  deleteIcon.style.cursor = 'pointer';
				  deleteIcon.style.top = '2px';
				  deleteIcon.src = imageURL + 'trush.png';
				  IS_Event.observe(deleteIcon, "click", function(e){
					  var deleteIcon = IS_Event.element(e);
					  var id = deleteIcon.id.split("_")[0];
					  var opt = {
						method: 'post',
						asynchronous: true,
						postBody: "command=del&id=" + id,
						onSuccess:function(req, obj){
							credentialListDiv.removeChild($(id + '_authCredentialInfoTable'));
							IS_EventDispatcher.newEvent("resetAuthCredential", "resetAuthCredential");
						},
						onException:function(req, obj){
							console.log(["Error:",obj]);
						}
					  }
					  AjaxRequest.invoke(hostPrefix + "/credsrv", opt);
					  
				  }, false, "_authCredentialList");
				  td.appendChild(deleteIcon);
				  */
				  continue;
			  }
			  
			  var table = document.createElement('table');
			  table.id = credentialList[i].id + "_authCredentialInfoTable";
			  table.className = 'authCredentialInfoTable';
			  var tbody = document.createElement('tbody');
			  
			  var tr = document.createElement('tr');
			  var td = document.createElement('th');
			  td.colSpan = 2;
			  var headerLeft = document.createElement('span');
			  headerLeft.style.cssFloat = 'left';
			  headerLeft.style.styleFloat = 'left';
			  headerLeft.className = 'authCredentialInfoTitle';
			  //Authentication information
			  headerLeft.appendChild(document.createTextNode(IS_R.lb_authInfo + (i + 1) ));
			  td.appendChild(headerLeft);

			  tr.appendChild(td);
			  
			  tbody.appendChild(tr);
			  
			  var tr = document.createElement('tr');
			  tr.style.clear = 'both';
			  var td = document.createElement('td');
			  td.className = 'authCredentialListLightTd';
			  //Authentication type
			  td.appendChild(document.createTextNode(IS_R.lb_authType));
			  tr.appendChild(td);
			  var td = document.createElement('td');
			  td.appendChild(document.createTextNode(
				  credentialList[i].authType
				  ));
			  tr.appendChild(td);
			  tbody.appendChild(tr);
			  
			  var tr = document.createElement('tr');
			  var td = document.createElement('td');
			  td.width = '30%';
			  td.className = 'authCredentialListLightTd';
			  //User ID
			  td.appendChild(document.createTextNode(IS_R.lb_userID));
			  tr.appendChild(td);
			  var td = document.createElement('td');
			  td.appendChild(document.createTextNode(
				  credentialList[i].authUid
				  ));
			  tr.appendChild(td);
			  tbody.appendChild(tr);
			  
			  var tr = document.createElement('tr');
			  var td = document.createElement('td');
			  td.className = 'authCredentialListLightTd';
			  //Password
			  td.appendChild(document.createTextNode(IS_R.lb_password));
			  tr.appendChild(td);
			  var td = document.createElement('td');
			  td.appendChild(document.createTextNode("*******"));

			  //the function of password reset is put on hold and invalied in 1.2.1
			  if(credentialList[i].sysNum == 0&&false){
			  var resetBtn = document.createElement('input');
			  resetBtn.id = credentialList[i].id + "_resetBtn";
			  resetBtn.type = 'button';
			  //Reset
			  resetBtn.value = IS_R.lb_reset;
			  td.appendChild(resetBtn);
				  
			  IS_Event.observe(resetBtn, "click", function(){
			  	  var modal;
				  var createCreadentialFormDiv = function(_restBtn){
					  var creadentialFormDiv = document.createElement('div');
					  
					  var credentialFormTable = document.createElement('table');
					  credentialFormTbody = document.createElement('tbody');
					  
					  passwordTr = document.createElement('tr');
					  passwordLabelTd = document.createElement('td');
					  //Password
					  passwordLabelTd.appendChild(document.createTextNode(IS_R.lb_password));
					  passwordTr.appendChild(passwordLabelTd);
					  
					  passwordInputTd = document.createElement('td');
					  var passwordInput = document.createElement("input");
					  passwordInput.id = "previewPasswordForm";
					  passwordInput.type = "password";
					  passwordInput.maxLength = 50;
					  passwordInputTd.appendChild(passwordInput);
					  passwordTr.appendChild(passwordInputTd);
					  
					  credentialFormTbody.appendChild(passwordTr);
					  credentialFormTable.appendChild(credentialFormTbody);
					  
					  creadentialFormDiv.appendChild(credentialFormTable);

					  var creadentialFormBtn = document.createElement("input");
					  creadentialFormBtn.type = "button";
					  //Reset
					  creadentialFormBtn.value = IS_R.lb_reset;
					  creadentialFormDiv.appendChild(creadentialFormBtn);
					  
					  IS_Event.observe( creadentialFormBtn, 'click', function(){
						  modal.close();
						  authPassword = passwordInput.value;
						  if(authPassword)
							authPassword = rsaPK.encrypt(authPassword);
						  
						  var id = _restBtn.id.split('_')[0];

						  var authUrlList = getAuthUrlList(id);
						  var postBody = "command=" + ( (authUrlList.length == 0) ? "frst" : "rst" ) + "&id=" + id + "&authPasswd=" + authPassword;
						  for(var i = 0; i < authUrlList.length; i++){
							  postBody += "&url=" + authUrlList[i];
						  }
						  var opt = {
							method: 'post',
							asynchronous: true,
							postBody: postBody,
							onSuccess:function(req, obj){
								var errorUrls = eval(req.responseText);
								if(!errorUrls ||errorUrls.length == 0){
									IS_EventDispatcher.newEvent("resetAuthCredential", "resetAuthCredential");
								}else{
									//Do you want to set the password even though authentication failed for the URL below?
									var errorMsg = IS_R.ms_passwordResetConfirm;
									for(var i = 0; i < errorUrls.length; i++){
										errorMsg += "\n" + errorUrls[i];
									}
									if(confirm(errorMsg)){
										var opt = {
											method: 'post',
											asynchronous: true,
											postBody : "command=frst&id=" + id + "&authPasswd=" + authPassword,
											onSuccess:function(req, obj){
												IS_EventDispatcher.newEvent("resetAuthCredential", "resetAuthCredential");
											},
										    onFailure:function(req, obj){
												//Failed to update password
												alert(IS_R.ms_updatePasswordError + obj);
												msg.error(["Error:",obj]);
											}
										}
										AjaxRequest.invoke(hostPrefix + "/credsrv", opt);
									}
								}
							},
			   				 onFailure:function(req, obj){
								//Failed to update password
								alert(IS_R.ms_updatePasswordError + obj);
								msg.error(["Error:",obj]);
							}
						  }
						  AjaxRequest.invoke(hostPrefix + "/credsrv", opt);
						  //is_processUrlContents(url, displayPreview.bind(this, url), function(){}, ["authType", authType, "authuserid",authUid,"authpassword",authPassword]);
					  }, false, "_authCredentialList");
					  return creadentialFormDiv;
				  };
				  modal = new Control.Modal(this,
												{
												  contents: createCreadentialFormDiv(this),
												  opacity: 0.5,
												  position: 'relative',
												  zIndex: 1000,
												  width:  270,
												  height: 60
											  }
												);
				  modal.open();
				  $('previewPasswordForm').focus();
			  }.bind(resetBtn), false, "_authCredentialList");
				  
			  }
			  tr.appendChild(td);
			  tbody.appendChild(tr);
			  
			  var tr = document.createElement('tr');
			  var td = document.createElement('td');
			  td.className = 'authCredentialListLightTd';
			  td.appendChild(document.createTextNode(IS_R.lb_urlList));
			  tr.appendChild(td);
			  tbody.appendChild(tr);
			  
			  td.rowSpan = (authUrlList.length == 0) ? 1 : authUrlList.length;
			  for(var j = 0; j < authUrlList.length;j++){
				  var td = document.createElement('td');
				  td.appendChild(document.createTextNode(authUrlList[j]));
				  tr.appendChild(td);
				  tbody.appendChild(tr);
				  var tr = document.createElement('tr');
			  }
			  table.appendChild(tbody);
			  credentialListDiv.appendChild(table);

		  }
		  window.setContent(credentialListDiv);
	  },
	  onException: function(r, t){
		  console.log(t);
	  }
	};
	
	IS_Event.observe($('authCredentialListIcon'), 'click', function(e){
		
		
		AjaxRequest.invoke(hostPrefix + "/credsrv?command=list", opt);
		
		if(e) {//Event is passed and comes only when pressing recycle bin icon
			window.showCenter();
		} else {
			window.centered = false;
			window.show();
		}
	}, true, "_authCredentialList");
	
}

IS_Request.removeCredential = function(authCredentialId){
	var opt = {
	  method: 'post',
	  asynchronous: true,
	  postBody: "command=del&id=" + authCredentialId,
	  onSuccess:function(req, obj){
		  msg.info("delete authCredential " + authCredentialId + " from " + self.id);
	  },
	  onException:function(req, obj){
		  msg.error(["Error:",obj]);
	  },
	  onComplete:function(){}
	}
	AjaxRequest.invoke(hostPrefix + "/credsrv", opt, self.id);
}