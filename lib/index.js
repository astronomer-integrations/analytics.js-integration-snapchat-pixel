'use strict';

/**
 * Module dependencies.
 */

var integration = require('@astronomerio/analytics.js-integration');

/**
 * Expose `Snapchat Pixel`.
 */

var SnapchatPixel = (module.exports = integration('Snapchat Pixel')
.option('pixelId', '')
.tag('<script src="//sc-static.net/scevent.min.js">'));

/**
 * Initialize.
 *
 * https://businesshelp.snapchat.com/en-US/article/pixel-website-install
 */

 SnapchatPixel.prototype.initialize = function() {
    if (window.snaptr) {
        this.load(this.ready);
        return;
    }
    var snaptr = window.snaptr = function() {
        snaptr.handleRequest ? snaptr.handleRequest.apply(snaptr, arguments) : snaptr.queue.push(arguments)
    }
    snaptr.queue = [];
    snaptr('init', '1d6d782e-82dc-4df5-8d51-0c0227867b9d');
    
    this.load(this.ready);
 };

 /**
 * Loaded?
 *
 * @api private
 * @return {boolean}
 */

SnapchatPixel.prototype.loaded = function() {
    return !!window.snaptr;
};

/**
 * Identify
 * 
 * @param {Identify} identify
 */

SnapchatPixel.prototype.identify = function(identify) {
    var email = identify.email();
    snaptr('init', '1d6d782e-82dc-4df5-8d51-0c0227867b9d', { user_email: email });
};

/**
 * Track a page view
 * 
 * @param {Page} page
 */
SnapchatPixel.prototype.page = function(page) {
    window.snaptr('track', 'PAGE_VIEW', {'description': page.title()});
};

/**
 * Track a product view event
 * 
 * @param {Track} track
 */
SnapchatPixel.prototype.productViewed = function(track) {
    window.snaptr('track', 'VIEW_CONTENT', {
        'item_category': track.category() || '',
        'item_ids': [track.productId()]
    });
};

/**
 * Track a product added to cart event
 * 
 * @param {Track} track
 */
SnapchatPixel.prototype.productAdded = function(track) {
    window.snaptr('track', 'ADD_CART', {
        'item_ids': [track.productId()],
        'number_items': track.quantity() || 1
    });
};

/**
 * Track a purchase event
 * 
 * @param {Track} track
 */
SnapchatPixel.prototype.orderCompleted = function(track) {
    var currency = track.currency() || '';
    var total = track.total() || track.revenue() || 0;
    var transactionId = track.orderId() || '';

    window.snaptr('track', 'PURCHASE', {
        'currency': currency,
        'price': total,
        'transaction_id': transactionId,
        'item_ids': track.products().map(function(product) { return product.product_id; })
    });
};

/**
 * Track a product added to wishlist event
 * 
 * @param {Track} track
 */
SnapchatPixel.prototype.productAddedToWishlist = function(track) {
    window.snaptr('track', 'ADD_TO_WISHLIST', {
        'price': track.price() || 0,
        'item_category': track.category() || '',
        'item_ids': track.productId() ? [track.productId()] : []
    });
};

/**
 * Track start checkout event
 * 
 * @param {Track} track
 */
SnapchatPixel.prototype.checkoutStarted = function(track) {
    var transactionId = track.orderId();
    var currency = track.currency() || '';
    var total = track.value() || track.revenue() || 0;

    window.snaptr('track', 'START_CHECKOUT', {
        'transaction_id': transactionId,
        'currency': currency,
        'price': total,
        'item_ids': track.products().map(function(product) { return product.product_id; })
    });
};

/**
 * Track add billing event
 * 
 * @param {Track} track
 */
SnapchatPixel.prototype.paymentInfoEntered = function(track) {
    var transactionId = track.orderId() || track.checkoutId() || '';

    window.snaptr('track', 'ADD_BILLING', {
        'transaction_id': transactionId
    });
};

/**
 * Track product searches
 * 
 * @param {Track} track
 */
SnapchatPixel.prototype.productsSearched = function(track) {
    var query = track.properties().query || '';
    var products = track.properties().products.split(',') || [];

    window.snaptr('track', 'SEARCH', {
        'search_string': query,
        'item_ids': products
    });
};

/**
 * Track an ad view
 * 
 * @param {Track} track
 */
SnapchatPixel.prototype.promotionViewed = function(track) {
    var promotionId = track.promotionId() || '';

    window.snaptr('track', 'AD_VIEW', {
        'description': promotionId
    });
};

/**
 * Track an ad click
 * 
 * @param {Track} track
 */
SnapchatPixel.prototype.promotionClicked = function(track) {
    var promotionId = track.promotionId() || '';

    window.snaptr('track', 'AD_CLICK', {
        'description': promotionId
    });
};

/**
 * Track product shares (via a social network, email, etc.)
 * 
 * @param {Track} track
 */
SnapchatPixel.prototype.productShared = function(track) {
    window.snaptr('track', 'SHARE', {
        'item_ids': [track.productId()],
        'item_category': track.category() || ''
    });
};

/**
 * Track list views
 * 
 * @param {Track} track
 */
SnapchatPixel.prototype.productListViewed = function(track) {
    window.snaptr('track', 'LIST_VIEW', {
        'item_ids': track.products().map(function(product) { return product.product_id; })
    });
};