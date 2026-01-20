import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { WorkingConfigFileState } from '../../core/models/working-config-file-state';

const initialState: WorkingConfigFileState = {
    isDirty: false,
    configFile: '',
    projectFile: '',
    pageDir: '',
    projectDir: '',
    configDir: '',
    prerequisiteDir: '',
    resourceDir: '',
};

export const WorkingConfigFileStore = signalStore(
    {
        providedIn: 'root',
    },
    withState(initialState),
    withMethods((store) => {
        function update(updates: Partial<WorkingConfigFileState>) {
            patchState(store, (currentState) => ({
                ...updates,
            }));
        }

        function getData() {
            const data: WorkingConfigFileState = {
                configFile: store.configFile(),
                projectFile: store.projectFile(),
                isDirty: store.isDirty(),
                pageDir: store.pageDir(),
                projectDir: store.projectDir(),
                configDir: store.configDir(),
                prerequisiteDir: store.prerequisiteDir(),
                resourceDir: store.resourceDir(),
            };
            return data;
        }

        return {
            update,
            getData,
        };
    }),
);
