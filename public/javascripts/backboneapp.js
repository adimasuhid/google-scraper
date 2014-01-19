window.BackboneApp = {
    routers: {},
    views: {},
    models: {},
    collections: {}
}

BackboneApp.routers.Router = Backbone.Router.extend({
    initialize: function(){
        this.current_view = null;
    },

    routes: {
        "" : "defaultRoute",
        "package/:package_name": "showGraph"
    },

    defaultRoute: function(){
        this.removeBinding();
        this.current_view = new BackboneApp.views.DefaultView();
        this.current_view.render();
    },

    showGraph: function(package_name){
        this.removeBinding();
        var that = this
        $.get("/packages/"+package_name, function(data){
            if(_.isEmpty(data)){
                that.navigate("", {trigger: true});
            } else {
                var right_package = _.first(data);
                that.current_view = new BackboneApp.views.GraphView({
                    package_name: right_package.package_name,
                    keywords: right_package.keywords
                });
            }
        });
    },

    removeBinding: function(){
        if (!(this.current_view === null)){
            this.current_view.undelegateEvents();
        }
    }
});

BackboneApp.views.DefaultView = Backbone.View.extend({
    template: JST["defaultView"],
    el: "#chart",
    render: function(){
        $(this.el).html(this.template());
    }
});

BackboneApp.views.GraphView = Backbone.View.extend({
    el: "#chart",
    initialize: function(options){
        that = this;
        this.package_name = options.package_name;
        this.keywords = options.keywords;
        this.colors = ["#ff7f0e", "#2ca02c", "#4fa8af", "#4fa8af", "#9f9600", "#a9babb", "#b3da2e", "#43eed2", "#18521e", "#f4aead"];
        $.get("/rank/"+that.package_name, function(data){
            that.package_ranks = data;
            that.render();
        });
    },

    render: function(){
        this.renderGraph()

        return this
    },

    sortByKeyword: function(keyword, collection) {
        return _.filter(collection, function(package_rank) {
            return package_rank["keyword"] == keyword;
        });
    },

    getKeywordRank: function(collection, color) {
        var keyword = _.first(collection)["keyword"];
        var values = _.map(collection, function(package_rank){
            return { x: new Date(package_rank["rank_date"]).getTime(), y: package_rank["rank"] };
        });

        return {
            values: values,
            key: keyword,
            color: color
        }

    },

    getGraphValues: function(){
        var count = 0;
        var graph_values = [];

        _.each(this.keywords, function(word){
            var sorted_packages = that.sortByKeyword(word, that.package_ranks);
            var value = that.getKeywordRank(sorted_packages, that.colors[count]);
            graph_values.push(value);
            count = count+1;
        });

        return graph_values;
    },

    renderGraph: function(){
        nv.addGraph(function() {
          var values = that.getGraphValues();
          var chart = nv.models.lineChart()
            .yDomain([50,1]);

          chart.xAxis
              .axisLabel('Date')
              .tickFormat(function(d) { return d3.time.format('%b %d')(new Date(d)); });

          chart.yAxis
              .axisLabel('Ranking')
              .tickFormat(d3.format(',r'));

          d3.select('#chart svg')
              .datum(values)
              .transition().duration(500)
              .call(chart);

          d3.select('#chart svg')
              .append("text")
              .attr("x", 500)
              .attr("y", 20)
              .attr("text-anchor", "middle")
              .text(that.package_name + " by keywords");

          nv.utils.windowResize(function() { d3.select('#chart svg').call(chart) });

          return chart;
        });
    }

});
