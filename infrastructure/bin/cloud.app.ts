#!/usr/bin/env node
import {App} from "aws-cdk-lib";
import {PipelineStack} from "../lib/pipeline.stack";
import {StageConfigurator} from "../config/stage.configurator";

const app = new App();
const stageConfig = StageConfigurator.fromStage('Dev').convertToConfigurationObject();

let pipelineStack = new PipelineStack(app, "ImFrontendPipelineStackId", stageConfig, {
        env: {
            account: "251183416711",
            region: "eu-central-1",
        }
    }
);

pipelineStack.initialize();
app.synth();