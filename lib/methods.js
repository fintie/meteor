var BidHandler = function(market_id) {
	this.market = Markets.findOne(market_id);

	this.getNextSL = function(price, pp, sl) {
		var sl_ids = [];
		pp.sale_lines.forEach(function(sl) {
			sl_ids.push(sl._sale_line);
		});



		//, price: {$lte: price}}
		//console.log('Price', price);
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

		var nsl = self.getNextSL(bid.price, pp, sale_line);
		var remaining_qty = bid.quantity;//nsl.inventory_available;
		
		while(nsl !== null && typeof nsl !== 'undefined' && remaining_qty > 0) {
			remaining_qty = self.processBid(remaining_qty, bid.price, pp, nsl);
			var nsl_tmp = self.getNextSL(bid.price, pp, sale_line);

			//console.log(parseFloat(bid.price), parseFloat(nsl_tmp.price));
			if(parseFloat(bid.price) > parseFloat(nsl_tmp.price)) {
				nsl = nsl_tmp;
			} else {
				// We have remaining amount - 
				console.log('UNFULLFILLED', remaining_qty, '@', bid.price);
				self.createBidOffer(bid.price, remaining_qty, remaining_qty, pp);
				nsl = null;
			}
		}

		console.log('Compelted Range');
		return ;
	}

	this.processBid = function(quantity, price, price_point, sale_line) {
		var err = result = null;
		//console.log(price_point, sale_line);

		var fullfilled_qty = sale_line.inventory_available - (sale_line.inventory_available > quantity ? quantity : sale_line.inventory_available); 
		var remaining = (sale_line.inventory_available - quantity) * -1;
		//console.log('Processing Bid line on', quantity, fullfilled_qty, remaining, price, sale_line._id);
		// 
		var obl = {
			quantity: fullfilled_qty,
			price: price,
			_market: this.market._id,
			_price_point: price_point._id,
			_sale_line: sale_line._id,
			_buyer: Meteor.userId(),
			_seller: this.market._user
		}

		var id = OrderBook.insert(obl);
		var sl_data = {inventory_available: parseInt(sale_line.inventory_available,10) - quantity};
		var final_inventory = sale_line.inventory_available - quantity;
		if(final_inventory < 0) {
			final_inventory = 0;
		}
		ProductSaleLines.update(sale_line._id, {$set: {inventory_available: final_inventory}});
		return remaining;
	}

	this.createBidOffer = function(price, quantity, inventory_available, price_point) {
		var bl = {
			_user: Meteor.userId(),
			_market: this.market._id,
			_price_point: price_point._id,
			price: price,
			quantity: quantity,
			inventory_available: inventory_available
		};
		var pbl = ProductBuyLines.insert(bl);
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

if(Meteor.isClient) {
	Handlebars.registerHelper('getBuyLines', function(pp_id, options) {
		console.log('Price Point Id', pp_id);
		var bl = ProductBuyLines.findOne({_price_point: pp_id});
		console.log(bl);
		//console.log('Run Once',  ProductBuyLines.find({_price_point: pp_id}), ProductBuyLines.find());
		var buy_lines = ProductBuyLines.find({_price_point: pp_id, inventory_available: {$gte: 1}}, {sort: {price: 1}});
		//return options.fn(buy_lines);
		return buy_lines;
	});
}