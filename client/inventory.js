Template.inventory_add_form.events({
	'submit' : function(e,t) {
		e.preventDefault();
		console.log('submit caught');

		// Define Inventory Item
		var inventory = {
			category: '',
			sale_method: t.find('#sale_method').value,
			stock: 6
		};

		var price_points_name = $('input[name=price_point_name]');
		var price_points_multiplier = t.find('input[name=price_point_multiplier]');
		var price_points_price = t.find('input[name=price_point_price]');

		console.log('price points', price_points_name);
		console.log('price multiplyer', price_point_multiplier);
		console.log('price price ', price_point_price);




		return false;
	},
	'click .add-price-point': function(e,t) {
		e.preventDefault();
		$('#price-points tbody').append(
			"<tr class='price-point-row'>"
				+ "<td><input type='text' name='price_point_name' placeholder='Name' /></td>"
				+ "<td><input type='number' class='input-mini' placeholder='Name' /></td>"
				+ "<td><input type='number' class='input-mini' placeholder='Quantity' value='0' /></td>"
				+ "<td><input type='text' class='input-mini' name='price_point_price' placeholder='Price' /></td>"
				+ "<td><span class='badge badge-success'>29 units</span><br/><span class='badge badge-important'>delete</span><br/><span class='badge badge-important'>Add Sale Line</span>"
				+ "</tr>"
		)
		return false;
	}
});