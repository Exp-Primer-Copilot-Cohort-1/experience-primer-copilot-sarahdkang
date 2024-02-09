// Create web server

// Import required modules
var http = require('http');
var fs = require('fs');
var path = require('path');
var url = require('url');
var comments = require('./comments');

// Create server
http.createServer(function(req, res) {
    var uri = url.parse(req.url).pathname;
    var filename = path.join(process.cwd(), uri);
    var contentTypesByExtension = {
        '.html': "text/html",
        '.css':  "text/css",
        '.js':   "text/javascript"
    };
    var commentTypes = {
        'GET': comments.get,
        'POST': comments.post
    };

    // Serve static files
    fs.exists(filename, function(exists) {
        if (exists) {
            fs.readFile(filename, "binary", function(err, file) {
                if (err) {
                    res.writeHead(500, {"Content-Type": "text/plain"});
                    res.write(err + "\n");
                    res.end();
                    return;
                }
                var headers = {};
                var contentType = contentTypesByExtension[path.extname(filename)];
                if (contentType) {
                    headers["Content-Type"] = contentType;
                }
                res.writeHead(200, headers);
                res.write(file, "binary");
                res.end();
            });
        } else {
            res.writeHead(404, {"Content-Type": "text/plain"});
            res.write("404 Not Found\n");
            res.end();
        }
    });

    // Handle comments
    if (req.method in commentTypes) {
        var body = "";
        req.on('data', function(data) {
            body += data;
        });
        req.on('end', function() {
            commentTypes[req.method](req, res, body);
        });
    }
}).listen(8124);
console.log('Server running at http://');