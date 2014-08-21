nv.models.partitionChart = function() {"use strict";
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
         var container = d3.select(this);

         var availableWidth = (width || parseInt(container.style('width')) || 960) - margin.left - margin.right, availableHeight = (height || parseInt(container.style('height')) || 400) - margin.top - margin.bottom;
         var zoomOffset = (zoomingOffset || 30);
         var selColor = (color || ['#296db0', '#ffffff', '#ffffff']);

         //------------------------------------------------------------
         // Setup Scales

         // build ranges for each axis
         var xRange = [0, availableWidth];
         var yRange = [0, availableHeight];

         // get scaling function
         var scaleX = d3.scale.linear().range(xRange);
         var scaleY = d3.scale.linear().range(yRange);

         //------------------------------------------------------------
         // Setup containers and skeleton of chart

         var wrap = container.selectAll('g.nv-wrap.nv-partitionChart').data([data]);
         var wrapEnter = wrap.enter().append('g').attr('class', 'nvd3 nv-wrap nv-partitionChart');
         var gEnter = wrapEnter.append('g');
         var g = wrap.select('g');

         // create a partition
         var partition = d3.layout.partition().value(function(d) {
            return d.val;
         });

         // compute the partition layout and return the array of nodes
         var partitionNodes = partition.nodes(data);

         var group = gEnter.selectAll('g').data(partitionNodes).enter().append('svg:g').attr('transform', function(data) {
            // set translation according to nodes position and scaling function
            return 'translate(' + scaleX(data.y) + ',' + scaleY(data.x) + ')';
         });

         // get parent scales
         var normalizedWidth = availableWidth / data.dx;
         var normalizedHeight = availableHeight;

         // create rectangles
         group.append('svg:rect').attr('fill', selColor[0]).attr('stroke', selColor[2]).attr('width', data.dy * normalizedWidth).attr('height', function(d) {
            // calculate height of rectangle
            return d.dx * normalizedHeight;
         }).on('click', function(data) {
            // check if node has any children
            if (!data.children) {
               // node has no children, stop zooming
               return;
            } else {
               // calculate width and height
               normalizedHeight = availableHeight / data.dx;
               normalizedWidth = (data.y ? availableWidth - zoomOffset : availableWidth) / (1 - data.y);

               scaleX.domain([data.y, 1]).range([data.y ? zoomOffset : 0, availableWidth]);
               scaleY.domain([data.x, data.x + data.dx]);

               // transistion for groups
               var newGroup = group.transition().duration(750).attr('transform', function(d) {
                  return 'translate(' + scaleX(d.y) + ',' + scaleY(d.x) + ')';
               });

               // get the rectangle
               var allRect = newGroup.select('rect');

               // get the text
               var allText = newGroup.select('text');

               allRect.attr('width', data.dy * normalizedWidth);

               // set new rectangle height
               allRect.attr('height', function(d) {
                  // calculate new height
                  return d.dx * normalizedHeight;
               });

               // translate text and set opacity if text height is to small
               allText.attr('transform', calculateTextTransformation).style('opacity', function(d) {
                  return d.dx * normalizedHeight > 12 ? 1 : 0;
               }).style('fill', selColor[1]);
            }
         });

         // create text container
         var textContainers = group.append('svg:text');
         // set transformation of the text and set opacity if text height is to small
         textContainers.attr('transform', calculateTextTransformation).style('opacity', function(d) {
            return d.dx * normalizedHeight > 12 ? 1 : 0;
         }).style('fill', selColor[1]);

         // set text of the text container
         textContainers.text(function(currentNode) {
            return currentNode.name;
         });

         function calculateTextTransformation(node) {
            var yTranslation = node.dx * normalizedHeight / 2 + 5;
            return 'translate(10,' + yTranslation + ')';
         }


         wrap.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

         //------------------------------------------------------------

         //============================================================

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
