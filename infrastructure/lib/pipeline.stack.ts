import {aws_codepipeline_actions, Duration, RemovalPolicy, Stack, StackProps} from "aws-cdk-lib";
import {Construct} from "constructs";
import {BlockPublicAccess, Bucket, BucketEncryption} from "aws-cdk-lib/aws-s3";
import {AnyPrincipal, Effect, PolicyStatement, Role, ServicePrincipal} from "aws-cdk-lib/aws-iam";
import {
    BuildEnvironmentVariableType,
    BuildSpec,
    ComputeType,
    LinuxBuildImage,
    Project,
    Source
} from "aws-cdk-lib/aws-codebuild";
import {LogGroup, RetentionDays} from "aws-cdk-lib/aws-logs";
import {Artifact, Pipeline, StageProps} from "aws-cdk-lib/aws-codepipeline";
import {CodeBuildAction, CodeBuildActionType} from "aws-cdk-lib/aws-codepipeline-actions";
import {StageConfiguration} from "../config/stage.configuration";

export class PipelineStack extends Stack {
    private readonly repoOwner: string = "Digitalisierung";
    private readonly repoName: string = "im-frontend";
    private readonly stageConfig: StageConfiguration;

    constructor(scope: Construct, id: string, stageConfig: StageConfiguration, props?: StackProps) {
        super(scope, id, props);
        this.stageConfig = stageConfig;
    }

    public initialize(): void {
        const pipelineArtifactBucket = this.createPipelineArtifactBucket();
        const imFrontendBucket = this.createImFrontendBucked();

        const projectRole = this.createRole(imFrontendBucket);

        imFrontendBucket.grantReadWrite(projectRole);
        imFrontendBucket.grantDelete(projectRole);

        pipelineArtifactBucket.grantRead(projectRole);

        const codeBuildProject = this.createCodeBuildProject(imFrontendBucket, pipelineArtifactBucket, projectRole);

        const pipeline = this.createImFrontendPipeline(pipelineArtifactBucket, codeBuildProject);

        pipeline.addToRolePolicy(
            new PolicyStatement({
                effect: Effect.ALLOW,
                actions: ['codestar-connections:UseConnection'],
                resources: [this.stageConfig.connectionArn]
            })
        );
    };

    private createPipelineArtifactBucket(): Bucket {
        const artifactBucket = new Bucket(this, "ImFrontendArtifactBucketId", {
            blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
            encryption: BucketEncryption.S3_MANAGED,
            removalPolicy: RemovalPolicy.DESTROY,
            lifecycleRules: [
                {
                    id: 'DeleteRuleForOldArtifactsId',
                    expiration: Duration.days(30),
                    abortIncompleteMultipartUploadAfter: Duration.days(30)
                }
            ],
            versioned: true
        });

        return artifactBucket;
    }

    private createImFrontendBucked(): Bucket {
        const imFrontendBucket = new Bucket(this, "ImFrontendBucketId", {
            blockPublicAccess: new BlockPublicAccess({
                blockPublicAcls: false,
                blockPublicPolicy: false,
                ignorePublicAcls: false,
                restrictPublicBuckets: false
            }),
            encryption: BucketEncryption.S3_MANAGED,
            removalPolicy: RemovalPolicy.DESTROY,
            versioned: false,
            websiteIndexDocument: 'index.html',
            websiteErrorDocument: 'error.html'
        });

        // Richtlinie zum öffentlichen Zugriff.
        imFrontendBucket.addToResourcePolicy(
            new PolicyStatement({
                effect: Effect.ALLOW,
                principals: [new AnyPrincipal()],
                actions: ['s3:GetObject'],
                resources: [`${imFrontendBucket.bucketArn}/*`]
            })
        );
        return imFrontendBucket;
    }

    // Role to build and deploy Website to S3 bucket.
    private createRole(bucket: Bucket): Role {
        const projectRole = new Role(this, "ProjectRoleId", {
            assumedBy: new ServicePrincipal('codebuild.amazonaws.com')
        });

        projectRole.addToPolicy(
            new PolicyStatement({
                effect: Effect.ALLOW,
                actions: ['logs:CreateLogGroup', 'logs:CreateLogStream', 'logs:PutLogEvents'],
                resources: [`arn:aws:logs:${this.region}:${this.account}:*`]
            })
        );

        projectRole.addToPolicy(
            new PolicyStatement({
                effect: Effect.ALLOW,
                actions: ['s3:listBucket', 's3:GetBucketLocation'],
                resources: [bucket.bucketArn]
            })
        );

        return projectRole;
    }

    // Create CodeBuild Project.
    private createCodeBuildProject(imFrontendBucket: Bucket, pipelineArtifactBucket: Bucket, projectRole: Role): Project {
        const project = new Project(this, "ImFrontendBuildProjectId", {
            role: projectRole,
            source: Source.s3({
                bucket: pipelineArtifactBucket,
                path: 'source.zip'
            }),
            environment: {
                computeType: ComputeType.MEDIUM,
                buildImage: LinuxBuildImage.AMAZON_LINUX_2_5
            },
            environmentVariables: {
                S3_BUCKET: {
                    type: BuildEnvironmentVariableType.PLAINTEXT,
                    value: imFrontendBucket.bucketName
                }
            },
            logging: {
                cloudWatch: {
                    logGroup: new LogGroup(this, "ImFrontendLogGroupId", {
                        retention: RetentionDays.ONE_WEEK
                    })
                }
            },
            buildSpec: BuildSpec.fromSourceFilename('buildspec.yaml'),
            queuedTimeout: Duration.minutes(480),
            timeout: Duration.minutes(20),
            autoRetryLimit: 0,
            badge: false
        });

        return project;
    }

    private createImFrontendPipeline(pipelineArtifactBucket: Bucket, codeBuildProject: Project): Pipeline {
        const sourceOutput = new Artifact('SourceOutput');

        const sourceProps: StageProps = {
            stageName: 'Source',
            actions: [
                new aws_codepipeline_actions.CodeStarConnectionsSourceAction({
                    actionName: 'CodeStarConnectionsSourceAction',
                    connectionArn: this.stageConfig.connectionArn,
                    owner: this.repoOwner,
                    repo: this.repoName,
                    branch: this.stageConfig.branchName,
                    output: sourceOutput
                })
            ]
        };

        const buildProps: StageProps = {
            stageName: 'CodeBuild',
            actions: [
                new CodeBuildAction({
                    actionName: 'CodeBuildAction',
                    project: codeBuildProject,
                    type: CodeBuildActionType.BUILD,
                    input: sourceOutput
                })
            ]
        };

        const pipeline = new Pipeline(this, "ImFrontendPipeline", {
            artifactBucket: pipelineArtifactBucket,
            stages: [sourceProps, buildProps]
        });

        return pipeline;
    }
}