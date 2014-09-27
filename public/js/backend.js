Parse.initialize("CxmEYHd1nKiLXtz9B2IUYjDzrjiu8FA8BGrOzscX", "UqKme9pXBvdcG0YRM7JJU1PY7cm52Qkb2nmfAdkp");


var currentOrders = [];
var numOpenOrders = 0;
var showCompletedOrders = false;

function showHideCompletedOrders() {
    showCompletedOrders = !showCompletedOrders;
    checkOrders( false );
}

function setBusyMeter() {
    var meterLength = 1;
    if( numOpenOrders > 0 )
    {
	meterLength = numOpenOrders * 10;
	if( meterLength > 100 ) meterLength = 100;
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
}

function updateOrder( num ) {
    currentOrders[num].set( "status", currentOrders[num].attributes.status+1 );
    currentOrders[num].save( null, {
	    success: function( order ) {
		checkOrders( false );
	    },
	    error: function( order, error ) {
		alert( "Cannot update order on server." );
	    }
	});
}

function checkOrders( playAlert ) {
    var Transaction = Parse.Object.extend( "Transaction" );
    var query = new Parse.Query( Transaction );
    query.ascending( "createdAt" );
    if( !showCompletedOrders )
    {
	query.lessThan( "status", 3 );
    }
    query.include( "item" );
    query.include( "order" );

    query.find(
    {
	success: function( results ){
	    if( playAlert && currentOrders.length != results.length ){
		$( "#sounds" ).html( "<audio src='img/Ship_Bell-Mike_Koenig-1911209136.wav' autoplay></audio>" );
	    }
	    currentOrders = results;
	    numOpenOrders = 0;
	    var orderTable = $( "#orders" );
	    orderTable.html( '<thead><tr><th>Customer</th><th>Item</th><th>Quantity</th><th>Options</th><th>Comments</th><th>Order Time</th><th>Status</th></tr></thead>' );

	    for( var i = 0; i < results.length; ++i )
	    {
		var object = results[i].attributes;
		var string = "";
		string += "<tr><td>" + object.order.attributes.name;
		string += "</td><td>" + object.item.attributes.name;
		string += "</td><td>" + object.quantity;
		string += "</td><td>";
		for( var key in object.options )
		{
		    if( object.options[key] )
		    {
			string += key + "<br/>";
		    }
		}
		string += "</td><td>";
		if( object.order.attributes.delivery )
		{
		    string += "Delivery: Rm. ";
		    string += object.order.attributes.roomNumber + "<br/><br/>";
		}
		if( object.order.attributes.comment )
		{
		    string += object.order.attributes.comment;
		}
		string += "</td><td>" + results[i].createdAt.toLocaleTimeString();
		string += "</td><td><a href='javascript:updateOrder( " + i + " )' class='button tiny ";

		if( object.status == 1 )
		{
		    string += "info'>In Progress</a></td></tr>";
		    ++numOpenOrders;
		}
		else if( object.status == 2 )
		{
		    string += "success'>Ready</a></td></tr>";
		}
		else if( object.status > 2 )
		{
		    string += "success disabled' style='color:#000000;'>Done</a></td></tr>";
		}
		else
		{
		    string += "alert'>Not Started</a></td></tr>";
		    ++numOpenOrders;
		}

		orderTable.append( string );
	    }
	    setBusyMeter();
	},
	error: function( error ) {
	    console.log( error );
	}
    });
}

$( function() {

	checkOrders( false );
	setInterval( "checkOrders( true )", 10000 );

});
