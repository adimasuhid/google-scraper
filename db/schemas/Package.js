var mongoose = require('mongoose');

module.exports = new mongoose.Schema({
    package_name: String,
    keywords: [String]
});
