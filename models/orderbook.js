OrderBook = new Meteor.Collection("order_book");

if(Meteor.isClient) {
    Meteor.subscribe('order_book');
}

if(Meteor.isServer) {
    // Publish data state of this set to all clients
    Meteor.publish('order_book', function() {
        return OrderBook.find();
    });
}