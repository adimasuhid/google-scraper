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
        "package/:package_name": "showGraph",
        "packages" : "addPackages"
    },

    defaultRoute: function(){
        this.removeBinding();
        $.get("/packages", function(data){
            this.current_view = new BackboneApp.views.DefaultView({packages: data});
            this.current_view.render();
        });
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

    addPackages: function(){
        var that = this
        this.removeBinding();
        $.get("/packages", function(data){
            that.current_view = new BackboneApp.views.AddPackageView({
                packages: data
            });
            that.current_view.render();
        });
    },

    removeBinding: function(){
        if (!(this.current_view === null)){
            this.current_view.undelegateEvents();
            $(this.current_view.el).html();
        }
    }
});

BackboneApp.views.DefaultView = Backbone.View.extend({
    initialize: function(options){
        that = this;
        this.packages = options.packages
    },

    events: {
        "click .package": "goToGraph",
        "click .add-package": "goToAdd",
        "click .force-load": "forceLoad"
    },

    template: JST["defaultView"],
    el: "#chart",
    render: function(){
        $(this.el).html(this.template({ packages: this.packages }));
    },

    goToGraph: function(e){
        var package_name = $(e.target).attr("data-package");
        window.router.navigate("package/"+package_name, {trigger: true});
    },

    goToAdd: function(){
        window.router.navigate("packages", {trigger: true});
    },

    forceLoad: function(){
        $.post("/gather", function(data){
            $(that.el).prepend("<h4>Force Loading data. Check graphs after some minutes.</h4>");
        });
    },
});

BackboneApp.views.AddPackageView = Backbone.View.extend({
    events: {
        "click .apps-index" : "goToIndex",
        "click .remove-package" : "removePackage",
        "click .add-package" : "addPackage",
        "click .edit-package" : "editPackage",
        "click .save-package" : "savePackage"
    },
    template: JST["allPackagesView"],
    header_template: JST["addPackageHeaderView"],
    add_template: JST["addPackageView"],
    save_button: JST["savePackageButton"],

    el: "#chart",
    initialize: function(options){
        that = this;
        this.packages = options.packages;
        this.current_id = null;
    },

    render: function(){
        $(this.el).html(this.header_template());
        $(this.el).append(this.add_template());
        $(this.el).append(this.template({packages: this.packages}));
    },

    goToIndex: function(){
        window.router.navigate("", {trigger: true});
    },

    removePackage: function(e){
        var id = $(e.target).attr("id")
        $.post("/packages/delete", {id: id}, function(){
            Backbone.history.loadUrl( Backbone.history.fragment )
        });
    },

    editPackage: function(e){
        var id = $(e.target).attr("id")
        this.current_id = $(e.target).attr("data-id");
        $.get("/packages/"+id, function(data){
            data = _.first(data);
            $("#package-name").val(data.package_name);
            $("#package-keywords").val(data.keywords.join());
            $("#add-package-form button").html("Save Package");
            $("#add-package-form button").addClass("save-package");
            $("#add-package-form button").removeClass("add-package");
        });
    },

    savePackage: function(){
        var package_name = $("#package-name").val();
        var keywords = $("#package-keywords").val().split(",");
        $.post("packages/update",{
            id: that.current_id,
            package_name: package_name,
            keywords: keywords
        }, function(){
            Backbone.history.loadUrl( Backbone.history.fragment )
        });
    },

    addPackage: function(){
        var package_name = $("#package-name").val();
        var keywords = $("#package-keywords").val().split(",");

        $.post("packages", {
            package_name: package_name,
            keywords: _.map(keywords, function(keyword){return keyword.trim()})
        }, function(){
            Backbone.history.loadUrl( Backbone.history.fragment )
        });
    }
});

BackboneApp.views.GraphView = Backbone.View.extend({
    template: JST["graphView"],
    no_data_template: JST["noDataView"],
    el: "#chart",
    events: {
        "click button": "goToIndex"
    },
    initialize: function(options){
        that = this;
        this.package_name = options.package_name;
        this.keywords = options.keywords;
        this.colors = ["#ff7f0e", "#2ca02c", "#4fa8af", "#4fa8af", "#9f9600", "#a9babb", "#b3da2e", "#43eed2", "#18521e", "#f4aead"];
        $.get("/rank/"+that.package_name, function(data){
            that.package_ranks = data;
            if(_.isEmpty(that.package_ranks)){
                that.renderBlank();
            } else {
                that.render();
            }
        });
    },

    render: function(){
        $(this.el).html(this.template({name: this.package_name}));
        this.renderGraph()

        return this;
    },

    renderBlank: function(){
        $(this.el).html(this.no_data_template());

        return this;
    },

    goToIndex: function(){
        window.router.navigate("", {trigger: true});
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

          nv.utils.windowResize(function() { d3.select('#chart svg').call(chart) });

          return chart;
        });
    }

});
