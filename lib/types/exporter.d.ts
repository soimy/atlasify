export declare class Exporter {
    setExportFormat(name: string): boolean;
    getExtension(): string;
    compile(view: any): string;
    private template;
    private ext;
}
