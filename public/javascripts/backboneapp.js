window.BackboneApp = {
    routers: {},
    views: {},
    models: {},
    collections: {}
}

BackboneApp.views.GraphView = Backbone.View.extend({
    el: "#chart",
    initialize: function(){
        that = this;
        this.keywords = ["kids", "cowdefence"];
        this.colors = ["#ff7f0e", "#2ca02c"];
        $.get("/rank/com.divmob.cowdefence", function(data){
            that.package_ranks = data;
            that.render();
        });
    },

    render: function(){
        //$(this.el).html(this.package_ranks);
        console.log(this.package_ranks);
        console.log(this.getGraphValues());
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
          console.log(values);
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

          nv.utils.windowResize(function() { d3.select('#chart svg').call(chart) });

          return chart;
        });
    }

});
