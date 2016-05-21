export declare class Parser {
    hostsString: any;
    hostsObject: any[];
    regexIp: string;
    constructor(hostsString: any);
    parse(): any[];
    getIp(string: any): any;
}
