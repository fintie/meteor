var BidHandler = function(market_id) {
	this.market = Markets.findOne(market_id);

	this.getNextSL = function(price, pp, sl) {
		var sl_ids = [];
		pp.sale_lines.forEach(function(sl) {
			sl_ids.push(sl._sale_line);
		});



		//, price: {$lte: price}}
		var rsl = ProductSaleLines.findOne({_id: {$in: sl_ids}, inventory_available: {$gte: 1}}, {sort: {price: 1}});
		return rsl;

		// BUG OUT
		
		rsl.forEach(function(s) {
			// HOLD IT HERE AS A PATTERN - TAKE FIRST BUT WARY OF SECOND
			//console.log('Returning ', s);
			return s;
		});
		return null;
	};

	// Market Makes Bid
	this.bid = function(bid, callback) {
		var self = this;
		var pp = ProductPricePoints.findOne(bid.price_point_id);
		var sale_line = ProductSaleLines.findOne(bid.sale_line_id);

		




		// Add Bid order
		/*
		var remaining_stock = sale_line.inventory_available - (bid.quantity * pp.multiplier);
		var remaining_qty = (remaining_stock * -1);
		*/

		//var qty_available = ( (bid.quantity * pp.multiplier) - (remaining_stock * -1));
		//console.log('Starting Qty', qty_available);
		var nsl = self.getNextSL(bid.price, pp, sale_line);
		var remaining_qty = bid.quantity;//nsl.inventory_available;
		console.log('NSL', nsl);
		while(nsl !== null && remaining_qty > 0) {
			remaining_qty = self.processBid(remaining_qty, bid.price, pp, nsl);
			console.log('Iteration Done', remaining_qty);
			nsl = self.getNextSL(bid.price, pp, sale_line);
		}

		console.log('Compelted Range');
		return ;



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
				console.log('FULLFILLING AVAILABLE IN FIRST TIER');

				// Add Bid order
				var remaining_qty = (remaining_stock * -1);
				var nsl = null;

				while(nsl = self.getNextSL(bid.price, pp, sale_line) && nsl !== null && remaining_qty > 0) {
					remaining_qty = self.processBid(remaining_qty, bid.price, pp, nsl);
					console.log('Iteration Done', remaining_qty);
				}

				console.log('Cleaned Up');
			});
		}
		var err = result = null;
		return callback(err, result);
	}

	this.processBid = function(quantity, price, price_point, sale_line) {
		var err = result = null;

		var ff_qty = (sale_line.inventory_available > quantity ? quantity : sale_line.inventory_available); 
		var remaining = (sale_line.inventory_available - quantity) * -1;
		console.log('Processing Bid line on', quantity, ff_qty, remaining, price, sale_line._id);
		var obl = {
			quantity: ff_qty,
			price: price,
			_market: this.market._id,
			_price_point: price_point._id,
			_sale_line: sale_line._id,
			_user: Meteor.userId()
		}

		var id = OrderBook.insert(obl);
		var sl_data = {inventory_available: parseInt(sale_line.inventory_available,10) - quantity};
		ProductSaleLines.update(sale_line._id, {$set: {inventory_available: sale_line.inventory_available - quantity}});
		return remaining;
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
		var sl_data = {inventory_available: parseInt(sale_line.inventory_available,10) - quantity};

		console.log(sale_line._id, sl_data);
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