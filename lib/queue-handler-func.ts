import { GoFunction } from "@aws-cdk/aws-lambda-go-alpha";
import { Duration, Tags } from "aws-cdk-lib";
import { Alarm, Metric } from "aws-cdk-lib/aws-cloudwatch";
import {
    LambdaDeploymentConfig,
    LambdaDeploymentGroup,
} from "aws-cdk-lib/aws-codedeploy";
import { Alias } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import * as path from "path";

export class HandlerFunc extends Construct {
    constructor(scope: Construct, id: string) {
        super(scope, id);

        const func = new GoFunction(scope, "Function", {
            entry: path.join(__dirname, `../src/one`),
            functionName: `sample-handler`,
            timeout: Duration.seconds(30),
            environment: {},
        });

        const version = new Date().toISOString();
        const aliasName = "main";
        Tags.of(func).add("version", version);

        const stage = new Alias(scope, `FunctionAlias`, {
            aliasName: aliasName,
            version: func.currentVersion,
        });

        const failureAlarm = this.createFailureAlarm(
            scope,
            "LambdaFailure",
            func,
            aliasName
        );

        new LambdaDeploymentGroup(scope, "CanaryDeployment", {
            alias: stage,
            deploymentConfig: LambdaDeploymentConfig.CANARY_10PERCENT_10MINUTES,
            alarms: [failureAlarm],
        });
    }

    createFailureAlarm = (
        c: Construct,
        id: string,
        func: GoFunction,
        funcAlias: string
    ): Alarm => {
        return new Alarm(c, id, {
            alarmDescription: "The latest deployment errors > 0",
            metric: new Metric({
                metricName: "Errors",
                namespace: "AWS/Lambda",
                statistic: "sum",
                dimensionsMap: {
                    Resource: `${func.functionName}:${func.currentVersion}`,
                    FunctionName: func.functionName,
                },
                period: Duration.minutes(1),
            }),

            threshold: 1,
            evaluationPeriods: 1,
        });
    };
}
