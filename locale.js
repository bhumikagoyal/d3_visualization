function call(inputUrl) {
    
 inputUrl="https://input.mozilla.org/api/v1/feedback/?products=Firefox%20OS&date_delta=7d";
    var width = 800;
    var height = 600;
    var barHeight = 20;
    var barHeight2 = 9;

    d3.select('div.chart-container')
        .append('svg')
        .classed('chart', true)
        .attr('width', width)
        .attr('height', height);
    var chart = d3.select('svg.chart');

    d3.json(inputUrl, function(error, data) {
        var aggedData = d3.nest()
            .key(function(d) {
                return d.locale;
            })
            .key(function(d) {
                return d.happy;
            })
            .rollup(function(group) {
                return group.length;
            })
            .entries(data.results);

        aggedData.sort(function(a, b) {
            return d3.descending(
                d3.sum(a.values, function(item) { return item.values; }),
                d3.sum(b.values, function(item) { return item.values; })
            );
        });

        var dateExtents = d3.extent(data.results, function(item) { return item.created; });
        
        var max = d3.max(aggedData,
                         function(item) {
                             return d3.max(item.values,
                                           function(part) {
                                               return part.values;
                                           });
                         });

        var scaleX = d3.scale.linear()
            .range([0, width - 50])
            .domain([0, max]);

        console.log(aggedData);

        var happyBars = chart.append('g')
            .classed('bars', true)
            .selectAll('rect')
            .data(aggedData);
        happyBars.enter()
            .append('rect')
            .classed('happy-rect', true);
        happyBars.attr('x', 150)
            .attr('y', function(d, i) { return i * barHeight; })
            .attr('height', barHeight2 - 1)
            .attr('width', function(d) {
                var happy = d.values.filter(function(item) { return item.key == 'true'; });
                if (happy.length == 1) {
                    return scaleX(happy[0].values);
                }
                return 0;
            });

        var sadBars = chart.append('g')
            .classed('bars', true)
            .selectAll('rect')
            .data(aggedData);
        sadBars.enter()
            .append('rect')
            .classed('sad-rect', true);
        sadBars.attr('x', 150)
            .attr('y', function(d, i) { return (i * barHeight) + barHeight2 - 1; })
            .attr('height', barHeight2)
            .attr('width', function(d) {
                var sad = d.values.filter(function(item) { return item.key == 'false'; });
                if (sad.length == 1) {
                    return scaleX(sad[0].values);
                }
                return 0;
            });

        var labels = chart.append('g')
            .classed('labels', true)
            .selectAll('text')
            .data(aggedData);
        labels.enter()
            .append('text');
        labels.attr('x', 0)
            .attr('y', function(d, i) { return (i + 0.6) * barHeight; })
            .text(function(d) { return d.key; })
            .style('text-anchor', 'middle-left');

    });
}
