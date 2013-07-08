UserLocations = new Meteor.Collection("user_locations");

if(Meteor.isClient) {

}

if(Meteor.isServer) {
    // Publish data state of this set to all clients
    Meteor.publish('user_locations', function() {
        return Pages.find();
    });
}