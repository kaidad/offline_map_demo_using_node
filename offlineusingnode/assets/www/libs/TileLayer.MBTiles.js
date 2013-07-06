// inspired by: https://github.com/coomsie/topomap.co.nz/blob/master/Resources/leaflet/TileLayer.DB.js
L.TileLayer.MBTiles = L.TileLayer.extend({
    //db: SQLitePlugin
    tileDataLoader: null,
    base64Prefix: 'data:image/gif;base64,',
    initialize: function (url, options, tileDataLoader) {
        this.tileDataLoader = tileDataLoader;

        L.Util.setOptions(this, options);
    },
    getTileUrl: function (tile, tilePoint) {
        var z = tilePoint.z;
        var x = tilePoint.x;
        var y = tilePoint.y;

        console.log('getTileUrl: querying database with (x,y,z): ' + x + ', ' + y + ', ' + z);
        var that = this;
        this.tileDataLoader.loadTileData(x, y, z, function(tile_data) {
            tile.src = that.base64Prefix + tile_data;
        }, function(err) {
            console.log(err);
        });
    },
    _loadTile: function (tile, tilePoint) {
        tile._layer = this, tile.onload = this._tileOnLoad, tile.onerror = this._tileOnError, this._adjustTilePoint(tilePoint), this.getTileUrl(tile, tilePoint)
    }
});