window.onload = function(){

    function sinAndCos() {
      var sin = [],
          cos = [];

      for (var i = 0; i < 100; i++) {
        sin.push({x: i, y: Math.sin(i/10)});
        cos.push({x: i, y: .5 * Math.cos(i/10)});
      }

      return [
        {
          values: sin,
          key: 'Sine Wave',
          color: '#ff7f0e'
        },
        {
          values: cos,
          key: 'Cosine Wave',
          color: '#2ca02c'
        }
      ];
    }

   nv.addGraph(function() {
     var chart = nv.models.lineChart();

     chart.xAxis
         .axisLabel('Date')
         .tickFormat(d3.format(',r'));

     chart.yAxis
         .axisLabel('Ranking')
         .tickFormat(d3.format(',r'));

     d3.select('#chart svg')
         .datum(sinAndCos())
       .transition().duration(500)
         .call(chart);

     nv.utils.windowResize(function() { d3.select('#chart svg').call(chart) });

     return chart;
   });

}
