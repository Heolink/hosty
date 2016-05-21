export class Parser {

    public hostsString;
    public hostsObject = [];

    public regexIp = '^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))|((([0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}:[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){5}:([0-9A-Fa-f]{1,4}:)?[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){4}:([0-9A-Fa-f]{1,4}:){0,2}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){3}:([0-9A-Fa-f]{1,4}:){0,3}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){2}:([0-9A-Fa-f]{1,4}:){0,4}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}((b((25[0-5])|(1d{2})|(2[0-4]d)|(d{1,2}))b).){3}(b((25[0-5])|(1d{2})|(2[0-4]d)|(d{1,2}))b))|(([0-9A-Fa-f]{1,4}:){0,5}:((b((25[0-5])|(1d{2})|(2[0-4]d)|(d{1,2}))b).){3}(b((25[0-5])|(1d{2})|(2[0-4]d)|(d{1,2}))b))|(::([0-9A-Fa-f]{1,4}:){0,5}((b((25[0-5])|(1d{2})|(2[0-4]d)|(d{1,2}))b).){3}(b((25[0-5])|(1d{2})|(2[0-4]d)|(d{1,2}))b))|([0-9A-Fa-f]{1,4}::([0-9A-Fa-f]{1,4}:){0,5}[0-9A-Fa-f]{1,4})|(::([0-9A-Fa-f]{1,4}:){0,6}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){1,7}:))$';

    constructor( hostsString )
    {
        this.hostsString = hostsString;
    }

    parse()
    {
        var lines = this.hostsString.split("\n");
        for(var lineNumber in lines) {
            var line = lines[lineNumber].trim();
            if( line.match(/^#/) ) {
                var cleanLine = line.replace(/^#+/,'').trim();
                var ipComented = this.getIp(cleanLine);

                if( ipComented ) {
                    ipComented = ipComented[0];
                    var domains = cleanLine.replace(ipComented,'').split(' ').filter( (x, k)=>{
                        if( !x ) {
                            return false;
                        }
                        if(x.match(/#/) ) {
                            return false;
                        }
                        return true;

                    }).map(function(v, k){
                        return {'domain': v.trim(),'comment':true};
                    });
                    this.hostsObject.push({
                        ip: ipComented,
                        lineNumber:lineNumber,
                        domains: domains,
                        comment: true
                    });
                }
            }
            var ip = this.getIp(line)
            if(ip) {
                ip = ip[0];
                //on vire les éléments vide avec : filter(x=>!!x)
                var inComment :any = false;
                var domains = line.replace(ip,'').split(' ').filter( (x, k)=>{
                    if( !x ) {
                        return false;
                    }
                    if(x.match(/#/) ) {
                        inComment = k;
                        return true;
                    }
                    return true;

                }).map(function(v, k){
                    var c = false;
                    if( inComment !== false && k >= inComment ) {
                        c = true;
                        v = v.replace(/#/,'')
                    }
                    return {'domain': v.trim(),'comment':c};
                });
                this.hostsObject.push({
                    ip: ip,
                    lineNumber:lineNumber,
                    domains: domains,
                    comment: false
                });
            }
        }
        return this.hostsObject;
    }

    public getIp(string)
    {
        return string.match(this.regexIp);
    }

}

module.exports = Parser;