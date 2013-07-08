Markets = new Meteor.Collection("markets");

if(Meteor.isClient) {
    Meteor.subscribe('markets');
}

if(Meteor.isServer) {
    // Publish data state of this set to all clients
    Meteor.publish('markets', function() {
        return Markets.find();
    });

    Meteor.methods({
        market_bid: function(id, product, quantity) {
            var negated_quantity = (0 - quantity);
            Markets.update(
                {
                    _id: id,
                    'products._id': product
                },
                {
                    $push: {
                        'products.$.bids': {
                            _id : Random.id(),
                            user: this.userId,
                            quantity: parseInt(quantity, 10),
                            date: moment().toDate()
                        }
                    },
                    $inc: {
                        'products.$.remaining': negated_quantity
                    }
                },
                function(err) {
                    if(err) {
                        console.log('Error', err.stack);
                    }
                }
            );
            return true;
        }
    });
}