import {EnvironmentConfig} from "./environment.config";

const environments: Record<string, EnvironmentConfig> = {
    dev: {
        region: "eu-central-1",
        account: "",
        profileName: ""
    },
    test: {
        region: "",
        account: "",
        profileName: ""
    },
    prod: {
        region: "",
        account: "",
        profileName: ""
    }
};