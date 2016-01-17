var sudo = require('electron-sudo');
var Promise = require('promise');
var InterfaceHosts = require('./interfaceHosts');



class Mac implements InterfaceHosts {

    public read() {
        var command = 'cat /etc/hosts';

        var options = {
            name: 'Hosts manager',
        }

        return new Promise(function(resolve, reject){
            sudo.exec(command, options, function(error, success){
                if( error ) {
                    reject(error);
                }
                resolve(success);
            });
        });
    }

    public write(data: String) {
        var command = 'echo "'+data+'" | sudo tee /etc/hosts';

        var options = {
            name: 'Hosts manager',
        }

        return new Promise(function(resolve, reject){
            sudo.exec(command, options, function(error, success){
                if( error ) {
                    reject(error);
                }
                resolve(success);
            });
        });
    }

}

module.exports = Mac;