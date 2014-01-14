var mongoose = require('mongoose');

module.exports = new mongoose.Schema({
    package_name: String,
    keyword: String,
    rank: Number,
    rank_date: Date
});

