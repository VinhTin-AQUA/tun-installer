import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { ProjectFolders } from '../consts/folder.const';
import { ProjectState } from '../models/project-state';

const initialState: ProjectState = {
    isDirty: false,
    configFile: '',
    projectFile: '',
    pageDir: '',
    projectDir: '',
    configDir: '',
    prerequisiteDir: '',
    resourceDir: '',
    projectName: '',
};

export const ProjectStore = signalStore(
    {
        providedIn: 'root',
    },
    withState(initialState),
    withMethods((store) => {
        function updateDir(baseDir: string, projectName: string) {
            patchState(store, (currentState) => ({
                configDir: `${baseDir}/${projectName}/${ProjectFolders.configs}`,
                pageDir: `${baseDir}/${projectName}/${ProjectFolders.pages}`,
                prerequisiteDir: `${baseDir}/${projectName}/${ProjectFolders.prerequisites}`,
                resourceDir: `${baseDir}/${projectName}/${ProjectFolders.resources}`,

                projectDir: `${baseDir}/${projectName}`,
                configFile: `${baseDir}/${projectName}/${ProjectFolders.configs}/config.json`,
                projectFile: `${baseDir}/${projectName}/${projectName}.tunins`,
                isDirty: false,
            }));
        }

        function updateValues(updates: Partial<ProjectState>) {
            patchState(store, (currentState) => ({
                ...updates,
            }));
        }

        function getData() {
            const data: ProjectState = {
                configFile: store.configFile(),
                projectFile: store.projectFile(),
                isDirty: store.isDirty(),
                pageDir: store.pageDir(),
                projectDir: store.projectDir(),
                configDir: store.configDir(),
                prerequisiteDir: store.prerequisiteDir(),
                resourceDir: store.resourceDir(),
                projectName: store.projectName(),
            };
            return data;
        }

        return {
            updateDir,
            updateValues,
            getData,
        };
    }),
);
