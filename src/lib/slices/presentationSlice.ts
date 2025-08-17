import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SlideElement {
    id: string;
    type: 'image' | 'rectangle' | 'circle' | 'line' | 'text' | 'triangle' | 'star';
    left: number;
    top: number;
    width?: number;
    height?: number;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    src?: string;
    angle?: number;
    scaleX?: number;
    scaleY?: number;
    text?: string;
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: 'normal' | 'bold';
    fontStyle?: 'normal' | 'italic';
    textDecoration?: 'none' | 'underline';
    textIndent?: number;
    fontColor?: string;
    textAlign?: 'left' | 'center' | 'right';
    fillWidth?: number;
}

export interface Slide {
    id: string;
    elements: SlideElement[];
    background: string;
}

export interface PresentationState {
    slides: Slide[];
    activeSlideIndex: number;
    selectedTool: 'select' | 'image' | 'rectangle' | 'circle' | 'line' | 'text' | 'triangle' | 'star';
    selectedElementId: string | null;
}

const initialState: PresentationState = {
    slides: [
        {
            id: 'slide-1',
            elements: [],
            background: '#ffffff',
        },
    ],
    activeSlideIndex: 0,
    selectedTool: 'select',
    selectedElementId: null,
};

const presentationSlice = createSlice({
    name: 'presentation',
    initialState,
    reducers: {
        addSlide: (state) => {
            const newSlide: Slide = {
                id: `slide-${Date.now()}`,
                elements: [],
                background: '#ffffff',
            };
            state.slides.push(newSlide);
            state.activeSlideIndex = state.slides.length - 1;
        },
        deleteSlide: (state, action: PayloadAction<number>) => {
            const slideIndex = action.payload;
            if (state.slides.length > 1) {
                state.slides.splice(slideIndex, 1);
                if (state.activeSlideIndex >= slideIndex) {
                    state.activeSlideIndex = Math.max(0, state.activeSlideIndex - 1);
                }
            }
        },
        setActiveSlide: (state, action: PayloadAction<number>) => {
            state.activeSlideIndex = action.payload;
        },
        setSelectedTool: (state, action: PayloadAction<PresentationState['selectedTool']>) => {
            state.selectedTool = action.payload;
        },
        addElement: (state, action: PayloadAction<SlideElement>) => {
            console.log('Redux: Adding element:', action.payload);
            const activeSlide = state.slides[state.activeSlideIndex];
            if (activeSlide) {
                // Add new elements on top (highest z-index)
                activeSlide.elements.push(action.payload);
                console.log('Redux: Element added to slide, total elements:', activeSlide.elements.length);
            }
        },
        updateElement: (state, action: PayloadAction<{ elementId: string; updates: Partial<SlideElement> }>) => {
            const activeSlide = state.slides[state.activeSlideIndex];
            if (activeSlide) {
                const elementIndex = activeSlide.elements.findIndex(el => el.id === action.payload.elementId);
                if (elementIndex !== -1) {
                    activeSlide.elements[elementIndex] = {
                        ...activeSlide.elements[elementIndex],
                        ...action.payload.updates,
                    };
                }
            }
        },
        deleteElement: (state, action: PayloadAction<string>) => {
            const activeSlide = state.slides[state.activeSlideIndex];
            if (activeSlide) {
                activeSlide.elements = activeSlide.elements.filter(el => el.id !== action.payload);
            }
        },
        setSelectedElement: (state, action: PayloadAction<string | null>) => {
            state.selectedElementId = action.payload;

            // If selecting an element, bring it to the front (highest z-index)
            if (action.payload) {
                const activeSlide = state.slides[state.activeSlideIndex];
                if (activeSlide) {
                    // Find the selected element
                    const elementIndex = activeSlide.elements.findIndex(el => el.id === action.payload);
                    if (elementIndex !== -1) {
                        // Remove the element from its current position
                        const [selectedElement] = activeSlide.elements.splice(elementIndex, 1);
                        // Add it back at the end (highest z-index)
                        activeSlide.elements.push(selectedElement);
                    }
                }
            }
        },
        updateSlideBackground: (state, action: PayloadAction<string>) => {
            const activeSlide = state.slides[state.activeSlideIndex];
            if (activeSlide) {
                activeSlide.background = action.payload;
            }
        },
        loadPresentation: (state, action: PayloadAction<PresentationState>) => {
            return action.payload;
        },
        bringElementToFront: (state, action: PayloadAction<string>) => {
            const activeSlide = state.slides[state.activeSlideIndex];
            if (activeSlide) {
                const elementIndex = activeSlide.elements.findIndex(el => el.id === action.payload);
                if (elementIndex !== -1) {
                    // Remove the element from its current position
                    const [selectedElement] = activeSlide.elements.splice(elementIndex, 1);
                    // Add it back at the end (highest z-index)
                    activeSlide.elements.push(selectedElement);
                }
            }
        },
    },
});

export const {
    addSlide,
    deleteSlide,
    setActiveSlide,
    setSelectedTool,
    addElement,
    updateElement,
    deleteElement,
    setSelectedElement,
    updateSlideBackground,
    loadPresentation,
    bringElementToFront,
} = presentationSlice.actions;

export default presentationSlice.reducer; 