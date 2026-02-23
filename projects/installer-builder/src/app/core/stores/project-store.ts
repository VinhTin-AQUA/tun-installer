import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { ProjectFolders } from 'data-access';
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
    changeReload: false,
};

export const ProjectStore = signalStore(
    {
        providedIn: 'root',
    },
    withState(initialState),
    withMethods((store) => {
        function updateDir(baseDir: string, projectName: string) {
            patchState(store, (currentState) => ({
                configDir: `${baseDir}/${ProjectFolders.configs}`,
                pageDir: `${baseDir}/${ProjectFolders.pages}`,
                prerequisiteDir: `${baseDir}/${ProjectFolders.prerequisites}`,
                resourceDir: `${baseDir}/${ProjectFolders.resources}`,

                projectDir: `${baseDir}`,
                configFile: `${baseDir}/${ProjectFolders.configs}/config.json`,
                projectFile: `${baseDir}/${projectName}.tunins`,
                projectName: projectName,
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
                changeReload: store.changeReload(),
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
