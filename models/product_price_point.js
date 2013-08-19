ProductPricePoints = new Meteor.Collection("product_price_points");

if(Meteor.isClient) {

}

if(Meteor.isServer) {
    // Publish data state of this set to all clients
    Meteor.publish('product_price_points', function() {
        return ProductPricePoints.find();
    });
}