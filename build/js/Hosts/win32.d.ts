import Mac = require('./mac');
export declare class Win32 extends Mac.Mac {
    file: string;
    write(data: String): any;
}
