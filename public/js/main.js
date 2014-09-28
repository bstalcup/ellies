Parse.initialize("CxmEYHd1nKiLXtz9B2IUYjDzrjiu8FA8BGrOzscX", "UqKme9pXBvdcG0YRM7JJU1PY7cm52Qkb2nmfAdkp");


info = {};
info['order'] = [];
var orderPlaced = false;
var delivery = false;
var orderId = "";
var orderChecker;


function updateQueueModal() {
	var modal = $('#queueModal')
		var Transaction = Parse.Object.extend('Transaction');
		var query = new Parse.Query(Transaction);
		query.lessThan("status",3);
		query.include("item");
		query.include("order");
		query.ascending("createdAt");
		query.find({
			success: function(results){
				modal.find('.row').empty()
				var string = ""
				for (var i = 0; i < results.length; i++) {
					// console.log(results[i].attributes)
					// console.log(results[i].attributes.item.attributes)
					// console.log(results[i].attributes.order.attributes)
					string += '<div class="large-4 medium-6 small-12 columns"><p>Orderer:&nbsp;<strong>'+results[i].attributes.order.attributes.name+'</strong></p></div>'
					string += '<div class="large-4 medium-6 small-12 columns"><p>Item:&nbsp;<strong>'+results[i].attributes.item.attributes.name+'</strong></p></div>'
					string += '<div class="large-4 medium-12 small-12 columns">'
					if (results[i].attributes.status == 0) {
						string += '<div class="alert-box secondary">We haven\'t started making it yet</div></div> <hr/>'
					}
					else if (results[i].attributes.status == 1) {
						string += '<div class="alert-box">We\'re making this item right now!</div></div> <hr/>' 
					}
					else if (results[i].attributes.status == 2) {
						string += '<div class="alert-box success">Ready for delivery/pickup!</div></div> <hr/>'
					}
				};
				modal.find('.row').append(string);
			},
			error: function(mystery, error){

			}
		});

}

function setClientBusyMeter() {
    var meterLength = 1;
    var numOpenTransactions = 0;
    var Transaction = Parse.Object.extend( "Transaction" );
    var query = new Parse.Query( Transaction );
    query.lessThan( "status", 2 );
    query.find(
    {
	success: function( results ){
	    numOpenTransactions = results.length;

	    if( numOpenTransactions > 0 )
	    {
		meterLength = numOpenTransactions * 10;
		if( meterLength > 100 )
		{
		    meterLength = 100;
		}
	    }
	    $( ".meter" ).width( meterLength + "%" );

	    if( meterLength < 40 )
	    {
		document.getElementById( "busymeter" ).className = "progress";
	    }
	    else if( meterLength < 70 )
	    {
		document.getElementById( "busymeter" ).className = "progress success";
	    }
	    else
	    {
		document.getElementById( "busymeter" ).className = "progress alert";
	    }

	},
	error: function( error ){
	    console.log( error );
	}
    });
}

function checkYourOrder()
{
    var Transaction = Parse.Object.extend( "Transaction" );
    var query = new Parse.Query( Transaction );
    var Order = Parse.Object.extend( "Order" );
    var order = new Order();
    order.id = orderId;
    query.equalTo( "order", order );
    query.lessThan( "status", 2 );
    query.find(
    {
	success: function( results )
	{
	    if( results.length < 1 )
	    {
		if( !delivery )
		{
		    $( "#readyModal" ).foundation( "reveal", "open" );
		    $( "#sounds" ).html( "<audio src='img/Ship_Bell-Mike_Koenig-1911209136.wav' autoplay></audio>" );
		}
		clearInterval( orderChecker );
		orderPlaced = false;
		delivery = false;
		document.getElementById( "queueButton" ).style.color = "#ffffff";
	    }
	},
	error: function( error )
	{
	    console.log( error );
	}
    });
}


