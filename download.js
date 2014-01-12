var http = require("http");
var express = require('express');
var app = express();
var server = http.createServer(app);
var open = require('open-uri');
var cheerio = require('cheerio');

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
    $ = cheerio.load(data);
    $(".card-content-link").each(function(){
        var data = $(this).attr("href").split("=")[1];
        ranking.push(data);
    });

    return ranking;
}

app.get("/:id", function(req, res){
    var keyword = encodeURIComponent(req.params.id);

    console.log("loading rankings for "+keyword);
    var url = "https://play.google.com/store/search?q="+keyword+"&c=apps";
    console.log(url);
    var ranks = [];
    open(url, function(err, google) {
        ranks = parseGoogle(err, google)
        res.render("page", {ranking: ranks});
    });
});


