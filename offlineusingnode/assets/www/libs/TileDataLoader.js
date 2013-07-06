/**
 * Provides abstraction layer for loading tile data either from local db or from remote service
 */
var TileDataLoader = function (context, config, cb) {
    this._context = context;
    this._config = config;
    if (this._config.isPlainBrowser()) {
        this._database = config.dbName;
        cb(this);
    } else {
        this._fetchDatabase(cb);
    }
};

/**
 * Load tile data from pre-determined tile source.
 * @param x The X coordinate of the tile
 * @param y The y coordinate of the tile
 * @param z The z (or zoom) coordinate of the tile
 * @param successcb Callback called if successful, will pass the data in base64 encoded form
 * @param errorcb Callback called if an error occurs
 */
TileDataLoader.prototype.loadTileData = function (x, y, z, successcb, errorcb) {
    if (this._config.isPlainBrowser()) {
        this._loadTileDataFromNode(x, y, z, successcb, errorcb);
    } else {
        this._loadTileDataFromLocalDb(x, y, z, successcb, errorcb);
    }
};

TileDataLoader.prototype._fetchDatabase = function (cb) {
    var dbName = this._config.dbName;
    var remoteFile = this._config.serviceUrl + '/databases/' + dbName;
    var that = this;
    var openDbAndProceed = function () {
        that._database = that._context.sqlitePlugin.openDatabase({name: that._config.dbName, create: false});
        cb(that);
    }
    this._context.sqlitePlugin.databaseExists(dbName, function (retArray) {
        if (retArray[0]) {
            console.log('Database file [' + dbName + '] already exists, opening db');
            that._context.sqlitePlugin.openDatabase({name: that._config.dbName, create: false});
            openDbAndProceed();
        } else {
            // file does not exist
            //need to download the db file to the same place SQLite plugin will be trying to load it,
            //which is in the database path
            that._context.sqlitePlugin.getDatabasePath(dbName, function (dbPath) {
                // file does not exist
                console.log('Database file [' + dbName + '] does not exist, downloading file from ' + remoteFile);

                msg.innerHTML = 'Downloading file (~14mbs)...';

                var ft = new FileTransfer();

                ft.download(remoteFile, dbPath + dbName, function (entry) {
                    console.log('download complete: ' + entry.fullPath);
                    openDbAndProceed();
                }, function (error) {
                    console.log('error with download', error);
                });
            });

        }
    });
};

TileDataLoader.prototype._loadTileDataFromLocalDb = function (x, y, z, successcb, errorcb) {
    var that = this;
    this._database.transaction(function (tx) {
        tx.executeSql("SELECT tile_data FROM images INNER JOIN map ON images.tile_id = map.tile_id WHERE zoom_level = ? AND tile_column = ? AND tile_row = ?", [z, x, y], function (tx, res) {
            if (!res || !res.rows || res.rows.length != 1) {
                console.log('Expected tile query to return exactly one row, but returned: ' + (res && res.rows && res.rows.length));
            } else {
                successcb(res.rows.item(0).tile_data);
            }
        }, function (err) {
            errorcb('Error occurred while querying tile db: ' + er);
        });
    });
};

TileDataLoader.prototype._loadTileDataFromNode = function (x, y, z, successcb, errorcb) {
    var that = this;
    console.log('Loading tile using url: ' + this._config.serviceUrl + '/tile/' + x + '/' + y + '/' + z + '?db=' + encodeURIComponent(this._database));
    $.ajax({
        url: this._config.serviceUrl + '/tile/' + x + '/' + y + '/' + z + '?db=' + encodeURIComponent(this._database),
        success: function (data, status, xhr) {
            console.log('loaded data from node [' + x + ',' + y + ',' + z + ']');
            successcb(data.tile_data);
        },
        error: function (xhr, status, error) {
            console.log('Error occurred: ' + (status ? status + ', ' : '') + (error ? error : ''));
            errorcb && errorcb('Error occurred: ' + (status ? status + ', ' : '') + (error ? error : ''));
        }
    });
};
