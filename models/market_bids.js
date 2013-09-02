MarketBids = new Meteor.Collection("market_bids");

if(Meteor.isClient) {
    Meteor.subscribe('market_bids');
}

if(Meteor.isServer) {
    // Publish data state of this set to all clients
    Meteor.publish('market_bids', function() {
        return Markets.find();
    });

    Meteor.methods({
        market_bids: function(market_id, bid_list) {
            var err = null;
            var result = [];
            bid_list.forEach(function(b) {
                var bid = {
                    market_id: market_id,
                    price_point_id: b.price_point_id,
                    sale_line_id: b.sale_line_id,
                    price: b.price,
                    quantity: b.quantity,
                    _user: this.userId,
                    date: moment().toDate()
                }
                var bid_id = MarketBids.insert(bid);
                result[bid_id] = 'YEY';
                console.log('Bid Made', bid_id);
            }); 

            return result;
        }
    });

    /*
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
    */
}