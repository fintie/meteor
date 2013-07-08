Inventory = new Meteor.Collection("inventory");

if(Meteor.isClient) {

}

if(Meteor.isServer) {
    // Publish data state of this set to all clients
    Meteor.publish('inventory', function() {
        return Inventory.find();
    });

    Meteor.publish('user_inventory', function() {
        return Inventory.find({user: this.userId});
    });
}