import { store } from '@/lib/store';
import { loadPresentation as loadPresentationAction } from '@/lib/slices/presentationSlice';
import type { AppDispatch } from '@/lib/store';

export const savePresentation = () => {
    const state = store.getState();
    const presentationData = state.presentation;

    const dataStr = JSON.stringify(presentationData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `presentation-${new Date().toISOString().split('T')[0]}.json`;
    link.click();

    URL.revokeObjectURL(link.href);
};

export const loadPresentation = (dispatch: AppDispatch) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const content = e.target?.result as string;
                    const presentationData = JSON.parse(content);
                    dispatch(loadPresentationAction(presentationData));
                } catch (error) {
                    console.error('Error loading presentation:', error);
                    alert('Error loading presentation file. Please make sure it\'s a valid JSON file.');
                }
            };
            reader.readAsText(file);
        }
    };

    input.click();
}; 