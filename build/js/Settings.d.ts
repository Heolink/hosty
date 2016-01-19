declare var Datastore: any;
declare var remote: GitHubElectron.Remote;
declare const pathConfig: string;
declare var dbSettings: any;
declare class Setting {
    data: {
        historyNb: number;
        history: boolean;
    };
    private key;
    constructor();
    read(callback: any): void;
    write(data: any, callback: any): void;
}
