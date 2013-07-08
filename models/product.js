Products = new Meteor.Collection("products");

if(Meteor.isClient) {

}

if(Meteor.isServer) {
    // Publish data state of this set to all clients
    Meteor.publish('all_products', function() {
        return Products.find();
    });

    Meteor.publish('user_products', function() {
        return Products.find({user: this.userId});
    });
}