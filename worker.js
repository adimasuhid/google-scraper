//probably move this to a class
var _ = require('underscore');
var models = require('./db/models');
var mongoose = require('mongoose');
var open = require('open-uri');
var cheerio = require('cheerio');
var uristring = process.env.MONGOLAB_URI || 'mongodb://localhost/google-scraper';

//needs some hardcore refactoring
function openStuff(){
    port = process.env.port || 3000
    host = "http://google-scraper.herokuapp.com:"+ port
    url1 = host +"/com.divmob.cowdefence/kids"
    url2 = host + "/com.divmob.cowdefence/cowdefence"
    open(url1, function(){
        console.log("saved kids");
    });

    open(url2, function(){
        console.log("cowdefence");
    });
}

openStuff();
//function createPackageRank(err, package_name, count) {
    //return {
        //rank: count,
        //package_name: package_name
    //}
//}

//function parseGoogle(err, data) {
    //var ranking = [];
    //var count = 1;

    //$ = cheerio.load(data);
    //$(".card-content-link").each(function(){
        //var package_name = $(this).attr("href").split("=")[1];
        //ranking.push(createPackageRank(err, package_name, count));
        //count = count + 1;
    //});

    //return ranking;
//}

//function getPackageRank(err, package_name, collection){
    //return _.find(collection, function(package_rank){
        //return package_rank["package_name"] == package_name;
    //});
//}

//function saveRank(err, package_rank, keyword){
    //var value = models.PackageRank.create({
        //package_name: package_rank["package_name"],
        //keyword: keyword,
        //rank: package_rank["rank"],
        //rank_date: moment()
    //}, function(err){
        //if(err) {
            //console.log("Failed to save due to: " + err);
        //}
    //});

    //console.log("saving rank..");

    //return value;
//}

//function savePackage(keyword, package_name){
    //var url = "https://play.google.com/store/search?q="+keyword+"&c=apps";
    //var ranks = [];
    //open(url, function(err, google) {
        //ranks = parseGoogle(err, google);
        //console.log(ranks);
        //var rank = getPackageRank(err, package_name, ranks);
        //console.log(rank);
        //var value = saveRank(err, rank, keyword);
    //});
//}

//function populateMongo(){
    ////move to a config file
    //var package_name = "com.divmob.cowdefence";
    //var keywords = ["kids", "cowdefence"];

    //_.each(keywords, function(keyword){
        //console.log("loading rankings for "+package_name + " with " + keyword);
        //savePackage(keyword, package_name);
    //});
//}

//function connectToMongo(callback){
    //mongoose.connect(uristring, function(err, res){
        //if (err) {
            //console.log('Error connecting to: ' + uristring + '. ' + err);
        //} else {
            //console.log('Succeeded connected to: ' + uristring);
        //}
    //});
    //mongoose.connection.on('open', function(){
        //callback();
    //});
//}

//connectToMongo(populateMongo);
