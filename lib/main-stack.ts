import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import { HandlerFunc } from "./queue-handler-func";

export class MainStack extends cdk.Stack {
    constructor(scope: Construct, id: string) {
        super(scope, id);

        const handler = new HandlerFunc(this, "HandlerFunc");
    }
}
