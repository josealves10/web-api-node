let mongoose = require('mongoose');

let accessSchema = mongoose.Schema({
  city: {
    type: String,
    required: true
  },
  accessDate: {
  	type: String,
  	required: true
  }
});


let Access = module.exports = mongoose.model('Access', accessSchema);


module.exports.createAccess = (newAccess, callback) => {
  newAccess.save(callback);
}

module.exports.getAllAccess = (callback) => {
  Access.count({}, callback);
}

module.exports.getAccess = (callback) => {
	Access.find({}, callback);
}

module.exports.getMostCityRequested = (callback) => {
  Access.aggregate([{$match:{}}, {$unwind: "$city"}, {$group: {_id: '$city', count:{$sum:1}}}, {$sort: {count: -1}}], callback);
}

module.exports.getAccessOfToday = (date, callback) => {
	Access.find({accessDate: date}, callback);
}

