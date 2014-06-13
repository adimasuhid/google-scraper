var http = require("http");
var express = require('express');
var app = express();
var server = http.createServer(app);
var open = require('open-uri');
var cheerio = require('cheerio');
var _ = require('underscore');
var moment = require('moment');
var models = require('./db/models');
var mongoose = require('mongoose');
var gather = require('./lib/gather');

var uristring = process.env.MONGOLAB_URI || 'mongodb://localhost/google-scraper';

var query = "kids"
var url = "https://play.google.com/store/search?q="+query+"&c=apps"

var port = process.env.PORT || 3000;
//Set view
app.set('views', __dirname + '/tpl');
app.set('view engine', "jade");
app.engine('jade', require('jade').__express);
app.use(express.static(__dirname + '/public'));
app.use(express.bodyParser());

//refactor this to a different file, but make it work first

function parseGoogle(err, data) {
    var ranking = [];
    var count = 1;

    $ = cheerio.load(data);
    console.log($(".card").length)
    $(".card").each(function(){
        var package_name = $(this).attr("data-docid");
        ranking.push(createPackageRank(err, package_name, count));
        count = count + 1;
    });

    return ranking;
}

function createPackageRank(err, package_name, count) {
    return {
        rank: count,
        package_name: package_name
    }
}

function getPackageRank(err, package_name, collection){
    return _.find(collection, function(package_rank){
        return package_rank["package_name"] == package_name;
    });
}

function saveRank(err, package_rank, keyword){
    var value = models.PackageRank.create({
        package_name: package_rank["package_name"],
        keyword: keyword,
        rank: package_rank["rank"],
        rank_date: moment()
    }, function(err){
        if(err) {
            console.log("Failed to save due to: " + err);
        }
    });

    console.log("saving rank..");

    return value;
}

function savePackage(package){
    var value = true
    models.Package.create({
        package_name: package["package_name"],
        keywords: package["keywords"],
    }, function(err){
        if(err) {
            value = false
            console.log("Failed to save due to: " + err);
        }
    });

    console.log("saving "+ package.package_name +"package..");

    return value;
}

function updatePackage(package){
    var value = true
    console.log(package);
    models.Package.update({_id: package["id"]}, {
        package_name: package["package_name"],
        keywords: package["keywords"],
    }, function(err){
        if(err) {
            value = false
            console.log("Failed to save due to: " + err);
        }
    });

    console.log("updating "+ package.package_name +"package..");

    return value;
}

function deletePackage(id){
    var value = true
    models.Package.remove({
        _id:  id
    }, function(err){
        if(err) {
            console.log("Failed to save due to: " + err);
            value = false;
        }
    });

    console.log("deleting package "+ id + "...");

    return value;
}

function connectToMongo(callback){
    mongoose.connect(uristring, function(err, res){
        if (err) {
            console.log('Error connecting to: ' + uristring + '. ' + err);
        } else {
            console.log('Succeeded connected to: ' + uristring);
        }
    });
    mongoose.connection.on('open', function(){
        callback();
    });
}

connectToMongo(function(){

    console.log('Connected to Mongo');
    server.listen(port, function(){
      console.log('Express server listening on port ' + port);
    });

});

//render first page
app.get("/", function(req, res){
    res.render("index");
});

//get package rank
app.get("/rank/:package_name", function(req, res){
    var package_name = req.params.package_name;
    models.PackageRank.find({package_name: package_name}).exec(function(err,data){
        res.json(data);
    });
});

//get package
app.get("/packages/:package_name", function(req,res){
    models.Package.find().exec(function(err, packages){
        var package_name = req.params.package_name;
        var the_package = _.filter(packages, function(package){
            return package.package_name === package_name;
        });
        res.json(the_package);
    });
});

//get all packages
app.get("/packages", function(req, res){
    models.Package.find().sort({ _id: 'desc'}).exec(function(err,data){
        res.json(data);
    });
});

//save packages
app.post("/packages", function(req, res){
    res.json(savePackage(req.body));
});

//delete packages
app.post("/packages/delete", function(req, res){
    res.json(deletePackage(req.body.id));
});
//update packages
app.post("/packages/update", function(req, res){
    res.json(updatePackage(req.body));
});

app.post("/gather", function(req, res){
    gather();
    res.json(true);
});

//save packages
app.get("/:package_name/:keyword", function(req, res){
    var package_name = encodeURIComponent(req.params.package_name);
    var keyword = encodeURIComponent(req.params.keyword);

    console.log("loading rankings for "+package_name + " with " + keyword);
    var url = "https://play.google.com/store/search?q="+keyword+"&c=apps";
    console.log(url);
    var ranks = [];
    open(url, function(err, google) {
        ranks = parseGoogle(err, google);
        console.log(google);
        var rank = getPackageRank(err, package_name, ranks);
        console.log(rank);
        if (typeof rank === "undefined"){
            rank = { package_name: package_name, rank: null}
        }
        var value = saveRank(err, rank, decodeURIComponent(keyword));
        console.log(value);
        res.render("page", {package_rank: rank});
    });
    //res.render("page", {package_rank: "lalalal"})
});


