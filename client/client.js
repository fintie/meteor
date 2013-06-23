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

Template.navigation.getNavigationCountFragment = function(pageName) {

    var navCountFragment = '';

    if (pageName === 'messages') {

        var messageCount = Messages.find().count();
        if (messageCount > 0) {
            navCountFragment = '<span class="navbar-unread">'+ messageCount + '</span>';
        }

    } else if (pageName === 'users') {

        var userCount = Meteor.users.find().count();
        if (userCount > 0) {
            navCountFragment = '<span class="navbar-unread">' + userCount + '</span>';
        }
    }

    return navCountFragment;
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