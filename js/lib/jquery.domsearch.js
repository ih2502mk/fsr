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
		}
		return undefined;
	}

	function search(query, searchIn, options) {
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

	function init(element, searchIn, options) {
		var target = $(searchIn),
		defaults = {
			unit: undefined,
			criteria: false,
			minimumScore: 0.5
		},
		opts = $.extend(defaults, options);
		opts.unit = opts.unit || guessUnit(target[0].tagName);

		var originalOrder = target.find(opts.unit);

		var delayer = new Delayer(400);

		$(element).keyup(function(event) {
			if (event.keyCode == 9) return true; // TAB
			var field = $(this);
			delayer.setup(
				function() {
//          if (field.val() == '') {
//            originalOrder.show().appendTo(target);
//          } else {
//						search(field.val(), target[0], opts);
//          }
					search(field.val(), target[0], opts);
					if (typeof opts.onkeydown == 'function') opts.onkeydown(field);
				}

				);
			return true;
		});
	}

	$.fn.sort = function() {
		return this.pushStack([].sort.apply(this, arguments), []);
	};
	$.domsearch = function(element, searchIn, options) {
		init(element, searchIn, options);
	};
	$.fn.domsearch = function(query, options) {
		if (!$(this).data('domsearch.enabled')) {
			$(this).data('domsearch.enabled', true);
			return this.each(function() {
				new $.domsearch(this, query, options);
			});
		}
	};
});