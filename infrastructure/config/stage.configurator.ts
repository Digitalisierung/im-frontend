import {RemovalPolicy} from "aws-cdk-lib";
import {StageConfiguration} from "./stage.configuration";

/**
 * Konfiguration für eine Stage-Umgebung.
 */
export class StageConfigurator {
    private static readonly CONNECTION_ARN_DEV_ACCOUNT: string = "arn:aws:codeconnections:eu-central-1:672296383273:connection/928fe30b-f26c-4070-9ca3-31ad39780b4f";
    private static readonly CONNECTION_ARN_TEST_ACCOUNT: string = "";
    private static readonly CONNECTION_ARN_PROD_ACCOUNT: string = "";
    private static readonly CONNECTION_ARN_SANDBOX_ACCOUNT: string = "arn:aws:codeconnections:eu-central-1:315735600242:connection/5b463871-e022-42cc-831b-be409b55e94b";

    private constructor(
        public readonly stageName: string,
        public readonly branch: string,
        public readonly connectionArn: string,
        public readonly removalPolicy: RemovalPolicy,
        public readonly dynamoDbPitrEnabled: boolean,
        public readonly apiGatewayDataTraceEnabled: boolean,
        public readonly autoDeleteObjects: boolean,
        public readonly lambdaTimeout: number,
        public readonly lambdaMemorySize: number,
        public readonly logLevel: string,
        public readonly corsAllowedOrigins: string[],
        public readonly cdkSynthCommand: string
    ) {
    }

    /**
     * Erstellt einen 'StageConfigurator' für einen der vordefinierten Stages (dev, test oder prod).
     *
     * @param stage Der Name des Stages (Groß-/Kleinschreibung wird ignoriert).
     * @return Ein konfigurierter StageConfigurator.
     * @throws Error Wenn der übergebene Stage-Name ungültig ist.
     */
    public static fromStage(stage: string): StageConfigurator {
        const normalizedStageName = stage.toLowerCase();

        switch (normalizedStageName) {
            case 'dev':
                return new StageConfigurator(
                    'Dev',
                    'develop',
                    StageConfigurator.CONNECTION_ARN_DEV_ACCOUNT,
                    RemovalPolicy.DESTROY,
                    false,
                    true,
                    true,
                    30,
                    1024,
                    'DEBUG',
                    ['*'],
                    'cdk synth -c stage=Dev'
                );
            case 'test':
                return new StageConfigurator(
                    'Test',
                    'test',
                    StageConfigurator.CONNECTION_ARN_TEST_ACCOUNT,
                    RemovalPolicy.RETAIN,
                    true,
                    false,
                    false,
                    30,
                    1024,
                    'INFO',
                    ['*'],
                    'cdk synth -c stage=Test'
                );
            case 'prod':
                return new StageConfigurator(
                    'Prod',
                    'main',
                    StageConfigurator.CONNECTION_ARN_PROD_ACCOUNT,
                    RemovalPolicy.RETAIN,
                    true,
                    false,
                    false,
                    30,
                    1024,
                    'INFO',
                    ['*'],
                    'cdk synth -c stage=Prod'
                );
            default:
                throw new Error(`Unknown stage ${stage}`);
        }
    };

    /**
     * Erstellt einen 'StageConfigurator' für eine lokale Entwicklung basierend auf einem Branch-Namen.
     * Verwendet standardmäßig Sanbox-Einstellungen und Zerstörungsrichtlinien.
     *
     * @param branch Der Name des Git-Branches.
     * @return StageConfigurator Ein konfigurierter 'StageConfigurator'.
     * @throws Error Einen Fehler, wenn Branch-Name null oder leer ist.
     */
    public static fromLocal(branch: string): StageConfigurator {
        if (branch || branch.trim() === '') {
            throw new Error(`Invalid branch name.`);
        }

        const normalizedStageName = branch.toLowerCase();

        return new StageConfigurator(
            'Local-env',
            branch,
            StageConfigurator.CONNECTION_ARN_SANDBOX_ACCOUNT,
            RemovalPolicy.DESTROY,
            false,
            false,
            true,
            30,
            1024,
            'DEBUG',
            ['*'],
            `cdk synth -c branch=${'branch'}`
        );
    };

    public isDev(): boolean {
        return this.stageName.toLocaleLowerCase() === 'dev';
    }

    public isTest(): boolean {
        return this.stageName.toLocaleLowerCase() === 'test';
    }

    public isProd(): boolean {
        return this.stageName.toLocaleLowerCase() === 'prod';
    }

    public isLocal(): boolean {
        return !this.isDev() && !this.isTest() && !this.isProd();
    }

    /**
     * Konvertiert die Konfiguration in ein reines Objekt (für einfache Serialisierung).
     */
    public convertToConfigurationObject(): StageConfiguration {
        return {
            stageName: this.stageName,
            branchName: this.branch,
            connectionArn: this.connectionArn,
            removalPolicy: this.removalPolicy,
            dynamoDbPitrEnabled: this.dynamoDbPitrEnabled,
            apiGatewayDataTraceEnabled: this.apiGatewayDataTraceEnabled,
            autoDeleteObjects: this.autoDeleteObjects,
            lambdaTimeout: this.lambdaTimeout,
            lambdaMemorySize: this.lambdaMemorySize,
            logLevel: this.logLevel,
            corsAllowedOrigins: this.corsAllowedOrigins,
            cdkSynthCommand: this.cdkSynthCommand
        }
    };
}