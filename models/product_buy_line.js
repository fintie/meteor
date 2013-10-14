ProductBuyLines = new Meteor.Collection("product_buy_lines");

if(Meteor.isClient) {

}

if(Meteor.isServer) {
    // Publish data state of this set to all clients
    Meteor.publish('product_buy_lines', function() {
    	var buy_lines = ProductBuyLines.find();
        return buy_lines;
    });
}