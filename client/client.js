/**
 * Client subscriptions
 *
 * In Meteor, the client and server share the same database API. The same exact application code —
 * like validators and computed properties — can often run in both places.
 * But while code running on the server has direct access to the database,
 * code running on the client does not.
 *
 * Every Meteor client includes an in-memory database cache. To manage the client cache,
 * the server publishes sets of JSON documents, and the client subscribes to those sets.
 * As documents in a set change, the server patches each client's cache.
 *
 * When you run a data query on the client over a subscription data set you only get the subset of data
 * provided by the server.
 */
//Meteor.subscribe("messages");
//Meteor.subscribe("allUserData");

/**
 * Global Template Helpers
 */
Handlebars.registerHelper('fromNow', function(date) {
    if (date) {
        return moment(date).fromNow();
    } else {
        return 'unknown';
    }
});

Handlebars.registerHelper('formatted_date', function(date) {
    if (typeof date === 'string') {
        date_string = moment(date).format('YYYY-MM-DD');
    } else {
        date_string = moment().format('YYYY-MM-DD');
    }
    return date_string;
});

Handlebars.registerHelper('product_lookup', function(product, options) {
    var ret = '';
    if(product) {
        var p = Products.findOne({_id: product});
        ret = ret + options.fn(p);
    }
    return ret;
});

var Utils = {};

Utils.log = function(value) {
    if (typeof console !== 'undefined') {
        console.log(value);
    }
};

/**
 * Navigation template helpers and events
 */

Template.navigation.pages = function()  {
    return [
        {
            url: '/',
            title: 'Home',
            page: 'homepage'
        },
        {
            'url': '/market',
            title: 'Market',
            page: 'market'
        },
        {
            'url': '/account',
            title: 'Account',
            page: 'account'
        }
    ];
};

Template.navigation.getNavigationStyle = function(pageName) {
    if (pageName === Meteor.Router.page()) {
        return 'class="active"';
    }
};

// Example of how you cannot join with mongo,
// we have to pull back the user for each message to get the user's name
// (could have stored the name on the message document though)
// Note: the users is baked into Meteor.
/*
Template.messages.usersName = function(userId)  {
    var user =  Meteor.users.findOne(userId);
    if (user) {
        return user.profile.name;
    } else {
        return '';
    }

};
*/

// UI for creating a new account
Accounts.ui.config({
  requestPermissions: {
  },
  requestOfflineToken: {
  },
  passwordSignupFields: 'USERNAME_AND_EMAIL'
});

// Subscriptions
Meteor.subscribe("all_products");

Deps.autorun(function () {
    Meteor.subscribe("user_products");
});

// Account
Template.account.events = ({
    'click .addProduct': function(e,t) {
        console.log('Render modal..');
    }
});

Template.account_products.products = function() {
    return Products.find({user: Meteor.userId()});
};

Template.modal_account_product.events = ({
    'submit': function(e, t) {
        e.preventDefault();

        var name = t.find('#name').value || null;
        var product_id = Products.insert({
            user: Meteor.userId(),
            name: name
        });

        var m = $(e.target).parent('.modal').modal('hide');
    }
});