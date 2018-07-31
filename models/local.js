let mongoose = require('mongoose');

//Locals Schema
let localSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  latitude: {
    type: String,
    required: true
  },
  longitude: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  contact: {
    type: String,
    required: true
  },
  imageURL: {
    type: String,
    required: true
  },
  website: {
    type: String,
    required: true
  },
  cost_for_two: {
    type: String,
    required: true
  }
});


let Local = module.exports = mongoose.model('Local', localSchema);

module.exports.getAllLocals = (callback) => {
    Local.find({}, callback);
}

module.exports.getLocalById = (identification, callback) => {
  Local.findOne({_id: identification}, callback);
}

module.exports.getLocalsByCity = (city, callback) => {
  Local.find({city: city}, callback);
}

module.exports.addLocal = (localToAdd, callback) => {
  localToAdd.save(callback);
}

module.exports.removeLocal = (id, callback) => {
  Local.deleteOne({_id: id}, callback);
}

module.exports.getLocalCount = (callback) => {
  Local.count({}, callback);
}

module.exports.getMostCityLocal = (callback) => {
  Local.aggregate([{$match:{}}, {$unwind: "$city"}, {$group: {_id: '$city', count:{$sum:1}}}, {$sort: {count: -1}}], callback);
}
