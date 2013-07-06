var sqlite3 = require('sqlite3').verbose();
var express = require('express');
var app = express();

//attach static content so we can serve the app from node and thus
//mitigate cross-origin issues

var baseDir = __dirname + '/../../offlineusingnode';
var baseDbDir = baseDir + '/databases';
console.log('Serving static content from "' + baseDir + '/assets/www');
console.log('Serving databases from "' + baseDir + '/databases');
app.use('/databases', express.static(baseDir + '/databases'));
app.use(express.static(baseDir + '/assets/www'));

app.get('/tile/:x/:y/:z', function (req, res) {
    var db = req.query.db;
    if (!db) {
        res.send(400, '{ error: "expected valid db"]');
    }

    db = baseDbDir + '/' + db;
    console.log('get /tile/' + req.params.x + '/' + req.params.y + '/' + req.params.z + ' - db: ' + db);
    res.set('Content-Type', 'application/json');
    getTile(db, req.params.x, req.params.y, req.params.z, function (data) {
        var responseString = '{"tile_data":"' + data + '"}';
        res.set('Content-Length', responseString.length);
        res.send(responseString);
    }, function (status, err) {
        res.send(status, '{ error: ' + err + '}');
    });
});


var dbs = {};

function openDb(file) {
    var db = dbs[file];
    if (!db) {
        console.log('Opening db: ' + file);
        db = new sqlite3.Database(file, sqlite3.OPEN_READWRITE, function(error) {
            if (error) {
                console.log('Error occurred while attempting to open [' + file + ']: ' + error);
            } else {
                console.log('Successfully opened [' + file + ']');
            }
        });
    } else {
        console.log('Db already open: ' + file);
    }
    if (db) {
        console.log('Database open: ' + file);
        dbs[file] = db;
        return db;
    } else {
        console.log('Failed to open db: ' + file);
        return null;
    }
}

function closeAllDbs() {
    console.log('Closing database(s)');
    for (var db in dbs) {
        console.log('Closing db: ' + db);
        dbs[db].close();
    }
}

function getTile(dbFile, x, y, z, successCallback, errorCallback) {
    var db = openDb(dbFile);
    if (!db) {
        errorCallback(500, 'Expected valid db, but was null');
    } else {
        db.get('SELECT tile_data FROM images INNER JOIN map ON images.tile_id = map.tile_id WHERE zoom_level = ? AND tile_column = ? AND tile_row = ?', [z, x, y], function (err, row) {
            if (err != null) {
                errorCallback(500, err);
            }
            if (!row) {
                console.log('Expected tile query for point [' + x + ',' + y + ',' + z + '] to return exactly one row');
                errorCallback(404, 'Expected tile query for point [' + x + ',' + y + ',' + z + '] to return exactly one row');
            } else {
                successCallback(new Buffer(row["tile_data"]).toString('base64'));
            }
        });
    }
}

var shutdown = function () {
    console.log('Got SIGINT - closing databases');
    closeAllDbs();
    process.exit();
};

process.on('SIGINT', shutdown);
process.on('SIGKILL', shutdown);

app.listen(3000);

console.log('Listening on port 3000')