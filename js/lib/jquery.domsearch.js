$(function($) {
	var Delayer = function(timeout){
		this.timeout = timeout ? timeout : 100;
	}

	Delayer.prototype.setup = function(delayedFn){
		this.clear();
		this.timerId = setTimeout(delayedFn, this.timeout);
	}

	Delayer.prototype.clear = function(){
		if(typeof this.timerId == "number"){
			clearTimeout(this.timerId);
			delete this.timerId;
		}
	}

	function guessUnit(tagName) {
		switch(tagName) {
			case 'TBODY':
			case 'TABLE':
				return 'tr';
			case 'OL':
			case 'UL':
				return 'li';
			case 'DIV':
				return 'div';
			case 'select':
				return 'option';
		}
		return undefined;
	}

	function search(query, searchIn, options){
		$($.grep($(searchIn).find(options.unit), function(row) {
			var text;
			switch(options.criteria.constructor) {
				case Array:
					text = $.map(
						options.criteria,
						function(crit) {
							return $(row).find(crit).text();
						}
						).join(' ');
					break;
				case String:
					text = $(row).find(options.criteria).text();
					break;
				default:
					text = $(row).text();
					break;
			}
			$(row).show().data('domsearch.score', LiquidMetal.score(text, query));
			return $(row).data('domsearch.score') < options.minimumScore;
		})
		.sort(function(a, b) {
			return $(a).data('domsearch.score') < $(b).data('domsearch.score');
		}))
		.appendTo(searchIn)
		.hide();
	}

	var methods = {
		init: function(searchIn, options) {
			var settings = {
				unit: undefined,
				criteria: false,
				minimumScore: 0.5
			};

			return this.each(function (){
				var $this = $(this),
						domSearchEnabled = $this.data('domsearch.enabled');


				if(!domSearchEnabled || options ){
					$.extend(settings, options);

					settings.target = $(searchIn);
					settings.unit = settings.unit || guessUnit(settings.target[0].tagName);

					var delayer = new Delayer(400);

					$this.keyup(function(event) {
						if (event.keyCode == 9) return true; // TAB
						delayer.setup(
							function() {
			          if ($this.val() == '') {
			            $this.data('originalOrder').show().appendTo(settings.target);
			          } else {
									search($this.val(), settings.target[0], settings);
			          }
								if (typeof settings.onkeydown == 'function') settings.onkeydown($this);
							}

							);
						return true;
					});

					$this.data('originalOrder', settings.target.find(settings.unit));
					$this.data('settings', settings);
					$this.data('domsearch.enabled', true);
				}
			});
		},

		search: function(query){
			if(this.data('domsearch.enabled')){
				var settings = this.data('settings');
				search(query, settings.target, settings);
			}
		},

		originalOrder: function(){
			if(this.data('domsearch.enabled')){
				var settings = this.data('settings');
				this.data('originalOrder', settings.target.find(settings.unit));
			}
		}
	}

	$.fn.domsearch = function( method ) {

    // Method calling logic
    if ( methods[method] ) {
      return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof method === 'object' || typeof method === 'string' || !method ) {
      return methods.init.apply( this, arguments );
    } else {
      $.error( 'Method ' +  method + ' does not exist' );
    }

  };

	$.domsearch = function(element, searchIn, options) {
		$(element).domsearch(searchIn, options);
	};

	$.fn.sort = function() {
		return this.pushStack([].sort.apply(this, arguments), []);
	};
})