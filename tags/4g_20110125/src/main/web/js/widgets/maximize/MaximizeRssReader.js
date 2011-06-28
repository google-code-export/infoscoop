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

IS_Widget.MaximizeRssReader = IS_Class.create();
IS_Widget.MaximizeRssReader.prototype.classDef = function() {
	var widget;
	var self = this;
	var __rssReaders = [];
	var id;
	
	this.initialize = function(widgetObj){
		widget = widgetObj;
		id = widget.id;
		
		//for trouble of layout break in 'tableLayout = "fixed";'
		//position:Layout breaks in IE though it is better that absolute is removed
		widget.panelType = "";
		
		this.drag = new IS_Widget.MaximizeRssReader.Drag( widget );
		
		this.rssItemSelection = new IS_Widget.MaximizeRssReader.RssItemSelection( widget );
		
		widget.elm_widgetBox.style.backgroundColor = "#fff";
		
		this.buildMaximizeRssContent();
		
		$( widget.elm_widgetContent ).addClassName("RssReader");
	}
	
	this._getOriginalRssReaders = function(){
		if( widget.originalWidget && widget.originalWidget.content.mergeRssReader ) {
			//widget.originalWidget.content.mergeRssReader.isComplete = widget.originalWidget.content.mergeRssReader.getIsComplete();
			return [widget.originalWidget.content.mergeRssReader].concat(IS_Widget.getDisplayOrderList( widget.originalWidget,widget.originalWidget.tabId ));
		} else {
			var w = widget.originalWidget;
			if( !w.content.rssContent ) {
				w = Object.extend({},w);
				w.content.rssContent = {
					rssItems: w.content.getRssItems()
				};
				w.panelType = "Maximize";
			}
			
			return [w];
		}
	}
	
	this.closeErrorMessage = function( div ) {
		widget.originalWidget.content.closeDiv( div );
		
		this.lazyAdjustMaximizeHeight();
	}
	
	this.buildMaximizeRssContent = function(){
		widget.elm_widgetContent.innerHTML = "";//Delete 'Loading..'
		
		/*widget.elm_widgetContent.style.backgroundColor = '#ece9e3';*/
		if( widget.elm_widgetContent && widget.elm_widgetContent.parentNode )
			widget.elm_widgetContent.style.backgroundColor = //"inherit";
				widget.elm_widgetContent.parentNode.style.backgroundColor;
		
		widget.elm_widgetContent.appendChild( this.buildFilterStatePane() );
		
		var lrTable = IS_Widget.RssReader.RssItemRender.createTable( 1,3 );
		//lrTable.className = 'maximizeContents';
		lrTable.id = "maximizeContents_"+widget.id;
		lrTable.style.clear = "both";
		
		lrTable.style.tableLayout = "fixed";
		
		widget.elm_widgetContent.appendChild( lrTable );
		
		var categoryListTd = lrTable.firstChild.firstChild.childNodes[0];
		categoryListTd.id = "rssListCell_"+widget.id;
		categoryListTd.style.width = "30%";
		categoryListTd.style.verticalAlign = "top";
		
		var filterPane = self.buildFilterPane();
		filterPane.style.display = 'none';
		categoryListTd.appendChild( filterPane );
		
		var errorPanel = document.createElement("div");
		errorPanel.style.display = "none";
		categoryListTd.appendChild( errorPanel );
		this.errorPanel = errorPanel;
		
		var itemListDiv = document.createElement("div");
		itemListDiv.id = "MaximizeItemList_"+widget.id;
		itemListDiv.className = 'maximizeRssItemList';
		categoryListTd.appendChild( itemListDiv );
		
		// For drag bar
		var dragBarTd = lrTable.firstChild.firstChild.childNodes[1];
		dragBarTd.id = 'maximizeDragBar_'+widget.id;
		dragBarTd.style.width = 5;
		
		dragBarTd.title = IS_R.ms_customizeWidthByDrag;
		dragBarTd.style.cursor = "col-resize";
		
		Event.observe(dragBarTd, 'mousedown', this.drag.dragStart, false,widget.id);
		
		var tbTable = IS_Widget.RssReader.RssItemRender.createTable( 2,1 );
		//tbTable.style.tableLayout = "fixed"
		tbTable.style.backgroundColor = "white"
		lrTable.firstChild.firstChild.childNodes[2].appendChild( tbTable );
		
		// Right side: rss description
		var descriptionPane = tbTable.firstChild.childNodes[0].firstChild;
		descriptionPane.id = 'maximizeRssDetailTd_' +widget.id;
		this.buildDescriptionPane( descriptionPane );
		
		// Tool bar
		buildTools( tbTable.firstChild.childNodes[1].firstChild );
		tbTable.firstChild.childNodes[1].firstChild.className = 'maximizeRssTools';
	};
	
	this.buildFilterStatePane = function() {
		
		var filterStatePane = document.createElement("div");
		filterStatePane.className = 'maximizeFilterStatePanel';
		
		var categoryComboBox = document.createElement("div");
		categoryComboBox.id = 'maximizeCategoryCombobox';
		categoryComboBox.className = 'maximizeCategoryCombobox';
		filterStatePane.appendChild( categoryComboBox );
		var filterFormOpenButton = document.createElement("div");
		filterFormOpenButton.className = "maximizeFilter";

		filterFormOpenButton.appendChild( document.createTextNode(IS_R.lb_filterDescSettingLink ));
		filterStatePane.appendChild( filterFormOpenButton );
		
		IS_Event.observe( filterFormOpenButton,"click",openFilterForm,false,widget.id );
		var filterFormCloseButton = document.createElement("div");
		filterFormCloseButton.className = 'maximizeFilterCloseButton';
		filterFormCloseButton.style.display  = 'none';
		

		filterFormCloseButton.appendChild( document.createTextNode(
			IS_R.lb_closeLink ));
		filterStatePane.appendChild( filterFormCloseButton );
		
		IS_Event.observe( filterFormCloseButton,"click",closeFilterForm,false,widget.id );
		
		function openFilterForm() {
			filterFormOpenButton.style.display = "none";
			filterFormCloseButton.style.display = "";
			$("filterContent_"+widget.id ).style.display = "";
			self.lazyAdjustMaximizeHeight();
		}
		this.openFilterForm = openFilterForm;
		
		function closeFilterForm() {
			filterFormOpenButton.style.display = "";
			filterFormCloseButton.style.display = "none";
			$("filterContent_"+widget.id ).style.display = "none";
			
			self.lazyAdjustMaximizeHeight();
		}
		this.closeFilterForm = closeFilterForm;
		
		var stateDiv = document.createElement("div");
		stateDiv.className = 'maximizeRssReaderFilterState';
		stateDiv.id = "filterState_"+widget.id;
		filterStatePane.appendChild( stateDiv );

		return filterStatePane;
	}
	
	this.loadNotCompleteRssReaders = function() {
		var self = this;
		var rssReaders = this._getOriginalRssReaders();
		var notCompleteRssReaders = rssReaders.findAll( function( rssReader ){
			return !rssReader.isComplete;
		});

		if( notCompleteRssReaders.length > 0 ) {
			notCompleteRssReaders.each( function( rssReader ) {
				IS_EventDispatcher.addListener('loadComplete',
											   rssReader.id,
											   function(r) {
												   console.log("MaximizeRssReader:handleMergeRssReaderLoadComplete", widget.originalWidget.content.mergeRssReader.isComplete);
												   setTimeout(function(){self.categoryPulldown.rebuildPulldownList()},100);
												   if(r.title == IS_R.lb_mergeView)
													 r.postLoaded ();
											   }.bind( self, rssReader ), true );

				if(self.currentCategory.id != rssReader.id){
					setTimeout( function(){
						if(rssReader.title == IS_R.lb_mergeView)
						  widget.originalWidget.content.mergeRssReaderLoadContents();
						else
						  rssReader.loadContents();
					},10 );
				}
			});
		}
	}
	
	this.buildFilterPane = function() {
		var filterContent = document.createElement("div");
		filterContent.id = "filterContent_"+widget.id;

		var filterForm = IS_Widget.RssReader.RssItemRender.createTable(5,2);
		filterForm.style.backgroundColor = "#eeeeee";
		filterForm.style.margin = "1px";
		filterForm.style.height = "auto";
		filterContent.appendChild( filterForm );

		var titleRow = filterForm.firstChild.childNodes[0];


		titleRow.childNodes[0].style.fontSize = "9pt";
		titleRow.childNodes[0].style.whiteSpace = "nowrap";
		titleRow.childNodes[0].appendChild( document.createTextNode(

			IS_R.lb_title ));
		var titleDiv = document.createElement("div");
		titleDiv.position = "relative";
		titleRow.childNodes[1].appendChild( titleDiv );
		
		var titleInput = document.createElement("input");
		titleInput.id = "filterFormTitle_"+widget.id;
		titleInput.style.width = "100%";
		//titleInput.style.border = "1px solid #666";
		titleDiv.appendChild( titleInput );
		
		var creatorRow = filterForm.firstChild.childNodes[1];
		creatorRow.childNodes[0].style.fontSize = "9pt";
		creatorRow.childNodes[0].style.whiteSpace = "nowrap";
		creatorRow.childNodes[0].appendChild( document.createTextNode(

			IS_R.lb_creator ));
		
		var creatorDiv = document.createElement("div");
		creatorDiv.position = "relative";
		creatorRow.childNodes[1].appendChild( creatorDiv );
		
		var creatorInput = document.createElement("input");
		creatorInput.id = "filterFormCreator_"+widget.id;
		creatorInput.style.width = "100%";
		//creatorInput.style.border = "1px solid #666";
		creatorDiv.appendChild( creatorInput );
		
		var creatorPopup = document.createElement("div");
		creatorPopup.style.position = "absolute";
		//creatorPopup.style.top = creatorRow.offsetHeight;
		creatorPopup.style.left = 0;
		creatorPopup.style.width = "100%";
		creatorPopup.style.border = "1px solid black";
		creatorPopup.style.backgroundColor = "white"
		creatorPopup.className = "MaximizeRssReader_CreatorFilter_Autocomplete"
		creatorPopup.style.zIndex = 10000;
		creatorDiv.appendChild( creatorPopup );
		
		this.creatorAC = new Autocompleter.Local( creatorInput,creatorPopup,[],{
			fullSearch: true,
			partialChars: 1
		});
		
		var dateRow = filterForm.firstChild.childNodes[2];
		dateRow.childNodes[0].style.fontSize = "9pt";
		dateRow.childNodes[0].style.whiteSpace = "nowrap";
		dateRow.childNodes[0].appendChild( document.createTextNode(

			IS_R.lb_date ));
	
		var dateOptions = [

			IS_R.lb_displayAll,
			IS_R.lb_today,
			IS_R.lb_yesterday,
			IS_R.lb_3DaysAgo,
			IS_R.lb_1weekAgo,
			IS_R.lb_1monthAgo
		];
		var dateDiv = document.createElement("div");
		dateRow.childNodes[1].appendChild( dateDiv );
		
		var dateMap = {};
		dateOptions.each( function( dateOption,i ) {
			dateMap[i] = dateOption;
		});
		var datePulldown = new PullDown( {
			eventId : widget.id +"_date_pulldown",
			selected : 0,
			width : "auto",
			//onChange : this.handleDateFilterChange.bind( this ),
			map : dateMap
		});
		datePulldown.build( dateDiv );
		this.datePulldown = datePulldown;
		
		var categoryRow = filterForm.firstChild.childNodes[3];
		categoryRow.childNodes[0].style.fontSize = "9pt";
		categoryRow.childNodes[0].style.whiteSpace = "nowrap";
		categoryRow.childNodes[0].appendChild( document.createTextNode(

			IS_R.lb_category ));
		var categoryDiv = document.createElement("div");
		categoryDiv.position = "relative";
		categoryRow.childNodes[1].appendChild( categoryDiv );
		
		var categoryInput = document.createElement("input");
		categoryInput.id = "filterFormCategory_"+widget.id;
		categoryInput.style.width = "100%";
		//categoryInput.style.border = "1px solid #666";
		categoryDiv.appendChild( categoryInput );
		
		var buttonRow = filterForm.firstChild.childNodes[4];
		var okButton = document.createElement("input");
		okButton.type = "button";
		okButton.value = 'OK';
		buttonRow.childNodes[1].appendChild(okButton);
		var saveMessageSpan = document.createElement('span');
		saveMessageSpan.style.fontSize = '80%';
		saveMessageSpan.appendChild(document.createTextNode(IS_R.lb_saveFilterSetting));
		buttonRow.childNodes[1].appendChild(saveMessageSpan);
		IS_Event.observe(okButton, "click",
			this.handleFilterChange.bind( this ),false,widget.id );
		return filterContent;
	}
	
	this.buildCategoryComboBox = function(categoryComboBox, selectedIndex) {
		var map = {};
		var this_ = this;
		this._getOriginalRssReaders().each( function( rssReader,i ) {
			map[i] = this_.renderCategoryListItem.bind( this_ );
		});
		var categoryPulldown = new PullDown( {
			eventId : widget.id +"_category_pulldown",
			selected : ((selectedIndex !== undefined) ? selectedIndex : undefined),
			onChange : function(){
				var categoryValue = this_.categoryPulldown.selectedKey;
				if(categoryValue){
					var rssReaders = this_._getOriginalRssReaders();
					this_.currentCategory = rssReaders[categoryValue];
					this_.initFilter(this_.currentCategory);
				}
				if(this_.currentCategory.isComplete)
				  this_.displayRssList(this_.currentCategory);
				else
				  this_.loadCategoryContents(this_.currentCategory);
			},
			map: map
		} );
		categoryPulldown.build( categoryComboBox );
		this.categoryPulldown = categoryPulldown;
		
		//this.setSelectedCategory(0);
	}
	
	this.renderCategoryListItem = function( pulldown,no,div ) {
		var rssReaders = this._getOriginalRssReaders();
		var item = rssReaders[no];
		if( !item )
			return;
		
		var isSelected = ( pulldown.selectedKey == no );
		
		div.style.width = "100%"
		div.style.clear = "both";
		div.style.paddingLeft = div.style.paddingRight = 2;
		div.style.position = "relative";
		
		var titleTable = $( IS_Widget.RssReader.RssItemRender.createTable( 1,2 ));
		titleTable.setStyle({
			width: "auto",
			height: "auto"
		});
		
		var latestItemCount = item.content.getLatestItemCount();
		if( latestItemCount > 0 ) {
			var latestCount = $( document.createElement("div") );
			Element.addClassName( latestCount,"latestMarkHtml" );
			latestCount.innerHTML = '[' +latestItemCount +']';
			div.appendChild( latestCount );
			
			titleTable.style.marginRight = ( String( latestItemCount ).length ) +"em";
			
			var isHotNews = ( item.content.rssContent.rssItems.findAll( function( rssItem ) {
					return IS_Widget.RssReader.isHotNews( item.latestDatetime,rssItem )
				}).shift()? true : false );
			var latestMarkIcon = document.createElement("img");
			latestMarkIcon.className = "latestMark";
			latestMarkIcon.src = imageURL +( isHotNews ? "sun_blink.gif":"sun.gif");
			titleTable.firstChild.firstChild.childNodes[1].appendChild( latestMarkIcon );
			titleTable.firstChild.firstChild.childNodes[1].style.verticalAlign = "top"
		}
		div.appendChild( titleTable );
		
		var titleCell = $( titleTable.firstChild.firstChild.childNodes[0] );
		titleCell.className = ".pulldown_list_item";
		titleCell.setStyle({
			fontSize: "0.8em",
			whiteSpace: "normal",
			wordBreak: "break-all"
		});
		
		//console.log(no,item.isComplete, item.isError, item.isAuthenticationFailed(),item);
		if( !item.isComplete && !item.isError && !item.isAuthenticationFailed() ) {
			var indicator = document.createElement("div");
			indicator.style.backgroundImage = "url("+imageURL+"indicator.gif)";
			indicator.style.backgroundRepeat = "no-repeat";
			indicator.style.width = indicator.style.height = "16px";
			indicator.style.cssFloat = indicator.style.styleFloat = "left";
			indicator.innerHTML = "&nbsp;";
			
			titleCell.appendChild( indicator );
		} else if( !item.isSuccess || item.isAuthenticationFailed()) {
			titleCell.style.color = "gray";
		}
		
		titleCell.appendChild( document.createTextNode( item.title ));
	}
	
	this.handleFilterChange = function(){
		
		var dateValue = this.datePulldown.selectedKey;
		if( parseInt( dateValue ) != 0 && !isNaN( dateValue )) {
			this.filterContext.date = parseInt( dateValue );
		} else {
			this.filterContext.date = undefined;
		}
		
		$H({
			titleFilter: $("filterFormTitle_"+widget.id ),
			creatorFilter: $("filterFormCreator_"+widget.id ),
			categoryFilter: $("filterFormCategory_"+widget.id )
		}).each( function( entry ) {
			var filterInput = entry.value;
			if( !filterInput )
				return;
			
			var filter = $F( filterInput );
			this.currentCategory.setUserPref( entry.key,filter );
			this.currentCategory.content[ entry.key ] = filter;
		},this );
		
		if(this.categoryPulldown){
			var categoryValue = this.categoryPulldown.selectedKey;
			if(categoryValue){
				var rssReaders = this._getOriginalRssReaders();
				this.currentCategory = rssReaders[categoryValue];
			}
		}
		this.currentCategory.clearCache = true;
		
		var filter = false;
		if( this.filterContext.date )
			filter = this.filterFunc.bind( this );
		
		this.currentCategory.content.rssContent.setFilter( filter );
		this.loadCategoryContents(this.currentCategory);
		
		this.updateFilterState();

		this.displayItem(0);
	}
	
	this.filterContext = {};
	
	this.initFilter = function(rssReader) {
		
		this.filterContext.date = undefined;
		
		var creatorInput = $("filterFormCreator_"+widget.id );
		if( creatorInput ) {
			var creatorFilter = rssReader.getUserPref("creatorFilter");
			creatorInput.value = creatorFilter ? creatorFilter : "";
		}
		
		var titleInput = $("filterFormTitle_"+widget.id );
		if( titleInput ) {
			var titleFilter = rssReader.getUserPref("titleFilter");
			titleInput.value = titleFilter ? titleFilter : "";
		}
		
		var categoryInput = $("filterFormCategory_"+widget.id );
		if( categoryInput ) {
			var categoryFilter = rssReader.getUserPref("categoryFilter");
			categoryInput.value = categoryFilter ? categoryFilter : "";
		}
		
		if( this.datePulldown )
			this.datePulldown.setSelectedKey( 0 );
	}
	this.updateCreators = function() {
		var creators = []
		if( this.currentCategory ) {
			this.currentCategory.content.getRssItems().collect( function( rssItem ){
				return ( rssItem ? rssItem.creator : "");
			}).each( function( c ){
				c = c.replace(/^[\s　]*/,"").replace(/[\s　]*$/,"");
				if( !creators.contains( c ))
					creators.push( c );
			});
		}
		
		this.creatorAC.options.array = creators;
	}

	this.dateFilterFunc = function( rssItem ) {
		var since = this.filterContext.date;
		if( !since )
			return true;
		
		if( !rssItem.rssDate )
			return false;
		
		var days;
		switch( since ) {
			case 1:
			case 2:
				days = since -1; break;
			case 3:
				days = 3; break;
			case 4:
				days = 7; break;
			case 5:
				days = 31; break;
			default:
				return true;
		}
		var date = new Date();
		date.setDate( date.getDate() -days );
		date.setHours( 0 );
		date.setMinutes( 0 );
		date.setSeconds( 0 );
		date.setMilliseconds( 0 );
		
		var d2 = new Date();
		d2.setTime( rssItem.rssDate.getTime());
		d2.setHours( 0 );
		d2.setMinutes( 0 );
		d2.setSeconds( 0 );
		d2.setMilliseconds( 0 );
		
		if( !rssItem.rssDate || !( date.getTime() <= rssItem.rssDate.getTime()))
			return false;
		
		return true;
	}
	
	this.updateFilterState = function() {
		var filterState = $("filterState_"+widget.id );
		if( filterState ) {
			while( filterState.firstChild )
				filterState.removeChild( filterState.firstChild );
			
			var states = [];
			
			var titleFilter = this.currentCategory.getUserPref('titleFilter');
			if( titleFilter )
			  states.push(IS_R.lb_title + ':"' + titleFilter + '" ');
			
			var creatorFilter = this.currentCategory.getUserPref('creatorFilter');
			if( creatorFilter )
			  states.push(IS_R.lb_creator+':"'+creatorFilter+'" ');
						
			if( this.filterContext.date && 0 < this.filterContext.date && this.filterContext.date < 6 ) {
				switch( this.filterContext.date ) {
					case 1: days = 

						IS_R.lb_today; break;
					case 2: days = 

						IS_R.lb_yesterday; break;
					case 3: days = 

						IS_R.lb_3DaysAgo; break;
					case 4: days = 

						IS_R.lb_1weekAgo; break;
					case 5: days = 

						IS_R.lb_1monthAgo; break;
				}
				
				states.push(

					IS_R.getResource( IS_R.lb_dateFilterInfo,
						[ days ])
				);
			}
			
			var categoryFilter = this.currentCategory.getUserPref('categoryFilter');
			if( categoryFilter )
			  states.push(IS_R.lb_category+':"'+categoryFilter+'" ');
			
			filterState.appendChild( document.createTextNode( states.join(" / ") ));
		}
	}
	this.filterFunc = function( rssItem,i ) {
		if( ! this.dateFilterFunc( rssItem ))
		  return false;
		else
		  return true;
	}

	this.buildDescriptionPane = function( rssDetailTd ) {
		// Message division for no link
		var messageDiv = document.createElement("div");
		messageDiv.id = "maximizeMessageDiv_"+widget.id;
		rssDetailTd.appendChild( messageDiv );
		messageDiv.style.verticalAlign = "middle";
		messageDiv.align = "center";
		messageDiv.style.fontWeight = "bold";
		messageDiv.style.fontSize = "18px";

		messageDiv.innerHTML = IS_R.ms_noURL;
		messageDiv.style.display = "none";
		
		//detailTd.id =  'maximizeRssDetail';
		//detailTd.className = 'maximizeRssDetail';
		var detailDiv = document.createElement("div");
		rssDetailTd.appendChild( detailDiv );
		detailDiv.id =  'maximizeRssDetail_'+widget.id;
		detailDiv.style.overflow = "hidden";
		detailDiv.className = 'maximizeRssDetail';
		
		var detailTable = document.createElement("table");
		detailTable.style.width = '100%';
		detailTable.style.height = '100%';
		detailTable.style.padding = 0;
		detailTable.style.margin = 0;
		detailTable.style.borderCollapse = "collapse";
		//detailTable.style.tableLayout = "fixed";
		detailDiv.appendChild( detailTable );
		var detailTbody = document.createElement("tbody");
		detailTable.appendChild( detailTbody );
		
		// RSS description
		var detailTr = document.createElement("tr");
		detailTbody.appendChild( detailTr );
		var detailTd = document.createElement("td");
		detailTr.appendChild( detailTd );
		
		// Show description
		var itemTable = document.createElement("table");
		itemTable.style.width = '100%';
		itemTable.style.height = '95%';
		itemTable.style.padding = 0;
		itemTable.style.margin = 0;
		itemTable.style.borderCollapse = "collapse"
		var tbodyEl = document.createElement("tbody");
		itemTable.appendChild( tbodyEl );

		var itemTr = document.createElement("tr");
		tbodyEl.appendChild(itemTr);
		var itemTd = document.createElement("td");
		itemTr.appendChild(itemTd);

		// Show title
		var rsslink = document.createElement("div");
		rsslink.id = "maximizeRssTitle_"+widget.id;
		rsslink.className = "maximizeRssTitle";
		
		//Add title to table
		var titleTable = document.createElement("table");
		var titleTBody= document.createElement("tbody");

		titleTable.appendChild(titleTBody);
		var titleTd = document.createElement("td");
		titleTable.cellPadding = "1";
		titleTable.cellSpacing = "0";
		titleTable.style.padding = 0;
		titleTable.style.margin = 0;
		titleTable.style.borderCollapse = "collapse";

		rsslink.style.lineHeight = "1.2em";
		rsslink.style.overflow = "visible";
		titleTd.appendChild(rsslink);
		
		var titleTr = document.createElement("tr");
		titleTr.appendChild(titleTd);
		titleTBody.appendChild(titleTr);

		itemTd.appendChild(titleTable);

		// Show date
		var rssPubDate = document.createElement("div");
		rssPubDate.className = "maximizeRssPubDate";
		rssPubDate.id = "maximizeRssPubDate_"+widget.id;
		rssPubDate.style.lineHeight = "1.2em";
		rssPubDate.style.height = "1.15em";
		rssPubDate.style.overflow = "hidden";
		
		var itemDateTr = document.createElement("tr");
		tbodyEl.appendChild(itemDateTr);
		var dateTd = document.createElement("td");
		dateTd.appendChild(rssPubDate);
		itemDateTr.appendChild(dateTd);

		// Show category
		var rssCategory = document.createElement("div");
		rssCategory.className = "maximizeRssCategory";
		rssCategory.id = "maximizeRssCategory_"+widget.id;
		var itemCategoryTr = document.createElement("tr");
		tbodyEl.appendChild(itemCategoryTr);
		var categoryTd = document.createElement("td");
		categoryTd.appendChild(rssCategory);
		itemCategoryTr.appendChild(categoryTd);

		// Area of showing description
		var itemDescTr = document.createElement("tr");
		itemDescTr.style.height = '100%';
		tbodyEl.appendChild(itemDescTr);
		var itemDescTd = document.createElement("td");
		itemDescTd.cellPadding = "0";
		itemDescTd.cellSpacing = "0";
		itemDescTr.appendChild(itemDescTd);

		var rssDesc = document.createElement("div");
		itemDescTd.appendChild(rssDesc);
		rssDesc.className = "maximizeRssDesc";
		rssDesc.id = "maximizeRssDesc_"+widget.id;

		var rssDescText = document.createElement("div");
		rssDescText.id = "maximizeRssDescText_"+widget.id;
		rssDescText.className = "maximizeRssDescText";
		rssDesc.appendChild(rssDescText);
		
		detailTd.appendChild( itemTable );
	}
	
	function buildTools( toolBarDiv ){
		//this.elm_toolBar = toolBarDiv;
		self.toolBarContent = new IS_Portal.ContentFooter( {
			id: widget.closeId,
			isDisplay: function() {
				return !!self.displayRssItem;
			},
			getTitle: function() {
				if( self.displayRssItem )
					return self.displayRssItem.title;
				
				return "";
			},
			getUrl: function() {
				if( self.displayRssItem )
					return self.displayRssItem.link;
				
				return "";
			}
		} );
		self.toolBarContent.displayContents();
		
		toolBarDiv.appendChild( self.toolBarContent.elm_toolBar );
	}
	
    this.switchShowDatetime = function(){
//		widget.toggleBoolUserPref("showDatetime");
		var showDatetime = widget.getBoolUserPref("showDatetime");
		showDatetime = (showDatetime)? false:true;
		widget.setUserPref("showDatetime", showDatetime);
		
		this._getOriginalRssReaders().each( function( rssReader ) {
			rssReader.setUserPref("showDatetime", showDatetime);
		});

		this.displayRssList(this.currentCategory);
	}

	this.displayRssList = function(rssReader){
		this.adjustMaximizeHeight();//to get the height of "elm_widgetMaximizeContent"
		rssReader.elm_widgetMaximizeContent = $("MaximizeItemList_"+widget.id );

		IS_Event.unloadCache("maximize_event" + widget.id);
		rssReader.elm_widgetMaximizeContent.innerHTML ="";
		
		if(!rssReader.maximize) rssReader.maximize = widget;
		
		var maximizeRender = new IS_Widget.MaximizeRssCategory(rssReader);
		maximizeRender.viewportHeight = rssReader.elm_widgetMaximizeContent.offsetHeight;
		maximizeRender.displayContents();
		rssReader.maximizeRender = maximizeRender;
		//IS_EventDispatcher.newEvent("loadComplete",rssReader.id );
		IS_EventDispatcher.newEvent("loadComplete",widget.id );
		
		this.displayItem(0);
		
		this.updateCreators();
	}

	this.loadCategoryContents = function(rssReader, isAutoReload ){
		var self = this;
		var _widget = widget;
		widget.preLoad();
		IS_EventDispatcher.addListener('loadComplete', rssReader.id, function(){
			self.displayRssList(rssReader);
			_widget.postLoaded();
			
			rssReader.clearCache = false;
			rssReader.isComplete = true;
		  }, self, true);
		if(rssReader.title == IS_R.lb_mergeView)
		  widget.originalWidget.content.mergeRssReaderLoadContents(isAutoReload);
		else
		  rssReader.loadContents();
	}

	this.setCurrentCategory = function(){

		this.rssItemSelection.initialize();

		var categoryNo = 0;
		var rssReaders = this._getOriginalRssReaders();
		
		if( rssReaders.length > 2 ) {
			if( widget.originalWidget == widget.baseWidget ) {
				categoryNo = 0;
			} else {
				categoryNo = rssReaders.indexOf( widget.baseWidget );//0 is merge RSS Reader
			}
		} else if( widget.originalWidget.content.mergeRssReader ){ // MultiRssReader but 1 rss
			categoryNo = 1;
		} else { // RssReader
			categoryNo = 0;
		}

		this.currentCategory = rssReaders[categoryNo];

		this.initFilter(this.currentCategory);
		
		if(rssReaders.length > 2){
			$('maximizeCategoryCombobox').style.width = "";
			IS_Event.unloadCache(widget.id +"_category_pulldown");
			$('maximizeCategoryCombobox').innerHTML = "";
			
			self.loadNotCompleteRssReaders();
			
			this.buildCategoryComboBox($('maximizeCategoryCombobox'), categoryNo);
		}else{
			$('maximizeCategoryCombobox').style.width = 0;
		}
		
		this.updateFilterState();

		return this.currentCategory;
	}

	this.loadContents = function ( isAutoReload ) {
		//do nothing
	};
	
	this.autoReloadContents = function () {
		//this.currentCategory.isComplete = false;
		//widget.loadContents();
		
		this.loadCategoryContents(this.currentCategory);
		//this.loadContents( true );
	}
	
	this.loadContentsOption = {
		unloadCache: false,
		onSuccess : this.loadContents.bind( this )
	};
	
	this.autoReloadContentsOption = {
		unloadCache: false,
		onSuccess : this.autoReloadContents.bind(this)
	};
	
	this.handleCategoriesLoadComplete = function() {alert("handleCategoriesLoadComplete");
		IS_EventDispatcher.newEvent("loadComplete",widget.id );
	}
	
	//Set detailed time
	this.dateIconHandler = function (e) {
		try{
			this.switchShowDatetime();
		}catch(error){

			msg.error( IS_R.getResource( IS_R.ms_datecreatorChangeFailed,[widget.id,error] ));
		}
	};

	this.maximize = function() {
		
		var rssReader = this.setCurrentCategory();
		
		if(rssReader.isComplete)
		  this.displayRssList(rssReader);
		else
		  this.loadCategoryContents(rssReader);
	}

	this.turnbackMaximize =  function (e) {
		var originalWidget = widget.originalWidget;
		var originalContent = widget.originalWidget.content;
		
		var isMulti = ( originalWidget.widgetType == "MultiRssReader");
		var rssReaders = this._getOriginalRssReaders();
		rssReaders.each( function( rssReader,i ) {
			
			//if( rssReader.content && rssReader.content.rssContentView )
			//	rssReader.content.rssContentView.clearContents();
			
			if( rssReader.content.repaint )
				rssReader.content.repaint();
			
			var content = rssReader.content.rssContent;
			if( content && content.rssItems ) {
				content.rssItems.each( function( rssItem ) {
					if( rssItem ) {
						rssItem.selected = false;
					}
				});
			}
		});
		
		// iframe disconnected with root is not loaded, and the old contents is shown at next time
		if( Browser.isIE ) {
			var iframe = IS_Widget.MaximizeRssReader.RssItemRender.getDetailIframe();
			document.body.appendChild( iframe );
			iframe.style.display = "none";
			iframe.src = "./blank.html";
		}
		
		[
			$("maximizeRssTitle_"+widget.id ),
			$("maximizeRssPubDate_"+widget.id ),
			$("maximizeRssDescText_"+widget.id )].each( function( textContainer ) {
				if( textContainer )
					textContainer.innerHTML = "";
			});
	}
	
	this.refresh = function() { // Use indicator unlike MultiRssReader
		//this.currentCategory.isComplete = false;
		//widget.loadContents();
		
		 this.loadCategoryContents(this.currentCategory);
	}
	
	/**
	 * Switch view of iframe
	 */
	this.iframeview_onIconHandler = function () {
		this.toggleIframeviewOnOff( true );
	}
	
	this.iframeview_offIconHandler = function () {
		this.toggleIframeviewOnOff( false );
	}
	this.toggleIframeviewOnOff = function( value ) {
		//widget.initUserPref("iframeview", value );
		widget.originalWidget.setUserPref("iframeview", value);
		
		if( this.displayRssItem )
			this.displayItem( this.rssItemSelection.nowItemIdx );
		
		IS_EventDispatcher.newEvent("applyIconStyle", widget.id);
		
		//Send to Server
		//IS_Widget.setPropertyCommand(widget.originalWidget, 'iframeview', widget.originalWidget.getUserPref("iframeview"));
		
	}
	
	this.showShortcutsIconHandler= function(e){
		this.popupWindow = window.open("js/widgets/maximize/maximizeShortcuts.jsp", "maximizeShortcuts", "width=425, height=390, scrollbars=yes, status=no");
		this.popupWindow.focus();
	}
	
	this.iframeview_onApplyIconStyle = function(div){
		if(!widget.getBoolUserPref("iframeview")){
			div.style.display = "block";
		}else{
			div.style.display = "none";
		}
	}
	
	this.iframeview_offApplyIconStyle = function(div){
		if(widget.getBoolUserPref("iframeview")){
			div.style.display = "block";
		}else{
			div.style.display = "none";
		}
	}
	
	this.lazyAdjustMaximizeHeight = function() {
		if( this.lazyAdjusting )
			return;
		
		this.lazyAdjusting = true;
		setTimeout( this.adjustMaximizeHeight.bind( this ),100 );
	}
	this.adjustMaximizeHeight = function() {
		this.lazyAdjusting = false;
		
		var maximizeHeight = getWindowHeight() - findPosY( widget.elm_widgetContent ) - 2;
		if(parseInt(widget.elm_widgetContent.style.height) == (maximizeHeight + 2) )return;
		
		var rssDetailTd = $("maximizeRssDetailTd_" +widget.id);
		if( !rssDetailTd )
			return;
		
		var rssDetailTable = rssDetailTd.parentNode.parentNode.parentNode;
		var rssDetail = $("maximizeRssDetail_"+widget.id );
		var itemListDiv = $("MaximizeItemList_"+widget.id );
		
		var toolbarHeight = self.toolBarContent.elm_toolBar.offsetHeight;
		try{
			var detailTdDisplay = rssDetailTd.style.display;
			if( Browser.isFirefox )
				rssDetailTable.style.display = "none"
			
			var itemListHeight = maximizeHeight
			var errorPanelHeight = this.errorPanel.offsetHeight;
			if( !this.errorPanel.firstChild || isNaN( errorPanelHeight ))
				errorPanelHeight = 0;
			
			itemListHeight -= errorPanelHeight;
			
			var filterContent = $("filterContent_"+widget.id );
			if( filterContent && filterContent.style.display != "none")
				itemListHeight -= filterContent.offsetHeight +( Browser.isIE ? 0:0 );
			
			if( !isNaN( itemListHeight ) && itemListHeight >= 0 )
				itemListDiv.style.height = itemListHeight;
			
			if( this.currentCategory ) {
				var maximizeButtons = $("MaximizeButtons_"+this.currentCategory.id );
				if( maximizeButtons && maximizeButtons.offsetHeight > 0 )
					itemListHeight -= maximizeButtons.offsetHeight;
				if(this.currentCategory.maximizeRender && this.currentCategory.maximizeRender.rssContentView)
				  this.currentCategory.maximizeRender.rssContentView.setViewportHeight(itemListHeight);
			}
			
			var detailHeight = maximizeHeight - 48 - toolbarHeight;
			
			rssDetailTd.style.height = detailHeight;
			if( Browser.isFirefox )
				rssDetailTable.style.display = detailTdDisplay;
			
			var rssDesc = $("maximizeRssDesc_"+widget.id );
			rssDesc.style.height = ( maximizeHeight - 140 );
			
			widget.elm_widgetContent.style.height = maximizeHeight;
		}catch(e){

			msg.warn( IS_R.getResource( IS_R.ms_errorOnWindowResize,[e]));
		}
	}
	
	this.adjustMaximizeWidth = function() {
		var contents = $("maximizeContents_"+widget.id );
//		if(contents && Browser.isIE) {
		if(contents) {	// fix #844
			try{
				var adjustWidth = getWindowSize(true) - findPosX(contents) - 32;
				
				// for desc
				var maximizeDetailTd = $("maximizeRssDetailTd_"+widget.id );
				var maximizeRssDescDiv = $("maximizeRssDetail_"+widget.id );
				if(maximizeRssDescDiv && maximizeDetailTd ){
					//var rssDescText = $("maximizeRssDescText_"+widget.id );
					var rssDesc = $("maximizeRssDesc_"+widget.id );
					var descWidth = maximizeDetailTd.offsetWidth;
					// Specify width of rssDescText
					rssDesc.style.width = (adjustWidth * 0.66);
					
				}
			}catch(e){

				msg.warn( IS_R.getResource( IS_R.ms_errorOnWindowResize,[e]));
			}
			return;
		}
	}
	
	this.hideMessageDiv = function() {
		var messageDiv = $("maximizeMessageDiv_"+widget.id );
		if( messageDiv )
			messageDiv.style.display = "none";
	}
	this.displayNoLink = function() {
		$("maximizeRssDetail_"+widget.id ).style.display = "none";
		IS_Widget.MaximizeRssReader.RssItemRender.getDetailIframe().style.display = "none";
		$("maximizeMessageDiv_"+widget.id ).style.display = "block";
	}
	this.iframeViewMode = function (aTag) {
		if(aTag) {
			if(!aTag.target)
				aTag.target = IS_Portal.isInlineUrl(aTag.href) ? "maximize_ifrm" : "_blank";
			if(aTag.target != "maximize_ifrm") return;
		}
		var detail = $("maximizeRssDetail_"+widget.id );
		if( detail && detail.style.display != "none")
			detail.style.display = "none";
		
		var iframe = IS_Widget.MaximizeRssReader.RssItemRender.getDetailIframe();
		var detailTd = $("maximizeRssDetailTd_"+widget.id );
		
		// Pass around iframe and share it
		if( detailTd && iframe.parentNode != detailTd )
			detailTd.appendChild( iframe );
		
		if( iframe.style.display != "block")
			iframe.style.display = "block";
	};
	this.detailViewMode = function() {
		var iframe = IS_Widget.MaximizeRssReader.RssItemRender.getDetailIframe();
		if( iframe && iframe.style.display != "none"){
			iframe.style.display = "none";
			iframe.src = "./blank.html";
		}
		
		var detail = $("maximizeRssDetail_"+widget.id );
		if( detail && detail.style.display != "block")
			detail.style.display = "block";
	}
	this.displayItem = function( itemNo,viewType ) {
		
		if( !this.currentCategory )
			return;
		
		var rssItem = this.currentCategory.content.rssContent.rssItems[itemNo];
		if( !rssItem )
			return;
		
		this.rssItemSelection.nowItemIdx = itemNo;
		this.currentCategory.maximizeRender.setSelectedItem( itemNo );
		
		this.hideMessageDiv();
		
		this.displayRssItem = rssItem;
		
		// viewType can take priority if it is specified
		var isIframeView;
		if(viewType == "desc"){
			isIframeView = false;
		}else if(viewType == "iframe"){
			isIframeView = true;
		}else{
			isIframeView = widget.getBoolUserPref("iframeview");
		}
		if(this.viewTimer) clearTimeout(this.viewTimer);
		
		if( isIframeView && rssItem.link.length == 0 && (rssItem.link_ajaxproxy_text || rssItem.description && rssItem.description != ""))
			isIframeView = false;
			
		if( !isIframeView && rssItem.link.length > 0 && !rssItem.link_ajaxproxy_text && !( rssItem.description && rssItem.description != "") )
			isIframeView = true;
		
		/* Ignore parameter of userPref if viewType is specified in iframe viewing mode */
		if( isIframeView ){
			if(rssItem.link.length == 0){
				this.displayNoLink();
				return;
			}
			
//			this.displayIframe( this.currentCategory,rssItem );
			this.viewTimer = setTimeout(this.displayIframe.bind(this, this.currentCategory,rssItem ), 5);
		}else{
			if( !rssItem ) {
				rssItem = {
					title: " ",
					link: "",
					date: "",
					creator: "",
					rssDate: null,
					description: ""
				}
			}
//			this.displayDetail( this.currentCategory,rssItem );
			this.viewTimer = setTimeout(this.displayDetail.bind(this, this.currentCategory,rssItem ) ,5);
		}
		
		this.toolBarContent.displayStateChanged();
	}
	this.displayIframe = function( feedWidget,rssItem ) {
		var iframe = IS_Widget.MaximizeRssReader.RssItemRender.getDetailIframe();
		var detailTd = $("maximizeRssDetailTd_"+widget.id );
		this.iframeViewMode();
		
		var maxIframe = IS_Widget.MaximizeRssReader.RssItemRender.getDetailIframe();
		if(IS_Widget.MiniBrowser.isForbiddenURL( rssItem.link )) {
			maxIframe.src = "js/widgets/maximize/maximizeForbiddenURL.jsp?url=" + encodeURIComponent(rssItem.link);
		}else{
			maxIframe.src = rssItem.link;
		}
	}
	this.clearDetail = function(){
		var rssItem = {
				title: " ",
				link: "",
				date: "",
				creator: "",
				rssDate: null,
				description: ""
			};
		this.displayDetail( this.currentCategory,rssItem );
	}
	this.displayDetail = function(feedWidget, rssItem){
		if( !feedWidget ) return;
		
		var itemDisplay = widget.getUserPref("itemDisplay");
		
		this.detailViewMode();
		
		//Prepare title link
		var rsslink = document.getElementById("maximizeRssTitle_"+widget.id );
		rsslink.style.display = "";
		rsslink.innerHTML = "";
		

		var rssTitle = (rssItem.title.length == 0)? IS_R.lb_notitle : rssItem.title;
		rssTitle = rssTitle.replace(/&nbsp;/g," ");	// For trouble with "&nbsp;" where line-break does not occur
		if(rssItem.link && rssItem.link.length > 0) {
			var aTag = document.createElement('a');
			aTag.href = rssItem.link;
			//aTag.innerHTML = rssTitle;
			aTag.appendChild(document.createTextNode(rssTitle));
			rsslink.appendChild(aTag);
			
			if( itemDisplay != "newwindow" ) {
				if(itemDisplay == "inline")
					aTag.target="maximize_ifrm";
				else
					aTag.target="";
			} else {
				aTag.target = "_blank";
			}
			IS_Event.observe( aTag, "click",this.iframeViewMode.bind(this, aTag), false, widget.id );
		} else {
			//rsslink.innerHTML = rssTitle;
			rsslink.appendChild(document.createTextNode(rssTitle));
		}
		rsslink.title = rssTitle;
		
		//Detailed time and Creater
		var rssPubDate = $("maximizeRssPubDate_"+widget.id );
		rssPubDate.innerHTML = "";
		rssPubDate.appendChild(document.createTextNode(rssItem.date));
		rssPubDate.appendChild(document.createTextNode("  "));
		rssPubDate.appendChild(document.createTextNode(rssItem.creator));
		
		//Category list
		var rssCategory = $("maximizeRssCategory_"+widget.id );
		rssCategory.innerHTML = IS_Widget.RssReader.RssItemRender.getCategoryHtml(rssItem.category);
		
		//Prepare description
		var rssDesc = document.getElementById("maximizeRssDesc_"+widget.id );
		rssDesc.style.display = "";
		var rssDescText = document.getElementById("maximizeRssDescText_"+widget.id );
		/*
		if(rssDesc && rssDesc.style.display == "none"){
			rssDesc.style.display = "block";
		}
		if(rssDescText && rssDescText.style.display == "none"){
			rssDescText.style.display = "block";
		}
		*/
		
		IS_Widget.Maximize.adjustMaximizeHeight();
		
		// Specify width of rssDescText
		if(Browser.isIE){
			rssDescText.style.width = rssDesc.offsetWidth - 8;
			
			if( !isNaN( rssDesc.offsetHeight )) {
				var rssDescTextHeight = rssDesc.offsetHeight;
				if( rssDescTextHeight > 16 )
					rssDescTextHeight -= 16;
				
				rssDescText.style.height = rssDescTextHeight;
			}
		}
		if(rssItem.description)
			rssDescText.innerHTML = IS_Widget.RssReader.RssItemRender.normalizeDesc( rssItem.description );
		else{
			rssDescText.innerHTML = "<div class=\"rss_summary\"><img src=\"" +  imageURL + "indicator.gif\"/> Loading...</div>"; 
			var opt = {
				method: 'get',
				asynchronous: true,
				onSuccess:function(req, obj){
					rssDescText.innerHTML = req.responseText;
				}.bind(self),
				onException:function(req, obj){
				  alert('Retrieving summary is failed:' + obj);
				},
		 	  onFailure:function(req, obj){
				  alert('Retrieving summary is failed:' + obj);
		 	 	}
			}
			AjaxRequest.invoke(is_getProxyUrl(rssItem.link_ajaxproxy_text, "NoOperation"), opt);
		}
		rssDescText.scrollTop = 0;
		if(rssDescText) {
			var descLinks = rssDescText.getElementsByTagName("a");
			if(descLinks) {
				for(var i = 0; i < descLinks.length; i++) {
					if(!descLinks[i].target || descLinks[i].target == "_self"
						|| descLinks[i].target == "_top" || descLinks[i].target == "_parent") {
						if(itemDisplay != "newwindow") {
							if(itemDisplay == "inline")
								descLinks[i].target = "maximize_ifrm";
							else
								descLinks[i].target = "";
							
							IS_Event.observe(descLinks[i], "click",
								this.iframeViewMode.bind( this,descLinks[i] ),
									false,widget.id );
						} else {
							descLinks[i].target = "_blank";
						}
					}
				}
			}
		}
	};
};
IS_Widget.MaximizeRssReader.Drag = IS_Class.create();
IS_Widget.MaximizeRssReader.Drag.prototype.classDef = function() {
	var self;
	var maximizeWidget;
	var barGhost;
	
	this.initialize = function( maximizeWidgetObj ) {
		maximizeWidget = maximizeWidgetObj;
		
		barGhost = document.createElement("div");
		barGhost.style.zIndex = "900";
		barGhost.style.position = "absolute";
		barGhost.style.cursor = "col-resize";
	}
	this.dragStart = function(e) {
		var bar = $("maximizeDragBar_"+maximizeWidget.id );
		
		// init ghost
		document.body.appendChild(barGhost);
		barGhost.style.height = bar.offsetHeight;
		barGhost.style.width = bar.offsetWidth;
		barGhost.style.border = "1px solid red";
		barGhost.style.top = findPosY(bar);
		barGhost.style.left = findPosX(bar);
		
		IS_Portal.showDragOverlay(Element.getStyle(bar, "cursor"));
		
		Event.observe(document, "mousemove", dragging, false);
		Event.observe(document, "mouseup", dragEnd, false);
		
		IS_Event.stop( e );
	};
	
	function dragging(e) {
		var mousex = Event.pointerX(e);
		
		barGhost.style.left = mousex - 6;
	}
	
	function dragEnd(e) {
		Event.stopObserving(document, "mousemove", dragging, false);
		Event.stopObserving(document, "mouseup", dragEnd, false);
		
		var list = $("rssListCell_"+maximizeWidget.id );
		var listX = findPosX(list);
		var barGhostX = findPosX(barGhost);
		var nowWidth = (barGhostX-listX > 0)? (barGhostX-listX) : 1;
		
		var rssDescText = $("maximizeRssDescText_"+maximizeWidget.id);
		var rssDetail = $("maximizeRssDetail_"+maximizeWidget.id );
		
		var review = false;
		if(rssDescText.style.display != "none"){
			rssDescText.style.display = "none";
			review = true;
		}
		
		if( Browser.isIE && nowWidth < 16 ) {
			list.style.display = "none";
		} else {
			list.style.display = "";
		}
		
		var contents = $("maximizeContents_"+maximizeWidget.id );
		var contentsWidth;
		if( contents )
			contentsWidth = contents.offsetWidth;
		
		if( /*Browser.isIE && */!isNaN( contentsWidth )&& !( nowWidth < contentsWidth -32 )) {
			maximizeWidget.content.toolBarContent.elm_toolBar.style.display = "none";
		} else {
			maximizeWidget.content.toolBarContent.elm_toolBar.style.display = "";
		}
		list.style.width = nowWidth;
		
		if( maximizeWidget.content.currentCategory &&
			maximizeWidget.content.currentCategory.content.rssContentView ) {
			var rssContentView = maximizeWidget.content.currentCategory.content.rssContentView;
		
			rssContentView.clearContents();
		}
		
		maximizeWidget.content.adjustMaximizeWidth();
		maximizeWidget.content.adjustMaximizeHeight();
		
		if(review)
			rssDescText.style.display = "block";
		
		document.body.removeChild(barGhost);
		IS_Portal.hideDragOverlay();
	}
}