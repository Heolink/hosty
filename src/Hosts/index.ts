import os = require('os');
import Mac = require('./mac');
import Linux = require('./linux');

class Hosts {

    public platform
    public os

    constructor() {
        this.platform = os.platform();
        switch (this.platform) {
            case 'darwin':
                this.os = new Mac.Mac();
                break;
            case 'linux':
                this.os = new Linux.Linux();
                break;
                break;
        }
    }

    public read()
    {
        return this.os.read();
    }

    public write (data: String)
    {
        return this.os.write(data.trim());
    }

    public watch(callback)
    {
        return this.os.watch(callback);
    }

}

module.exports = Hosts;