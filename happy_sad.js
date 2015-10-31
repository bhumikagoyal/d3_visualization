<!DOCTYPE html>

<html>
	<meta charset="utf-8">
	<link rel="stylesheet" type="text/css" href="style.css">
	<script src="http://d3js.org/d3.v3.min.js" charset="utf-8"></script>
	<title>User content</title>
	<body>
		<script>
	

var apiUrl = "https://input.mozilla.org/api/v1/feedback/?date_delta=-7";
var height = window.innerHeight;
var width = window.innerWidth;

var svg = d3.select("body").append("svg")
	.attr("width", width)
	.attr("height", height)
	.classed("bubbles", true);

var labelsContainer = d3.select("body").append("div");
var nest = d3.nest()
	.key(function (d) { return d.product + ":" + d.happy; })
	.rollup(function (group) {
		return { 
			count: group.length,
			happy: group[0].happy,
			product: group[0].product || "Unknown",
		}
	});


var layout = d3.layout.pack()
	.value(function (d) { return d.count })
	.size([width, height])
	.padding(3);

var happyColorScale = d3.scale.ordinal()
	.domain([true, false, undefined])
	.range(["#76B472", "#D76058", "none"]);

var textSizeScale = d3.scale.linear()
	.domain([25, 100])
	.range([0.5, 1.0])
	.clamp(true);

var productHappitude = [];

function resize() {
	height = window.innerHeight;
	width = window.innerWidth;
	layout = layout.size([width, height]);
	console.log("ls", layout.size());
	svg.attr("width", width).attr("height", height);
	draw();
}
window.onresize = resize;


function draw() {
	
	var data = layout({ children: productHappitude })
		.filter(function (d) { return d.parent !== null; });
	var bubbles = svg.selectAll(".bubble")
		.data(data);
	bubbles.enter()
		.append("circle")
		.classed("bubble", true);
	bubbles
		.attr("cx", function (d) { return d.x; })
		.attr("cy", function (d) { return d.y; })
		.attr("r", function (d) { return d.r; } )
		.attr("fill", function (d) { return happyColorScale(d.happy); });
	bubbles.exit().remove();

	var labels = labelsContainer.selectAll(".label")
		.data(data);
	labels.enter()
		.append("div")
		.classed("label", true);
	labels
		.text(function (d) { return d.product; } )
		.style("left", function (d) { return d.x + "px"; })
		.style("top", function (d) { return d.y + "px"; })
		.style("text-align", "center")
		.style("max-width", function (d) { return (d.r * 2) / textSizeScale(d.r) + "px"; })
		.style("position", "absolute")
		.style("transform", function (d) { return " translate(-50%, -50%) scale(" + textSizeScale(d.r) + ")" });
	labels.exit().remove();
}

d3.json(apiUrl, function(error, data) {
	data = nest.map(data.results, d3.map).values();
	productHappitude = data;
	draw();
	</script>
	</body>

</html>