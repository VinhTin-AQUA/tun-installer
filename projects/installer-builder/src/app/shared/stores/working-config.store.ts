import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { WorkingConfigFileState } from '../../core/models/installer-config.model';

const initialState: WorkingConfigFileState = {
    content: '',
    filePath: null,
    isDirty: false,
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
                content: store.content(),
                filePath: store.filePath(),
                isDirty: store.isDirty(),
            };
            return data;
        }

        return {
            update,
            getData,
        };
    })
);
