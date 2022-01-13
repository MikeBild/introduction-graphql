export declare function list(): Promise<{
    id: number;
    content: string;
}[]>;
export declare function byId(payload: any): Promise<{
    id: number;
    content: string;
}>;
