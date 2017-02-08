import Promise from 'promise'
import fs from 'fs'
import Mac from './mac'
import { remote } from 'electron'
const pathConfig = remote.app.getPath('userData')

export default class Win32 extends Mac {
     
    constructor() {
        super()
        this.file = file = 'C:\\Windows\\System32\\drivers\\etc\\hosts';
    }

    write(data) {
        
        var command = "mv ("+ pathConfig + "/hosts" +"' , " + this.file + ")";

        var options = {
            name: 'Hosty',
        }

        var that = this;
        that.clientSave = true;
        return new Promise( (resolve, reject) => {
            fs.writeFile(this.file, data, function(err) {
                if(err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }

}
