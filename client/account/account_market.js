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
	},
	'submit #market_create': function(e,t) {
		e.preventDefault();
		console.log('Creating Market Mesh');
		var title = t.find('#title');
		var market = {
			title: title.value,
			venues: [],
			products: []
		};
		$('.market_product').each(function(id, elem) {
			//console.log(elem, id);
			// Start by getting the product_id attached to the market
			var product_id = $(elem).find('input[name=product_id]').val();
			if(!product_id) {
				return ;
			}

			// Now that we now what the product is - lets find the sale method for it
			var sale_method = $(elem).find('select[name=sale_method]').val();
			var product = {
				_id: product_id,
				sale_method: sale_method,
				price_points: []
			}

			$(elem).find('.market_price_point').each(function(id, elem) {
				var price_point_id = $(elem).find('input[name=price_point_id]').val();
				if(!price_point_id) {
					return;
				}
				var price_point = {
					_id: price_point_id,
					sale_lines: []
				};

				$(elem).find('.market_price_point_sale-line').each(function(id, elem) {
					var sale_line_id = $(elem).find('input[name=sale_line_id]').val();
					console.log('Sale Line', sale_line_id);
					if(!sale_line_id) {
						return;
					}

					var price = $(elem).find('input[name=price]').val();
					var sale_line = {
						_id: sale_line_id,
						price: price
					};
					price_point.sale_lines.push(sale_line);
				});
				product.price_points.push(price_point);
			});
			market.products.push(product);
		});

		market._user = Meteor.userId();
		Markets.insert(market);
		console.log('Market Details', market);
		return false;
	}
});

Template.account_market_create.market_selected_products = function() {
	return Session.get('new_market_products');
}

Template.account_market_create.account_products = function() {
	return Products.find({_user: Meteor.userId()});
}


Template.market_product_row_price_point.price_point = function() {
	return ProductPricePoints.findOne({_id: this._price_point});
}

Template.market_product_row_sale_line.sale_line = function() {
	console.log('Sale Line Row',this);
	return ProductSaleLines.findOne({_id: this._sale_line});
}