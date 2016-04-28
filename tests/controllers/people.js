var controller = require('../../controllers/people'),
    places = require('../../controllers/places'),
    db = require('../../db'),
    utils = require('../utils'),
    sinon = require('sinon');

var example;

exports.tearDown = function (callback) {
  utils.restore(
    db.medic.get,
    db.medic.insert,
    controller.getPerson,
    controller.createPerson,
    controller.validatePerson,
    places.getOrCreatePlace
  );
  callback();
};

exports.setUp = function(callback) {
  example = {
    name: 'Henrique'
  };
  callback();
};

exports['validatePerson returns error on string argument.'] = function(test) {
  controller.validatePerson('x', function(err) {
    test.equal(err.code, 400);
    test.equal(err.message, 'Person must be an object.');
    test.done();
  });
};

exports['validatePerson returns error on wrong doc type.'] = function(test) {
  controller.validatePerson({type: 'shoe'}, function(err) {
    test.equal(err.code, 400);
    test.equal(err.message, 'Wrong type, this is not a person.');
    test.done();
  });
};

exports['validatePerson returns error if missing name property.'] = function(test) {
  controller.validatePerson({type: 'person'}, function(err) {
    test.equal(err.code, 400);
    test.equal(err.message, 'Person is missing a "name" property.');
    test.done();
  });
};

exports['validatePerson returns error if name is an integer.'] = function(test) {
  controller.validatePerson({type: 'person', name: 1}, function(err) {
    test.equal(err.code, 400);
    test.equal(err.message, 'Property "name" must be a string.');
    test.done();
  });
};

exports['validatePerson returns error if name is an object.'] = function(test) {
  controller.validatePerson({type: 'person', name: {}}, function(err) {
    test.equal(err.code, 400);
    test.equal(err.message, 'Property "name" must be a string.');
    test.done();
  });
};

exports['getPerson returns custom message on 404 errors.'] = function(test) {
  sinon.stub(db.medic, 'get').callsArgWith(1, {statusCode: 404});
  controller.getPerson('x', function(err) {
    test.equal(err.message, 'Failed to find person.');
    test.done();
  });
};

exports['getPerson returns not found message if doc is wrong type.'] = function(test) {
  sinon.stub(db.medic, 'get').callsArgWith(1, null, {type: 'clinic'});
  controller.getPerson('x', function(err) {
    test.equal(err.message, 'Failed to find person.');
    test.done();
  });
};

exports['getPerson succeeds and returns doc when person type.'] = function(test) {
  sinon.stub(db.medic, 'get').callsArgWith(1, null, {type: 'person'});
  controller.getPerson('x', function(err, doc) {
    test.equal(err, void 0);
    test.deepEqual(doc, { type: 'person' });
    test.done();
  });
};

exports['createPerson sets contact type before validating'] = function(test) {
  sinon.stub(controller, 'validatePerson', function(data) {
    test.equal(data.type, 'person');
    test.equal(data.name, 'Kobe');
    test.done();
  });
  controller.createPerson({ type: 'shoe', name: 'Kobe' });
};

exports['createPerson returns error from db insert'] = function(test) {
  sinon.stub(controller, 'validatePerson').callsArg(1);
  sinon.stub(places, 'getOrCreatePlace').callsArg(1);
  sinon.stub(db.medic, 'insert').callsArgWith(1, 'yucky');
  controller.createPerson({}, function(err) {
    test.ok(err);
    test.done();
  });
};

