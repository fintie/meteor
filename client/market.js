Template.market.active_markets = function() {
    // Return just the actives
    return Markets.find();
};

Template.market_form.market_selected_products = function() {
    return Session.get('market_product_list');
};

Template.market_form.events = ({
    'submit #market_form' : function(e,t) {
        e.preventDefault();

        var fields = {};
        // Now we need to get a list of everything that's inserted into the page
        var html_fields = $(e.target).find(':input:not(:button)');
        for(var i = 0; i < html_fields.length; i++) {
            var f = html_fields[i];
            fields[$(f).attr('id')] = $(f).val();
        }
        fields.user = Meteor.userId();

        // Add a list of the products
        var market = fields;
        market.user = Meteor.userId();
        market.products = Session.get('market_product_list');
        var market_id = Markets.insert(fields);
    }
});

Template.add_product_to_market.user_products = function() {
    return Products.find({user: Meteor.userId()});
};

Template.add_product_to_market.events = ({
    'submit #market_product_selection': function(e, t) {
        e.preventDefault();
        var product = t.find('#product').value || null;
        var price = t.find('#price').value || null;
        var quantity = t.find('#quantity').value || null;

        //if(product && price && quantity) {
            var current_products = Session.get('market_product_list') || [];
            current_products.push({
                _id: Random.id(),//new Meteor.Collection.ObjectID(),
                product: product,
                price: parseFloat(price),
                quantity: parseInt(quantity,10),
                remaining: parseInt(quantity,10)
            });
            Session.set('market_product_list', current_products);

            // Kill modal
            $('#market_product_selection').trigger("reset");
            $(e.target).parent('.modal').modal('hide');
        //}
    }
});


// MARKET BASED OPTIONS

Template.market_row_product.events = ({
    'click .bid': function(e, t) {
        e.preventDefault();
        var market_id = $(e.target).closest('.market-row').attr('data-id');
        var quantity = parseInt(t.find('#quantity').value, 10);

        if(quantity === 0) {
            // Put some error here
            console.log('Error with Quantity');
            return false;
        }


        Meteor.call('market_bid', market_id, this._id, quantity, function(error, result) {
            if(error) {
                console.log('Error', error);
            }
        });
        return false;
    }
});