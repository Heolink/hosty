var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Mac = require('./mac');
var InterfaceHosts = require('./interfaceHosts');
var Linux = (function (_super) {
    __extends(Linux, _super);
    function Linux() {
        _super.apply(this, arguments);
    }
    return Linux;
})(Mac);
module.exports = Mac;
