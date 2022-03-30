import { Construct } from "constructs";
export interface MyConstructOptions {
    readonly propertyA: string;
}
export declare class MyConstruct extends Construct {
    config: MyConstructOptions;
    constructor(scope: Construct, id: string, config: MyConstructOptions);
}
