var http = require("http");
var express = require('express');
var app = express();
var server = http.createServer(app);
var open = require('open-uri');
var cheerio = require('cheerio');
var _ = require('underscore');

var query = "kids"
var url = "https://play.google.com/store/search?q="+query+"&c=apps"

var port = process.env.PORT || 3000;
//Set view
app.set('views', __dirname + '/tpl');
app.set('view engine', "jade");
app.engine('jade', require('jade').__express);
app.use(express.static(__dirname + '/public'));

server.listen(port);


function parseGoogle(err, data) {
    var ranking = [];
    var count = 1;

    $ = cheerio.load(data);
    $(".card-content-link").each(function(){
        var package_name = $(this).attr("href").split("=")[1];
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

app.get("/:package_name/:keyword", function(req, res){
    var package_name = encodeURIComponent(req.params.package_name);
    var keyword = encodeURIComponent(req.params.keyword);

    console.log("loading rankings for "+package_name + " with " + keyword);
    var url = "https://play.google.com/store/search?q="+keyword+"&c=apps";
    console.log(url);
    var ranks = [];
    //open(url, function(err, google) {
        //ranks = parseGoogle(err, google);
        //var rank = getPackageRank(err, package_name, ranks);
        //console.log(rank);

        //res.render("page", {package_rank: rank});
    //});
    res.render("page")
});


