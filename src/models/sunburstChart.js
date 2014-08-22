nv.models.sunburstChart = function() {"use strict";
   //============================================================
   // Public Variables with Default Settings
   //------------------------------------------------------------

   var margin = {
      top: 10,
      right: 10,
      bottom: 10,
      left: 10
   }, width = null, height = null, color = null, dispatch = d3.dispatch('elementClick', 'stateChange', 'changeState');

   //============================================================

   //============================================================
   // Private Variables
   //------------------------------------------------------------
   var zoomingOffset = null;

   //============================================================

   function chart(selection) {
      selection.each(function(data) {
         // Dimensions of sunburst.
         var width = 190;
         var height = 190;
         var radius = Math.min(width, height) / 2;

         // Breadcrumb dimensions: width, height, spacing, width of tip/tail.
         var b = {
            w: 75,
            h: 30,
            s: 3,
            t: 10
         };

         // Mapping of step names to colors.
         var colors = {
            "1": "#5687d1",
            "11": "#5687aa",
            "12": "#5687bb",
            "2": "#7b615c",
            "3": "#de783b",
            "4": "#6ab975",
            "5": "#a173d1",
            "6": "#bbbbbb"
         };

         // Total size of all segments; we set this later, after loading the data.
         var totalSize = 0;

         var container = d3.select(this);

         var vis = container.append("svg:svg").attr("width", width).attr("height", height).append("svg:g").attr("id", "container").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

         var partition = d3.layout.partition().size([2 * Math.PI, radius * radius]).value(function(d) {
            return d.size;
         });

         var arc = d3.svg.arc().startAngle(function(d) {
            return d.x;
         }).endAngle(function(d) {
            return d.x + d.dx;
         }).innerRadius(function(d) {
            return Math.sqrt(d.y);
         }).outerRadius(function(d) {
            return Math.sqrt(d.y + d.dy);
         });

         createVisualization(data);

         // Main function to draw and set up the visualization, once we have the data.
         function createVisualization(json) {
            // Basic setup of page elements.
            // initializeBreadcrumbTrail();
            // drawLegend();
            // d3.select("#togglelegend").on("click", toggleLegend);

            // Bounding circle underneath the sunburst, to make it easier to detect when the mouse leaves the parent g.
            vis.append("svg:circle").attr("r", radius).style("opacity", 0);

            // For efficiency, filter nodes to keep only those large enough to see.
            var nodes = partition.nodes(json).filter(function(d) {
               return (d.dx > 0.005);
               // 0.005 radians = 0.29 degrees
            });

            var path = vis.data([json]).selectAll("path").data(nodes).enter().append("svg:path").attr("display", function(d) {
               return d.depth ? null : "none";
            }).attr("d", arc).attr("fill-rule", "evenodd").style("fill", function(d) {
               return colors[d.name];
            }).style("opacity", 1).on("mouseover", mouseover);

            // Add the mouseleave handler to the bounding circle.
            d3.select("#container").on("mouseleave", mouseleave);

            // Get total size of the tree = value of root node from partition.
            totalSize = path.node().__data__.value;
         };

         // Fade all but the current sequence, and show it in the breadcrumb trail.
         function mouseover(d) {

            var percentage = (100 * d.value / totalSize).toPrecision(3);
            var percentageString = percentage + "%";
            if (percentage < 0.1) {
               percentageString = "< 0.1%";
            }

            d3.select("#percentage").text(percentageString);

            d3.select("#explanation").style("visibility", "");
         }

         // Restore everything to full opacity when moving off the visualization.
         function mouseleave(d) {
            // Deactivate all segments during transition.
            d3.selectAll("path").on("mouseover", null);

            // Transition each segment to full opacity and then reactivate it.
            d3.selectAll("path").transition().duration(1000).style("opacity", 1).each("end", function() {
               d3.select(this).on("mouseover", mouseover);
            });

            d3.select("#explanation").style("visibility", "hidden");
         }
      });

      return chart;
   }

   //============================================================
   // Expose Public Variables
   //------------------------------------------------------------

   chart.dispatch = dispatch;

   chart.options = nv.utils.optionsFunc.bind(chart);

   chart.margin = function(_) {
      if (!arguments.length)
         return margin;
      margin.top = typeof _.top != 'undefined' ? _.top : margin.top;
      margin.right = typeof _.right != 'undefined' ? _.right : margin.right;
      margin.bottom = typeof _.bottom != 'undefined' ? _.bottom : margin.bottom;
      margin.left = typeof _.left != 'undefined' ? _.left : margin.left;
      return chart;
   };

   chart.width = function(_) {
      if (!arguments.length)
         return width;
      width = _;
      return chart;
   };

   chart.height = function(_) {
      if (!arguments.length)
         return height;
      height = _;
      return chart;
   };

   chart.color = function(_) {
      if (!arguments.length)
         return color;
      color = _;
      return chart;
   };

   chart.zoomingOffset = function(_) {
      if (!arguments.length)
         return zoomingOffset;
      zoomingOffset = _;
      return chart;
   };

   //============================================================

   return chart;
}
