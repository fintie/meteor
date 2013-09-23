var BidHandler = function(market_id) {
	this.market = Markets.findOne(market_id);



	// Market Makes Bid
	this.bid = function(bid, callback) {
		var self = this;
		var pp = ProductPricePoints.findOne(bid.price_point_id);
		var sale_line = ProductSaleLines.findOne(bid.sale_line_id);

		console.log('Price Point', pp);
		console.log('Sale Line', sale_line);
		console.log('Processing Bid', bid);

		//if(sale_line.inventory_available > )
		var remaining_stock = sale_line.inventory_available - (bid.quantity * pp.multiplier);
		if(remaining_stock > 0) {
			// FULLFILL ALL
			self.bidFullfill(bid.quantity, bid.price, pp, sale_line, function(err, result) {
				console.log('BID FULLFILLED');
			});
		} else {
			// NOT AVAILABLE - FILL WHAT IS
			var qty_available = ( (bid.quantity * pp.multiplier) - (remaining_stock * -1));
			self.bidFullfill(qty_available, bid.price, pp, sale_line, function(err, result) {
				console.log('BID FULLFILLED');

				// Add Bid order
				var remaining_qty = (remaining_stock * -1);
				self.bidOrder(remaining_qty, bid.price, pp, sale_line, function(err, result) {

				});
			});
		}
		var err = result = null;
		return callback(err, result);
	}

	this.bidOrder = function(quantity, price, price_point, sale_line, callback) {

	};

	this.bidFullfill = function(quantity, price, price_point, sale_line, callback) {
		var err = result = null;
		var obl = {
			quantity: quantity,
			price: price,
			_market: this.market._id,
			_price_point: price_point._id,
			_sale_line: sale_line._id,
			_user: Meteor.userId()
		}

		var id = OrderBook.insert(obl);

		ProductSaleLines.update(sale_line._id, {$set: {inventory_available: sale_line.inventory_available - quantity}});
		return callback(err, result);
	}
}

if(Meteor.isServer) {
	var path = Npm.require('path');
	var Fiber = Npm.require('fibers');
	var Future = Npm.require(path.join('fibers', 'future'));

	Meteor.methods({
		market_bid_sell: function(market_id, bids) {
			this.unblock();
			var future = new Future();

			var bh = new BidHandler(market_id);		
			var bid_functions = [];
			// Iterate through each of the bids
			bids.forEach(function(b) {
				// CHECK 
				//bid_functions.push(function(callback) {
					bh.bid(b, function(err, result) {
						console.log(err, result);
						//callback(err, result);
					});
				//});
			});

			// DO ASYNC


			// Get the current stock for the product
			return future.wait();
		}
	})




	/*
    Meteor.methods({
		cg_generator_content: function(generator_id, type, terms) {
			this.unblock();
			var future = new Future();
			CG.searchArticles(generator_id, type, terms, function(error, articles) {
				future.return(articles);
			});
			
			return future.wait();
		},

		// Background process - grabs the contents of the generator_site_article
		content_generator_background: function(generator_id) {
			this.unblock();
 			var future = new Future;
			CG.run(generator_id, function(error, articles) {				
				future.return(articles);
			});
			return future.wait();
		},
		cg_run: function(generator_id) {
			this.unblock();
			var future = new Future();
			CG.run(generator_id, function(error, articles) {
				future.return(articles);
			});
			return future.wait();
		}
		, cg_twitter_search: function(generator_id) {
			this.unblock();
			var future = new Future();
			CG.generatorTweets(generator_id, function(error, tweets) {
				future.return(tweets);
			});
			return future.wait();
		}
	});
	*/
}