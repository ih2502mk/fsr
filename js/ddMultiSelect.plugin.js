//TODO: add "fsr" prefix to all classes
//TODO: add "fsr" namespace to all event types
//TODO: get rid of terms like "uid"
//TODO: review optgroup identification method

(function($){

	var methods = {
		init:	function(options){

			var settings = {
//				container:		'',
				isSingle:			false,
				nested:				true,
				clickMarkable: true,
				onItemMark:		null
			}

			return this.each(function(){

				if(!$(this).is('select')){
					$.error( 'jQuery.ddSelect can be applied only to form select elements' );
					return;
				}

				var $this = $(this),
				data = $this.data('ddSelect');
				
				if(!data || options){
					$.extend( settings, options );

					var ddSelectWidget = $('<div />');
					ddSelectWidget.addClass('dd-select-wrapper').
						append('<div class="lc-wrapper"><div class="lc-container"></div></div>').
						append('<div class="rc-wrapper"><div class="rc-container"></div></div>').
						append('<div class="null-block"></div>');

					$('.lc-wrapper .lc-container, .rc-wrapper .rc-container', ddSelectWidget).
						append('<div class="dd-toolbox"></div>');
					$('.lc-wrapper .lc-container', ddSelectWidget).
						append('<ul class="src-list" ></ul>');
					$('.rc-wrapper .rc-container', ddSelectWidget).
						append('<ul class="trg-list" ></ul>');

					$('.lc-wrapper .lc-container .dd-toolbox', ddSelectWidget).
						append('<div class="search-panel"><input type="text" class="dd-select-lv-search"><span class="clear-search"></span></div>');

					$('.dd-select-lv-search', ddSelectWidget).data('searcher', {
						remind: function(keyword) {
							$this.ddSelect('filterSelect', keyword);
							delete this.timeoutID;
						},

						setup: function(keyword) {
							this.cancel();
							var self = this;
							this.timeoutID = window.setTimeout(function() {self.remind(keyword);}, 400);
						},

						cancel: function() {
							if(typeof this.timeoutID == "number") {
								window.clearTimeout(this.timeoutID);
								delete this.timeoutID;
							}
						}
					});

					$('.dd-select-lv-search', ddSelectWidget).bind('keyup', function(e){
						switch (e.keyCode) {
							case 16: // shift
							case 17: // ctrl
							case 18: // alt
							case 20: // caps lock
							case 33: // page up
							case 34: // page down
							case 35: // end
							case 36: // home
							case 37: // left arrow
							case 38: // up arrow
							case 39: // right arrow
							case 40: // down arrow
							case 9:  // tab
							case 13: // enter
							case 27: // esc
							return true;

						default: // all other keys
							$(this).data('searcher').setup($(this).val());
							if($(this).val().length){
								$(this).siblings('span.clear-search').addClass('keyword-present');
							} else {
								$(this).siblings('span.clear-search').removeClass('keyword-present');
							}
							return true;
						}

					});

					$('.clear-search', ddSelectWidget).bind('click', function(){
						if($(this).hasClass('keyword-present')){
							$(this).siblings('.dd-select-lv-search').val('');
							$(this).siblings('.dd-select-lv-search').trigger('keyup');
						}
					});

					if($this.children('optgroup').get(0)){

						$('.lc-wrapper .lc-container .dd-toolbox', ddSelectWidget).
							append('<div class="switch"><span class="flat-btn first">flat</span><span class="nested-btn last">nested</span></div>');

						$('span.flat-btn', ddSelectWidget ).click(function(){
							$this.ddSelect('option', 'nested' , false);
							$this.ddSelect('populate');
							$this.ddSelect('makeDraggable');
						});

						$('span.nested-btn', ddSelectWidget ).click(function(){
							$this.ddSelect('option', 'nested' , true);
							$this.ddSelect('populate');
							$this.ddSelect('makeDraggable');
						});

					}

					$('.rc-wrapper .rc-container .dd-toolbox', ddSelectWidget).
						append('<div><button class="clr-btn">Clear</button></div>');

					$('button.clr-btn', ddSelectWidget).click(function(){
						$this.ddSelect('clear');
						$this.ddSelect('populate');
						$this.ddSelect('makeDraggable');
						return false;
					});

					var Group = function($elem){

						var getGroupName = function(){
							return $elem.attr('label').substr(0, $elem.attr('label').indexOf('(group_nid'));
						}
						var getGroupLength = function(){
							return $elem.children('option').length;
						}
						var createGroupList = function(){
							return $('<ul />').addClass('group-list');
						}
						var createGroupListContainer = function(){
							var item = $('<li class="group-container"><div><span class="expand-btn">&nbsp;</span><span>'+getGroupName()+'</span></div></li>');
							return item;
						}

						return {
							groupName								:getGroupName(),
							groupLength							:getGroupLength(),
							groupListLeft						:createGroupList(),
							groupListRight					:createGroupList(),
							groupListContainerLeft	:createGroupListContainer(),
							groupListContainerRight	:createGroupListContainer(),
							getItems								:function(modifier){
								return $elem.children('option'+modifier);
							}
						};
					};

					var SelectItem = function($elem){
						var getSelectItemText = function(){
							return $elem.text();
						}

						var createSelsctItemLi = function(){
							if(!$elem.hasClass('duplicate')){
								if( $('option[value='+$elem.val()+']', $this).length > 1 ){
									$('option[value='+$elem.val()+']', $this).addClass('duplicate');
								}
							}

							var item = $('<li />').html($elem.text());
							item.data('uid', $elem.val());
							item.data('formSelectOption', $elem);
							if($elem.hasClass('duplicate')){
								item.addClass('duplicate');
							}
							item.addClass('item-uid-'+$elem.val());

							if(settings.clickMarkable){
								item.bind('click', function(e){
									$this.ddSelect('markItem', e, $(this).data('uid'));
								});
							}
							
							return item;
						}

						return {
							selectItemUid		:$elem.val(),
							selsctItemText	:getSelectItemText(),
							selsctItemLi		:createSelsctItemLi()
						}
					}

					$('optgroup', $this).each(function(i){
						$(this).data('groupObj', Group($(this)));
					});

					$('option', $this).each(function(){

						if($(this).parent('optgroup').get(0)){
							$(this).data('groupObj', $(this).parent('optgroup').data('groupObj'));
						} else {
							$(this).addClass('not-groupped');
						}

						$(this).data('selectItemObj', SelectItem($(this)));
					});

					if((typeof settings.container == 'string') && (typeof $(settings.container).get(0) != "undefined")){
						$(settings.container).html(ddSelectWidget.html()).addClass('dd-select-wrapper');
					} else {
						ddSelectWidget.insertAfter($this);
					}

					$this.data('ddSelect',{
						ddSelectWidget:ddSelectWidget,
						settings:settings
					});

					$this.ddSelect('populate');
					$this.ddSelect('makeDraggable');
					$this.ddSelect('makeExpandable');
					$this.ddSelect('indicateOptions');

					$this.addClass('ddSelect-processed');
				}
			})
		},

		populate: function(){

			var widget = this.data('ddSelect').ddSelectWidget;
			var $select = this;

			if(!widget){
				$.error( 'jQuery.ddSelect widget was not found on this element' );
				return;
			}

			var nested = this.data('ddSelect').settings.nested;

			var leftList = $('.lc-container > ul.src-list', widget);
			var rightList = $('.rc-container > ul.trg-list', widget);
			
			if(!nested) {
				$('option:not(.not-groupped)', $select).each(function(){
					$($('option[value='+$(this).val()+']',$select)[0]).removeClass('duplicate');
				});

				$('option:not(.duplicate)', $select).each(function(){

					var item = $(this).data('selectItemObj').selsctItemLi;

					if($(this).attr('selected')){
						rightList.append(item);
					} else {
						leftList.append(item);
					}
				});

				$('optgroup', $select).each(function(){
					var $thisGroupObj = $(this).data('groupObj');
					$thisGroupObj.groupListContainerLeft.
							appendTo(leftList).hide();
					$thisGroupObj.groupListContainerRight.
							appendTo(rightList).hide();
				});
			} else {

				$('optgroup', $select).each(function(){
					var $thisGroupObj = $(this).data('groupObj');

					$thisGroupObj.getItems(':not([selected])').each(function(){
						$thisGroupObj.groupListLeft.append($(this).data('selectItemObj').selsctItemLi);
					});

					$thisGroupObj.getItems('[selected]').each(function(){
						$thisGroupObj.groupListRight.append($(this).data('selectItemObj').selsctItemLi);
					});

					if($thisGroupObj.groupListLeft.children('li').length){
						if($thisGroupObj.groupListLeft.children('li').length == $thisGroupObj.groupLength){
							$thisGroupObj.groupListContainerLeft.addClass('full-group');
						} else {
							$thisGroupObj.groupListContainerLeft.removeClass('full-group');
						}

						$thisGroupObj.groupListContainerLeft.
							append($thisGroupObj.groupListLeft).
							appendTo(leftList).show();
					} else {
						$thisGroupObj.groupListContainerLeft.
							appendTo(leftList).hide();
					}

					if($thisGroupObj.groupListRight.children('li').length){
						if($thisGroupObj.groupListRight.children('li').length == $thisGroupObj.groupLength){
							$thisGroupObj.groupListContainerRight.addClass('full-group');
						} else {
							$thisGroupObj.groupListContainerRight.removeClass('full-group');
						}

						$thisGroupObj.groupListContainerRight.
							append($thisGroupObj.groupListRight).
							appendTo(rightList).show();
					} else {
						$thisGroupObj.groupListContainerRight.
							appendTo(rightList).hide();
					}

				});

				$select.children('option').each(function(){
					var item = $(this).data('selectItemObj').selsctItemLi;

					if($(this).attr('selected')){
						rightList.append(item);
					} else {
						leftList.append(item);
					}
				});

			}

			$('.lc-container li, .rc-container li', widget).removeClass('last');
			$('.lc-container li:last-child, .rc-container li:last-child', widget).addClass('last');

		},

		makeDraggable: function(){
			var widget = this.data('ddSelect').ddSelectWidget;

			if(!widget){
				$.error( 'jQuery.ddSelect widget was not found on this element' );
				return;
			}

			var $select = this;

			$( ".src-list li, .trg-list li", widget).draggable({
				revert: "invalid",
				revertDuration: 200,
				helper: function(){
					var $helper = $(this).clone();
					$(this).addClass('dd-select-placeholder');
					return $helper.addClass('dd-select-drag-helper');
				},
				scroll: false,
				appendTo: widget,
				distance: 10,
				containment: widget,
				stop: function(){
					$(this).removeClass('dd-select-placeholder');
				}
			}).disableSelection();

			$(".trg-list", widget).droppable({
				accept:'.src-list li',
				activeClass: 'dd-select-droppable-higlight',
				drop:function(event, ui){
					
					if(!ui.draggable.hasClass('group-container')){
						$('option[value='+ui.draggable.data('uid')+']', $select).attr('selected', 'selected');
					} else if(ui.draggable.hasClass('group-container')){
						ui.draggable.find('li').each(function(){
							$('option[value='+$(this).data('uid')+']', $select).attr('selected', 'selected');
						})
					}
					ui.helper.remove();
					$select.ddSelect('populate');
				}
			}).disableSelection();
			$(".src-list", widget).droppable({
				accept:'.trg-list li',
				activeClass: 'dd-select-droppable-higlight',
				drop:function(event, ui){
					
					if(!ui.draggable.hasClass('group-container')){
						$('option[value='+ui.draggable.data('uid')+']', $select).removeAttr('selected', 'selected');
					} else if(ui.draggable.hasClass('group-container')){
						ui.draggable.find('li').each(function(){
							$('option[value='+$(this).data('uid')+']', $select).removeAttr('selected', 'selected');
						})
					}
					ui.helper.remove();
					$select.ddSelect('populate');
				}
			}).disableSelection();
		},

		makeExpandable:function(){
			var widget = this.data('ddSelect').ddSelectWidget;

			if(!widget){
				$.error( 'jQuery.ddSelect widget was not found on this element' );
				return;
			}

			$('span.expand-btn', widget).live('click', function(){
				$(this).parent().parent('li').addClass('expanded');
				$(this).removeClass('expand-btn').addClass('collapse-btn');
			});
			$('span.collapse-btn', widget).live('click', function(){
				$(this).parent().parent('li').removeClass('expanded');
				$(this).addClass('expand-btn').removeClass('collapse-btn');
			});

		},

		clear: function(){
			$('option', this).removeAttr('selected');
		},

		indicateOptions: function(){
			var widget = this.data('ddSelect').ddSelectWidget;

			if(!widget){
				$.error( 'jQuery.ddSelect widget was not found on this element' );
				return;
			}

			if(this.data('ddSelect').settings.nested){
				$('span.nested-btn', widget).addClass('activated');
				$('span.flat-btn', widget).removeClass('activated');
			} else {
				$('span.nested-btn', widget).removeClass('activated');
				$('span.flat-btn', widget).addClass('activated');
			}

		},

		filterSelect: function(keyword){
			var widget = this.data('ddSelect').ddSelectWidget;
			if(!widget){
				$.error( 'jQuery.ddSelect widget was not found on this element' );
				return;
			}

			this.ddSelect('option', 'nested', false);
			this.ddSelect('populate');
			this.ddSelect('makeDraggable');

			$('.dd-select-lv-search', widget).addClass('throbbing');

			var re = new RegExp(keyword, "i");

			$('option', this).each(function(){
				if(!($(this).text().match(re))){
					$(this).data('selectItemObj').selsctItemLi.addClass('search-hidden');
				} else {
					$(this).data('selectItemObj').selsctItemLi.removeClass('search-hidden');
				}
			})

			$('.dd-select-lv-search', widget).removeClass('throbbing');
		},

		markItem: function(event, id){
			var widget = this.data('ddSelect').ddSelectWidget;

			if(!widget){
				$.error( 'jQuery.ddSelect widget was not found on this element' );
				return;
			}
			if(this.data('ddSelect').settings.isSingle){
				$('option', this).each(function(){
					$(this).data('selectItemObj').selsctItemLi.removeClass('fsr-marked');
				});
			}

			var $item = $('option[value="'+id+'"]', this).data('selectItemObj').selsctItemLi,
					markCallback = this.data('ddSelect').settings.onItemMark;

			if(!$item.hasClass('fsr-marked')){
				if(markCallback && (typeof markCallback == "function")){
					markCallback.apply($item, [event, id]);
				}
			}
			$item.toggleClass('fsr-marked');
		},

		option: function(key, value){
			var widget = this.data('ddSelect').ddSelectWidget;

			if(!widget){
				$.error( 'jQuery.ddSelect widget was not found on this element' );
				return;
			}

			var _value;
			
			if (typeof value == 'function'){
				_value = value.apply(this, widget);
			} else {
				_value = value;
			}

			if((typeof _value) != (typeof this.data('ddSelect').settings[key])){
				$.error( 'jQuery.ddSelect the type of value for option '+key+' must be' + typeof this.data('ddSelect').settings[key] );
				return;
			}
			
			this.data('ddSelect').settings[key] = _value;
			this.ddSelect('indicateOptions');
		}

	}

	$.fn.ddSelect = function( method ) {

    // Method calling logic
    if ( methods[method] ) {
      return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof method === 'object' || ! method ) {
      return methods.init.apply( this, arguments );
    } else {
      $.error( 'Method ' +  method + ' does not exist on jQuery.ddSelect' );
    }

  };

})(jQuery)

$(function(){
	$('#student-ref-select').ddSelect({onItemMark:function(event, id){ alert(id); }});
	$('#instructor-ref-select').ddSelect();
})