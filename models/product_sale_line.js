ProductSaleLines = new Meteor.Collection("product_sale_lines");

if(Meteor.isClient) {

}

if(Meteor.isServer) {
    // Publish data state of this set to all clients
    Meteor.publish('product_sale_lines', function() {
        return ProductSaleLines.find();
    });
}