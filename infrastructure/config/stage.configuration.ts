import {RemovalPolicy} from "aws-cdk-lib";

/**
 *  Konfiguration für eine CDK Stage Umgebung (Local, Dev, Test oder Prod).
 */
export interface StageConfiguration {
    readonly stageName: string;
    readonly branchName: string;
    readonly connectionArn: string;
    readonly removalPolicy: RemovalPolicy;
    readonly dynamoDbPitrEnabled: boolean;
    readonly apiGatewayDataTraceEnabled: boolean;
    readonly autoDeleteObjects: boolean;
    readonly lambdaTimeout: number;
    readonly lambdaMemorySize: number;
    readonly logLevel: string;
    readonly corsAllowedOrigins: string[];
    readonly cdkSynthCommand: string;
}