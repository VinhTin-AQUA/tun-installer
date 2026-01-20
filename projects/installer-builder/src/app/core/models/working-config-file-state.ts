export interface WorkingConfigFileState {
    configDir: string;
    pageDir: string;
    prerequisiteDir: string;
    resourceDir: string;

    configFile: string;
    projectFile: string;
    projectDir: string;

    isDirty: boolean;
}
