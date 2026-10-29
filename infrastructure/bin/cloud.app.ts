#!/usr/bin/env node
import {App} from "aws-cdk-lib";
import {PipelineStack} from "../lib/pipeline.stack";
import {StageConfigurator} from "../config/stage.configurator";
import {StageConfiguration} from "../config/stage.configuration";

const app = new App();
let stageConfig: StageConfiguration;

const stageName = app.node.tryGetContext("stage")?.toString().trim();
if (stageName) {
    stageConfig = StageConfigurator.fromStage(stageName).convertToConfigurationObject();
} else {
    const branchName = app.node.tryGetContext("branch")?.toString().trim();

    if (!branchName) {
        throw new Error(`Invalid branch name.`);
    }
    stageConfig = StageConfigurator.fromLocal(branchName).convertToConfigurationObject();
}

let pipelineStack = new PipelineStack(app, "ImFrontendPipelineStackId", stageConfig, {
        env: {
            account: process.env["CDK_DEFAULT_ACCOUNT"],
            region: process.env["CDK_DEFAULT_REGION"],
        }
    }
);

pipelineStack.initialize();
app.synth();