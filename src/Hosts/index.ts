import os = require('os');
var Mac = require('./mac');
var Linux = require('./linux');

class Hosts {

    public platform
    public os

    constructor() {
        this.platform = os.platform();
        switch (this.platform) {
            case 'darwin':
                this.os = new Mac();
                break;
            case 'linux':
                this.os = new Linux();
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
        return this.os.write(data);
    }

}

module.exports = Hosts;