//probably move this to a class
var _ = require('underscore');
var models = require('../db/models');
var mongoose = require('mongoose');
var open = require('open-uri');
var cheerio = require('cheerio');
var uristring = process.env.MONGOLAB_URI || 'mongodb://localhost/google-scraper';

//needs some hardcore refactoring
function openStuff(err){
    port = process.env.port || 3000
    host = "http://localhost:"+ port
    if(err) console.log(err)
    getPackages(function(packages){
        _.each(packages, function(package_rank){
            goThroughKeywords(err,package_rank.package_name, package_rank.keywords);
        });
    });
}

function getPackages(callback){
    open(host+"/packages", function(err, packages){
        if(err) console.log(err)
        callback(packages);
    });
}

function goThroughKeywords(err,name, keywords){
    _.each(keywords, function(keyword){
        url = host + "/" + name + "/" + encodeURIComponent(keyword)
        triggerOpen(err, url, name, keyword);
    });
}

function triggerOpen(err,url,name, keyword){
    open(url, function(err){
        if(err) console.log(err);
        console.log("opening "+name+" on "+keyword+"...");
    });
}

module.exports = openStuff;
