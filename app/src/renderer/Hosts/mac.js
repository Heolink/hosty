import sudo from 'sudo-prompt'
import Promise from 'promise'
import fs from 'fs'
import { remote } from 'electron'
import store from '../vuex/store'

const sudoConfig = {
    name: 'Hosty'
}

export default class Mac {

    constructor()
    {
        this.file = '/etc/hosts'
        this.clientSave = false
    }

    restoreBackup()
    {
        return new Promise((resolve, reject) => {
            fs.readFile(store.getters.backupFile, {encoding:'UTF8'}, (err, data) => {
                if (err) {
                    reject(err);
                }
                resolve(data);
            });
        });
    }

    read() {
        return new Promise((resolve, reject) => {
            fs.readFile(this.file, {encoding:'UTF8'}, (err, data) => {
                if (err) {
                    reject(err);
                }
                resolve(data);
            });
        });
    }

    cp(to)
    {
        return new Promise((resolve, reject) => {
            fs.createReadStream(this.file).pipe(fs.createWriteStream(to))
            resolve()
        })  
        
    }

    write(data) {
        var command = 'mv ' + store.getters.tmpFile.replace(/ /g, '\\ ') + ' ' + this.file;

        var that = this;
        that.clientSave = true;
        
        return new Promise(function(resolve, reject){
            fs.writeFile(store.getters.tmpFile, data, function (err) {
                if(err) {
                    reject(err);
                } else {
                    sudo.exec(command, sudoConfig, function(error, stdout, stderr){
                        if (error) {
                            console.log(stdout)
                            console.log(stderr)
                            reject(error);
                        } else {
                            resolve(stdout);
                        }
                    });
                }
            });
        });
    }


}
