'use strict';

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
    });

    describe('#productViewed', function () {
        beforeEach(function() {
          analytics.spy(window, 'snaptr');
        });
        
        it('should not fire the Snap Pixel tag', function() {
          analytics.track('Coupon Applied', {});
          analytics.didNotCall(window.snaptr);
        });

        it('should call window.snaptr', function () {
            analytics.track('Product Viewed', {
              "product_id": "507f1f77bcf86cd799439011",
              "sku": "G-32",
              "category": "Games",
              "name": "Monopoly: 3rd Edition",
              "brand": "Hasbro",
              "variant": "200 pieces",
              "price": 18.99,
              "quantity": 1,
              "coupon": "MAYDEALS",
              "currency": "usd",
              "position": 3,
              "value": 18.99,
              "url": "https://www.example.com/product/path",
              "image_url": "https://www.example.com/product/path.jpg"
            });
            analytics.called(window.snaptr);
        });
    });
  });
});