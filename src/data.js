window.data = [];

var parseDate = d3.time.format("%Y%m%d").parse;

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
};

window.fileSelection = function fileSelection(event) {
    window.data = [];
    var files = event.target.files;
    for (var x = 0; x < files.length; x++) {
        var reader = new FileReader();
        reader.onload = function (event) {
            processFileContents(event.target.result);
        };
        var file = files[x];
        reader.readAsText(file);
    }
};