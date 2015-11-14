window.data = [];

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
        var lineData = lines[x].split(",");
        window.data.push(
            {
                date: lineData[dateIndex],
                steps: lineData[stepIndex]
            }
        );
    }
};

window.fileSelection = function fileSelection(event) {
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