$( function() {

	$('[data-reveal-id="orderModal"]').click( function(){
		$('#orderList').html( "" );
		var total = 0;
		var num = 0;
		for (var k = 0; k < info['order'].length; k++) {
		    item = info['order'][k];
		    $('#orderList').append("<tr><td>" + item.name + "</td><td>" + item.qty + "</td><td>$" + item.price * item.qty + "</td></tr>");
		    total += item.price * item.qty;
		    num += item.qty;
		}
		$('#orderList').append( "<tr><th>Total:</th><td>" + num + "</td><td>$" + total + "</td>" );
	    });

	var Item = Parse.Object.extend("Item");
	var query = new Parse.Query(Item);
	query.find(
	{
		success: function(results){
			var isotope = $('.isotope');
			var modals = $('.modals');
			for (var i = 0; i < results.length; i++) {
				var object = results[i].attributes;
				
				//construct the item for the page
				var string = "";
				string = "<a  class='small-12 medium-6 large-4 element-item food' data-category='food' href='#' data-reveal-id='modal" + i + "'><div style='background-image: url(" + object.image._url + "); background-size:100%; overflow:hidden; background-repeat: no-repeat; background-color: rgba(0,0,0,0);'><div class='reveal'><h4 class='reveal'>" + object.name + "</h4><p class='reveal'>" + object.description + "</p></div></div></a>";
				// string = "<a class='small-12 medium-6 large-4 element-item food' href='#' data-reveal-id='modal" + i + "'></a>";
				var modal = "";
				modal += "<div  price='" + object.price + "' id='modal" + i + "' data-item='"+results[i].id+"' class='reveal-modal' data-reveal>";
				modal += "<h2 id='name'>" + object.name + ": $" + object.price.toFixed(2) +"</h2>";
				modal += "<p>" + object.description + "</p>";
				
				//add options
				if(typeof object.options != "undefined") {
					for (var j = 0; j < object.options.length; j++) {
						var desc = object.options[j].split(",")[0];
						var price = parseFloat(object.options[j].split(",")[1]);
						// console.log(desc + " , " + price);
						modal += "<div class='row'><div class='small-8 columns'>"
						modal += "<h4 name='" + desc + "' class='right'>" + desc +": $" + price.toFixed(2) + "</h4>"
						modal += "</div><div class='small-4 columns'><div class='switch'>"
						modal += "<input id='"+desc+i+"' type='checkbox' price='"+price+"'>"
						modal += "<label for='"+desc+i+"'></label></div></div></div>"
					};
				}

				modal += "<div class='row'><div class='small-8 columns'><h4 class='right'>Quantity</h4></div><div class='small-4 columns'><input id='qty" + i +"' type='number' value=1></input></div></div>"
				modal += "<a class='right button'>Add to Cart</a>"
				modal += "<a class='close-reveal-modal'>&#215;</a></div>"
				isotope.append(string);
				modals.append(modal);
				placeOrder(i);
			}
			$(document).foundation();
		},
		error: function(error){
			console.log(error)
		}
	});
	function placeOrder(i) {
		$('#modal' + i + ' a.right').on( 'click', function(){
			var cook = {};
			var modal = $('#modal' + i);
			cook['name'] = modal.find('#name').text()
			cook['price'] = parseFloat(modal.attr('price'))
			modal.foundation('reveal', 'close')
			cook['item'] = modal.attr('data-item');
			cook['options'] = {}
			$('#modal' + i + ' .switch input').each(function(index, value){
				var desc = $(this).parent().parent().parent().find('.right').attr('name')
				cook['options'][desc] = $(this).is(":checked");
				if(cook['options'][desc])
				{
					cook['price'] += parseFloat($(this).attr('price'))
				}
			});
			cook['qty'] = parseInt($('#modal' + i + ' #qty' + i).val())
			info['order'].push(cook);
			$('number').text(info['order'].length);
		});
	}

	$('#queueButton').click(function(){
		updateQueueModal();
		// modal.empty()
		// modal.append
	});



	// init Isotope
	// var $container = $('.isotope').isotope({
	// 	itemSelector: '.element-item',
	// 	layoutMode: 'fitRows',
	// 	getSortData: {
	// 		name: '.name',
	// 		symbol: '.symbol',
	// 		number: '.number parseInt',
	// 		category: '[data-category]',
	// 		weight: function( itemElem ) {
	// 		var weight = $( itemElem ).find('.weight').text();
	// 		return parseFloat( weight.replace( /[\(\)]/g, '') );
	// 		}
	// 	}
	// 	});

	// // filter functions
	// var filterFns = {
	// 	// show if number is greater than 50
	// 	numberGreaterThan50: function() {
	// 	var number = $(this).find('.number').text();
	// 	return parseInt( number, 10 ) > 50;
	// 	},
	// 	// show if name ends with -ium
	// 	ium: function() {
	// 	var name = $(this).find('.name').text();
	// 	return name.match( /ium$/ );
	// 	}
	// };

	// // bind filter button click
	// $('#filters').on( 'click', 'button', function() {
	// 	var filterValue = $( this ).attr('data-filter');
	// 	// use filterFn if matches value
	// 	filterValue = filterFns[ filterValue ] || filterValue;
	// 	$container.isotope({ filter: filterValue });
	// 	});

	// // bind sort button click
	// $('#sorts').on( 'click', 'button', function() {
	// 	var sortByValue = $(this).attr('data-sort-by');
	// 	$container.isotope({ sortBy: sortByValue });
	// 	});
  
	// // change is-checked class on buttons
	// $('.button-group').each( function( i, buttonGroup ) {
	// 	var $buttonGroup = $( buttonGroup );
	// 	$buttonGroup.on( 'click', 'button', function() {
	// 		$buttonGroup.find('.is-checked').removeClass('is-checked');
	// 		$( this ).addClass('is-checked');
	// 		});
	// 	});

	setClientBusyMeter();
	setInterval( "setClientBusyMeter()", 10000 );
	setInterval( "updateQueueModal()", 10000 );

	$('#checkout').click(function(){
		var modal = $('#orderModal')
		var name = modal.find('#nameinput').val();
	        delivery = modal.find('#deliverySwitch').is(":checked");
		var room = parseInt(modal.find('#roomNumber').val());
		var comment = modal.find( '#comment' ).val();

		var Order = Parse.Object.extend('Order');
		var Transaction = Parse.Object.extend('Transaction');
		order = new Order()
		order.set('name', name); //user's entered name
		order.set('roomNumber', room);
		order.set('delivery', delivery);
		order.set( 'comment', comment );
		order.save({
			success:function(){
			    orderId = order.id;
				for (var l = 0; l < info['order'].length; l++) {
				    var transaction = new Transaction();
					transaction.save({
						item: { __type: "Pointer", className: "Item", objectId: info['order'][l].item},
						order: order,
						quantity: info['order'][l].qty,
						options: info['order'][l].options,
						status: 0
					    },{
						success: function(){
						    //console.log( "Saved! - " + transaction );
						},
						error: function(mystery, error){
							console.log("something went terribly wrong!")
							console.log(mystery)
							console.log(error)
						}
					    });
				}

				info['order'] = [];
				orderPlaced = true;
				$('number').text(info['order'].length);
				document.getElementById( "queueButton" ).style.color = "#ff4444";
				orderChecker = setInterval( "checkYourOrder()", 10000 );

			},
			error: function(mystery, error){
				console.log("could not create order!")
				console.log(mystery);
				console.log(error);
			}
		})
		modal.foundation('reveal', 'close');
	});

});
