Template.inventory_add_form.events({
	'submit' : function(e,t) {
		e.preventDefault();
		console.log('save triggered');
		var name = t.find('#product').value;
		var sale_method = t.find('#sale_method').value;
		var product = {
			name: name,
			sale_method: sale_method,
			price_points: []
		};

		// Find each of the available PPNS
		$('.price-point').each(function(id, pp) {

			// Get the name / multiplier
			var pp_name = $(pp).find('.pp_name');
			var pp_multiplier = $(pp).find('.pp_multiplier');


			var price_point = {
				_id: Meteor.Collection.ObjectID(),
				pricepoint: null,
				multiplier: 1,
				sale_lines: []
			};
			//console.log('Price Point', pp_name.val(), pp_multiplier.val());
			price_point.pricepoint = pp_name.val();
			price_point.multiplier = pp_multiplier.val();
			// Iterate through each fo the sale items
			$(pp).find('.sale-line').each(function(sl_id, sl) {
				// Get the price, quantity, inventory available
				var price = $(sl).find('.sl_price');
				//var quantity = $(sl).find('.sl_quantity');
				var ia = $(sl).find('.sl_ia');
				//console.log('Sale Line', price.val(), quantity.val(), ia.val());
				var quantity = Math.floor(parseInt(ia.val(), 10) / parseInt(pp_multiplier.val(), 10));
				//quantity = quantity.toFixed(0);
				var sale_line = {
					_id: Meteor.Collection.ObjectID(),
					price: price.val(),
					quantity: quantity,
					ia: ia.val()
				};
				price_point.sale_lines.push(sale_line);
			});

			product.price_points.push(price_point);
		});

		product._user = Meteor.userId();
		Products.insert(product);

		return false;
	},
	'click .add-price-point': function(e,t) {
		e.preventDefault();
		var templateName = "inventory_price_point";
		var fragment = Meteor.render( function() {
			return Template[ templateName ]();
		});
		$('#inventory_price_points').append(fragment);
		return false;
	}
});



Template.inventory_price_point.events = ({
	'click .addProduct' : function(e, t) {
		e.preventDefault();
		var templateName = "inventory_price_point_product";
		var fragment = Meteor.render( function() {
			return Template[ templateName ]();
		});
		console.log($(e.target).parent().find('.sale-lines').html());	
		$(e.target).parent().parent().find('.sale-lines').append(fragment);
		console.log('click detected - adding product');
		return false;
	}
})

Template.inventory_price_point_product.events = ({
	'click .removeProduct' : function(e, t) {
		e.preventDefault();
		
		return false;
	}
})