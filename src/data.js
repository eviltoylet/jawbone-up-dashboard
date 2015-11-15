"use strict";

window.data = [];

var parseDate = d3.time.format("%Y%m%d").parse;
var processCount = 0;
var fileCount = 0;

var processFileContents = function (content) {
    // underscore might be helpful here?
    var lines = content.split(/[\r\n]+/g);
    var headerLine = lines[0];
    var headers = headerLine.split(",");

    var dateIndex = 0;
    var stepIndex = -1;
    for (var x = 0; x < headers.length; x++) {
        if (headers[x] === "m_steps") {
            stepIndex = x;
        }
    }

    for (var x = 1; x < lines.length; x++) {
        if (lines[x].trim().length == 0) {
            continue;
        }
        var lineData = lines[x].split(",");
        var numericSteps = +lineData[stepIndex];
        if (isNaN(numericSteps)) {
            numericSteps = 0;
        }
        window.data.push(
            {
                date: parseDate(lineData[dateIndex]),
                steps: numericSteps
            }
        );
    }

    processCount++;
    renderAllCharts();
};

var renderAllCharts = function renderAllCharts() {
    if (processCount != fileCount) {
        return;
    }
    renderStepChart();
    renderStepHistogram();
};

var quantizeSteps = function quantizeSteps(stepCount) {
    var bucketWidth = 1000;
    var bucketNumber = Math.round(stepCount / bucketWidth);
    return bucketNumber;
};

var renderStepHistogram = function renderStepHistogram() {
    var formatCount = d3.format(",.0f");
    var margin = {top: 20, right: 20, bottom: 30, left: 50};
    var width = 960 - margin.left - margin.right;
    var height = 500 - margin.top - margin.bottom;
    var stepsArray = window.data.map(function (d) {
        return d.steps;
    });
    var maxValue = Math.max(...stepsArray);
    var bins = [];

    for (var i = 0; i < quantizeSteps(maxValue); i++) {
        bins.push(i * 1000);
    }


    var data = d3.layout.histogram().bins(bins)(window.data.map(function (d) {
        return d.steps
    }));
    var y = d3.scale.linear().domain([0, d3.max(data, function (d) {
        return d.y
    })]).range([height, 0]);
    var x = d3.scale.linear().domain([0, maxValue]).range([0, width]);

    var xAxis = d3.svg.axis().scale(x).orient("bottom");

    d3.select("#stepHistogram .chart svg").remove();
    var svg = d3.select("#stepHistogram .chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    var bar = svg.selectAll(".bar")
        .data(data)
        .enter().append("g")
        .attr("class", "bar")
        .attr("transform", function (d) {
            return "translate(" + x(d.x) + "," + y(d.y) + ")";
        });

    bar.append("rect")
        .attr("x", 1)
        .attr("width", x(data[0].dx) - 1)
        .attr("height", function (d) {
            return height - y(d.y);
        });

    bar.append("text")
        .attr("dy", ".75em")
        .attr("y", 6)
        .attr("x", x(data[0].dx) / 2)
        .attr("text-anchor", "middle")
        .text(function (d) {
            return formatCount(d.y);
        });

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);
};

var renderStepChart = function renderStepChart() {
    var margin = {top: 20, right: 20, bottom: 30, left: 50};
    var width = 960 - margin.left - margin.right;
    var height = 500 - margin.top - margin.bottom;
    var y = d3.scale.linear().range([height, 0]);

    var x = d3.time.scale().range([0, width]);

    var xAxis = d3.svg.axis().scale(x).orient("bottom");

    var yAxis = d3.svg.axis().scale(y).orient("left");

    var line = d3.svg.line()
        .x(function (d) {
            return x(d.date);
        })
        .y(function (d) {
            return y(d.steps);
        });

    d3.select("#steps .chart svg").remove();

    var svg = d3.select("#steps .chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var data = window.data;

    x.domain(d3.extent(data, function (d) {
        return d.date;
    }));
    y.domain(d3.extent(data, function (d) {
        return d.steps;
    }));

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Steps");

    svg.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("d", line);
};

window.fileSelection = function fileSelection(event) {
    window.data = [];
    processCount = 0;
    var files = event.target.files;
    fileCount = files.length;
    for (var x = 0; x < files.length; x++) {
        var reader = new FileReader();
        reader.onload = function (event) {
            processFileContents(event.target.result);
        };
        var file = files[x];
        reader.readAsText(file);
    }
};