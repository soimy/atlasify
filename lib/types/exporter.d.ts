export declare class Exporter {
    static setExportFormat(name: string): boolean;
    static getExtension(): string;
    static compile(view: any): string;
    private static template;
    private static ext;
}
