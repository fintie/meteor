Session.setDefault('new_market_products', []);

Template.account_market_create.events({
	'click #add_product_to_market': function(e,t) {
		e.preventDefault();
		var selected_product = t.find('#product').value;

		
		if(selected_product.length > 0) {
			// Get the product and add to the session
			var product = Products.findOne({_id: selected_product});
			var products = Session.get('new_market_products');
			if(products === null) {
				products = [];
			}
			console.log('Products', products);
			products.push(product);
			console.log('added to array');
			Session.set('new_market_products', products);
			console.log('new markets saved');
		}

		// Show Modal

		
		return false;
	},
	'click #clear_market_products': function(e,t) {
		e.preventDefault();
		Session.set('new_market_products', []);
		return false;
	}
});

Template.account_market_create.market_selected_products = function() {
	return Session.get('new_market_products');
}

Template.account_market_create.account_products = function() {
	return Products.find({_user: Meteor.userId()});
}