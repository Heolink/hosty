var fs = require('fs');

var userArgs = process.argv.slice(2);

var method = userArgs[0];
var file   = userArgs[1];
var filesrc   = userArgs[2];


if( method == 'read' ) {
    var contents = fs.readFileSync(file, 'utf8');
    console.log(contents);
    process.exit();
}

if( method == 'write' ) {
    var contents = fs.readFileSync(filesrc, 'utf8');
    fs.writeFile(file, contents, function(err) {
        if(err) {
            return console.log(err);
        }
        process.exit();
    });
}