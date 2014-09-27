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

    console.log( meterLength );

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
    currentOrders[num].set( "Status", currentOrders[num].attributes.Status+1 );
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
	query.lessThan( "Status", 2 );
    }
    query.find(
    {
	success: function( results ){
	    if( playAlert && currentOrders.length != results.length ){
		$( "#sounds" ).html( "<audio src='Ship_Bell-Mike_Koenig-1911209136.wav' autoplay>" );
	    }
	    currentOrders = results;
	    numOpenOrders = 0;
	    var orderTable = $( "#orders" );
	    orderTable.html( '<thead><tr><th width="300px">Order ID</th><th width="300px">Item</th><th width="300px">Quantity</th><th width="300px">Order Time</th><th width="300px">Status</th></tr></thead>' );

	    for( var i = 0; i < results.length; ++i )
	    {
		var object = results[i].attributes;
		var string = "";
		string += "<tr><td>" + results[i].id + "</td><td>" + object.Item + "</td><td>" + object.Quantity + "</td><td>" + results[i].createdAt.toLocaleTimeString() + "</td><td><a href='javascript:updateOrder( " + i + " )' class='button tiny ";

		if( object.Status == 1 )
		{
		    string += "info'>In Progress</a></td></tr>";
		    ++numOpenOrders;
		}
		else if( object.Status > 1 )
		{
		    string += "success'>Done</a></td></tr>";
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
