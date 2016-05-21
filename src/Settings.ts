var Datastore = require('nedb');
var remote = require('electron').remote;
const pathConfig = remote.app.getPath('appData') + '/hosty';

var dbSettings = new Datastore({ filename: pathConfig + '/settings.db', autoload: true });

class Setting {

    public data = {
        historyNb: 10,
        history: true,
        defaultView: 'raw',
        _name: null
    };
    private key = 'settings'

    constructor() {
        this.data._name = this.key;
    }

    public read(callback)
    {
        dbSettings.findOne({_name: this.key}).exec(  (err, doc) => {
            if(doc) {
                this.data = Vue.util.extend(this.data, doc);
            }
            callback(this.data);
        });
    }

    public write(data, callback)
    {
        data = Vue.util.extend(data, this.data);
        if( data.historyNb > 0 ) {
            data.history = true;
        } else {
            data.history = false;
        }
        data.historyNb = parseInt(data.historyNb);
        dbSettings.update({_name: this.key}, data, {upsert:true}, function(err, ok){
            callback(err, ok);
        })
    }

}

module.exports = new Setting();