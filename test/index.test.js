'use strict';

var assert = require('assert');
var Analytics = require('@astronomerio/analytics.js-core').constructor;
var integration = require('@astronomerio/analytics.js-integration');
var sandbox = require('@segment/clear-env');
var tester = require('@segment/analytics.js-integration-tester');
var SnapchatPixel = require('../lib/');

describe('SnapchatPixel', function() {
  var analytics;
  var snapchatPixel;
  var options = {
    pixelId: 'x'
  };

  beforeEach(function() {
    analytics = new Analytics();
    snapchatPixel = new SnapchatPixel(options);
    analytics.use(SnapchatPixel);
    analytics.use(tester);
    analytics.add(snapchatPixel);
  });

  afterEach(function() {
    analytics.restore();
    analytics.reset();
    snapchatPixel.reset();
    sandbox();
  });

  it('should have the right settings', function() {
    analytics.compare(SnapchatPixel, integration('Snapchat Pixel')
      .option('pixelId', ''));
  });

  describe('after loading', function() {
    beforeEach(function(done) {
      analytics.once('ready', done);
      analytics.initialize();
      analytics.spy(window, 'snaptr');
    });

    describe('#identify', function () {
      it('should set an email for the user', function(done) {
        var email = 'dev@metarouter.io';
        analytics.identify({'email': email});
        setTimeout(function() {
          try {
            assert.equal(window.snaptr.u_em, email);
            done();
          } catch(err) {
            done(err);
          }
        }, 2000);
      });
    });

    describe('#pageView', function () {
      it('should call window.snaptr', function () {
        var page = {
          "title": "MetaRouter",
          "url": "http://dev-mr.bluecode.co"
        };
        analytics.page(page);
        analytics.called(window.snaptr, 'track', 'PAGE_VIEW', {'description': page.title})
      });
    });

    describe('#productViewed', function () {
        it('should call window.snaptr', function () {
          var track = {
            "product_id": "507f1f77bcf86cd799439011",
            "category": "Games"
          };
          analytics.track('Product Viewed', track);
          analytics.called(window.snaptr, 'track', 'VIEW_CONTENT', {
            'item_category': track.category,
            'item_ids': [track.product_id]
          });
        });

        it('should not fire the Snap Pixel tag', function() {
          analytics.track('Product Clicked', {});
          analytics.didNotCall(window.snaptr);
        });
    });

    describe('#productAdded', function() {
      it('should call window.snaptr', function () {
        var track = {
          "product_id": "507f1f77bcf86cd799439011",
          "quantity": 1
        };
        analytics.track('Product Added', track);
        analytics.called(window.snaptr, 'track', 'ADD_CART', {'number_items': track.quantity, 'item_ids': [track.product_id]});
      });
    });

    describe('#orderCompleted', function() {
      it('should call window.snaptr', function () {
        var track = {
          "order_id": "50314b8e9bcf000000000000",
          "total": 27.5,
          "currency": "USD",
          "products": [
            {
              "product_id": "507f1f77bcf86cd799439011",
              "sku": "45790-32",
              "name": "Monopoly: 3rd Edition",
              "price": 19,
              "quantity": 1,
              "category": "Games",
              "url": "https://www.example.com/product/path",
              "image_url": "https:///www.example.com/product/path.jpg"
            },
            {
              "product_id": "505bd76785ebb509fc183733",
              "sku": "46493-32",
              "name": "Uno Card Game",
              "price": 3,
              "quantity": 2,
              "category": "Games"
            }
          ]
        };
        analytics.track('Order Completed', track);
        analytics.called(window.snaptr, 'track', 'PURCHASE', {
          'currency': track.currency,
          'price': track.total,
          'transaction_id': track.order_id,
          'item_ids': track.products.map(function(product) { return product.product_id; })
      })
      });
    });

    describe('#productAddedToWishlist', function() {
      it('should call window.snaptr', function() {
        var track = {
          "product_id": "507f1f77bcf86cd799439011",
          "category": "Games",
          "price": 18.99
        };
        analytics.track('Product Added to Wishlist', track);
        analytics.called(window.snaptr, 'track', 'ADD_TO_WISHLIST', {
          'price': track.price,
          'item_category': track.category,
          'item_ids': [track.product_id]
        });
      });
    });

    describe('#checkoutStarted', function() {
      it('should call window.snaptr', function() {
        var track = {
          "order_id": "50314b8e9bcf000000000000",
          "value": 30,
          "revenue": 25,
          "currency": "USD",
          "products": [
            {
              "product_id": "507f1f77bcf86cd799439011",
              "sku": "45790-32",
              "name": "Monopoly: 3rd Edition",
              "price": 19,
              "quantity": 1,
              "category": "Games",
              "url": "https://www.example.com/product/path",
              "image_url": "https://www.example.com/product/path.jpg"
            },
            {
              "product_id": "505bd76785ebb509fc183733",
              "sku": "46493-32",
              "name": "Uno Card Game",
              "price": 3,
              "quantity": 2,
              "category": "Games"
            }
          ]
        };
        analytics.track('Checkout Started', track);
        analytics.called(window.snaptr, 'track', 'START_CHECKOUT', {
          'transaction_id': track.order_id,
          'currency': track.currency,
          'price': track.value,
          'item_ids': track.products.map(function(product) { return product.product_id; })
        });
      });
    });

    describe('#paymentInfoEntered', function() {
      it('should call window.snaptr', function() {
        var track = {
          "order_id": "dkfsjidfjsdifsdfksdjfkdsfjsdfkdsf"
        };
        analytics.track('Payment Info Entered', track);
        analytics.called(window.snaptr, 'track', 'ADD_BILLING', {
          'transaction_id': track.order_id
        });
      });
    });
    
    describe('#productsSearched', function() {
      it('should call window.snaptr', function() {
        var track = {
          "query": "blue hotpants",
          "products": "304602853,207080602,203195547"
        };
        analytics.track('Products Searched', track);
        analytics.called(window.snaptr, 'track', 'SEARCH', {
          'search_string': track.query,
          'item_ids': track.products.split(',')
        });
      });
    });

    describe('#promotionViewed', function() {
      it('should call window.snaptr', function() {
        var track = {
          "promotion_id": "promo_1"
        };
        analytics.track('Promotion Viewed', track);
        analytics.called(window.snaptr, 'track', 'AD_VIEW', {
          'description': track.promotion_id
        });
      });
    });

    describe('#promotionClicked', function() {
      it('should call window.snaptr', function() {
        var track = {
          "promotion_id": "promo_1",
          "creative": "top_banner_2",
          "name": "75% store-wide shoe sale",
          "position": "home_banner_top"
        };
        analytics.track('Promotion Clicked', track);
        analytics.called(window.snaptr, 'track', 'AD_CLICK', {
          'description': track.promotion_id
        });
      });
    });

    describe('#productShared', function() {
      it('should call window.snaptr', function() {
        var track = {
          "product_id": "507f1f77bcf86cd799439011",
          "category": "Games"
        };
        analytics.track('Product Shared', track);
        analytics.called(window.snaptr, 'track', 'SHARE', {
          'item_ids': [track.product_id],
          'item_category': track.category
        });
      });
    });

    describe('#productListViewed', function(){
      it('should call window.snaptr', function() {
        var track = {
          "list_id": "hot_deals_1",
          "category": "Deals",
          "products": [
            {
              "product_id": "507f1f77bcf86cd799439011",
              "sku": "45790-32",
              "name": "Monopoly: 3rd Edition",
              "price": 19,
              "position": 1,
              "category": "Games",
              "url": "https://www.example.com/product/path",
              "image_url": "https://www.example.com/product/path.jpg"
            },
            {
              "product_id": "505bd76785ebb509fc183733",
              "sku": "46493-32",
              "name": "Uno Card Game",
              "price": 3,
              "position": 2,
              "category": "Games"
            }
          ]
        };
        analytics.track('Product List Viewed', track);
        analytics.called(window.snaptr, 'track', 'LIST_VIEW', {
          'item_ids': track.products.map(function(product) { return product.product_id; })
        });
      });
    });
  });
});