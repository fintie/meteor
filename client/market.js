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
















// NEW MARKET HANDLERS
Template.view_market.market = function() {
    return Markets.findOne(Session.get('current_market_id'));
}

Template.market_product_detail.product = function() {
    //console.log(this);
    return Products.findOne(this._id);
}

Template.market_price_point.price_point = function() {
    //console.log('Price Point', this);
    return ProductPricePoints.findOne(this._id);
}

Template.market_price_point_sale_line.sale_line = function() {
    //console.log('Sale Line', this);
    return ProductSaleLines.findOne(this._id);
}

Template.market_order_stage_1.current_market_orders = function() {
    //console.log('Current Orders', Session.get('current_market_orders'));
    // Convert to array
    var order_lines = Session.get('current_market_orders');
    var sorted = [];
    if(typeof order_lines !== 'undefined') {
        sorted = order_lines.sort(function(a, b) {
            return a.key > b.key;
        });
        return sorted;
    }
    return [];
}

Template.market_order_stage_2.current_market_orders = function() {
    //console.log('Current Orders', Session.get('current_market_orders'));
    // Convert to array
    var order_lines = Session.get('current_market_orders');
    var sorted = [];
    if(typeof order_lines !== 'undefined') {
        sorted = order_lines.sort(function(a, b) {
            return a.key > b.key;
        });
        return sorted;
    }
    return [];
}

Template.view_market.market_order_stage = function() {
    var stage = Session.get('market_order_stage') || 1;
    return Template['market_order_stage_' + stage]();
}

Template.market_order_stage_1.events({
    'click .proceed': function(e, t) {
        e.preventDefault();

        var bid_list = {};
        // Get the contents the user has
        $('#order_pad_form').find('.order_book_row').each(function(id, row) {
            var k = $(row).find('.order_key').val();
            var pp_id = $(row).find('.sl_pp').val();
            var sl_id = $(row).find('.sl_id').val();
            var pp_quantity = $(row).find('.sl_quantity').val();
            var pp_price = $(row).find('.sl_price').val();

            // Var Bid
            var bid = {
                price_point_id: pp_id,
                sale_line_id: sl_id,
                quantity: pp_quantity,
                price: pp_price
            }

            //console.log('Bid Row', bid);
            bid_list[k] = bid;
        });

        Session.set('market_order_stage', 2);
        Session.set('bid_list', bid_list);
        return false;
    }
});

Template.market_order_stage_2.events({
    'click .proceed': function(e, t) {
        e.preventDefault();

        // Ok - Save the bid history
        var bid_list = Session.get('bid_list');
        var market_id = Session.get('current_market_id');
        var bids = _.toArray(bid_list);
        
        var bid_results = Meteor.call('market_bids', market_id, bids);
        console.log('Results', bid_results);
        Session.set('market_order_stage', 3);
        return false;
    }
    , 'click .edit': function(e, t) {
        e.preventDefault();
        Session.set('market_order_stage', 1);
        return false;
    }
});

Template.view_market.events({
    'click .make_offer': function(e, t) {
        e.preventDefault();
        //$('#order_pad').remove();

        var sale_line_id = $(e.target).attr('data-id');
        var pp = ProductPricePoints.findOne({'sale_lines._sale_line': sale_line_id});
        var sale_line = ProductSaleLines.findOne(sale_line_id);
        // Get the current market_orders
        var market_id = Session.get('current_market_id');

        var current_market_orders = Session.get('current_market_orders');
        //console.log(current_market_bids);
        if(typeof current_market_orders === 'undefined') {
            current_market_orders = [];
        }

        var k = pp.name.replace(/s/g, '_').toUpperCase() + '_' + new Date().getTime();
        //.current_market_orders[k] = {market: market_id, price_point: pp, sale_line: sale_line};
        current_market_orders.push({key: k, market: market_id, price_point: pp, sale_line: sale_line});

        Session.set('current_market_orders', current_market_orders);

        /*
        // Generate a modal popup
        var templateName = "order_pad_modal";
        var fragment = Meteor.render( function() {
            return Template[ templateName ]({price_point: pp, sale_line: sale_line});
        });
        $('body').append(fragment);
        $('#order_pad').modal('show')
        */
        return false;
    }
});