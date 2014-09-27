
var currentOrders = [];
var showCompletedOrders = false;

function showHideCompletedOrders() {
    showCompletedOrders = !showCompletedOrders;
    checkOrders( false );
}

function updateOrder( num ) {
    currentOrders[num].set( "Status", currentOrders[num].attributes.Status+1 );
    currentOrders[num].save( null, {
	    success: function( order ) {
		checkOrders( true );
	    },
	    error: function( order, error ) {
		alert( "Cannot update order on server." );
	    }
	});
}

function checkOrders( playAlert ) {
    var Transaction = Parse.Object.extend( "Transaction" );
    var query = new Parse.Query( Transaction );
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
	    var orderTable = $( "#orders" );
	    orderTable.html( '<thead><tr><th width="300px">Order ID</th><th width="300px">Item</th><th width="300px">Quantity</th><th width="300px">Order Time</th><th width="300px">Status</th></tr></thead>' );

	    for( var i = 0; i < results.length; ++i )
	    {
		var object = results[i].attributes;
		var string = "";
		string += "<tr><td>" + results[i].id + "</td><td>" + object.Item + "</td><td>" + object.Quantity + "</td><td>" + results[i].createdAt + "</td><td><a href='javascript:updateOrder( " + i + " )' class='button tiny ";
		if( object.Status == 1 )
		{
		    string += "info'>In Progress</a></td></tr>";
		}
		else if( object.Status > 1 )
		{
		    string += "alert'>Done</a></td></tr>";
		}
		else
		{
		    string += "success'>Not Started</a></td></tr>";
		}
		orderTable.append( string );
	    }
	},
	error: function( error ) {
	    console.log( error );
	}
    });
}

$( function() {

	checkOrders( true );
	setInterval( "checkOrders( true )", 10000 );

});
