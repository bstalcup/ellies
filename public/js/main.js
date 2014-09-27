Parse.initialize("CxmEYHd1nKiLXtz9B2IUYjDzrjiu8FA8BGrOzscX", "UqKme9pXBvdcG0YRM7JJU1PY7cm52Qkb2nmfAdkp");



$( function() {

	var Item = Parse.Object.extend("Item");
	var query = new Parse.Query(Item);
	query.find(
	{
		success: function(results){
			var isotope = $('.isotope')
			for (var i = 0; i < results.length; i++) {
				var object = results[i].attributes;
				
				//construct the item for the page
				var string = ""
				string = "<div class='element-item food' style='background-image: url(" + object.image._url + "); background-size: 300px;'><div class='reveal'>" + object.name + "</div></div>";
				
				console.log(string);
				isotope.append(string);
			}
		},
		error: function(error){
			console.log(error)
		}
	});

	// init Isotope
	var $container = $('.isotope').isotope({
		itemSelector: '.element-item',
		layoutMode: 'fitRows',
		getSortData: {
		    name: '.name',
		    symbol: '.symbol',
		    number: '.number parseInt',
		    category: '[data-category]',
		    weight: function( itemElem ) {
			var weight = $( itemElem ).find('.weight').text();
			return parseFloat( weight.replace( /[\(\)]/g, '') );
		    }
		}
	    });

	// filter functions
	var filterFns = {
	    // show if number is greater than 50
	    numberGreaterThan50: function() {
		var number = $(this).find('.number').text();
		return parseInt( number, 10 ) > 50;
	    },
	    // show if name ends with -ium
	    ium: function() {
		var name = $(this).find('.name').text();
		return name.match( /ium$/ );
	    }
	};

	// bind filter button click
	$('#filters').on( 'click', 'button', function() {
		var filterValue = $( this ).attr('data-filter');
		// use filterFn if matches value
		filterValue = filterFns[ filterValue ] || filterValue;
		$container.isotope({ filter: filterValue });
	    });

	// bind sort button click
	$('#sorts').on( 'click', 'button', function() {
		var sortByValue = $(this).attr('data-sort-by');
		$container.isotope({ sortBy: sortByValue });
	    });
  
	// change is-checked class on buttons
	$('.button-group').each( function( i, buttonGroup ) {
		var $buttonGroup = $( buttonGroup );
		$buttonGroup.on( 'click', 'button', function() {
			$buttonGroup.find('.is-checked').removeClass('is-checked');
			$( this ).addClass('is-checked');
		    });
	    });

	$( ".panel" ).on( "mouseenter", function(){
		$container.isotope({ filter: ".metal" });
	    });
	$( ".panel" ).on( "mouseleave", function(){
		$container.isotope({ filter: "*" });
	    });
    });
