'use client';

import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { setSelectedTool, addElement, setSelectedElement } from '@/lib/slices/presentationSlice';
import { savePresentation, loadPresentation } from '@/lib/utils/fileUtils';
import { ShapesPanel } from './ShapesPanel';
import type { SlideElement } from '@/lib/slices/presentationSlice';

export function Toolbar() {
    const dispatch = useAppDispatch();
    const { selectedTool } = useAppSelector((state) => state.presentation);

    const handleSave = () => {
        savePresentation();
    };

    const handleLoad = () => {
        loadPresentation(dispatch);
    };

    const handleImageUpload = () => {
        console.log('Image upload button clicked');
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';

        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                console.log('File selected:', file.name, file.type, file.size);
                const reader = new FileReader();
                reader.onload = (e) => {
                    const src = e.target?.result as string;
                    console.log('File loaded, creating image element with src length:', src.length);

                    const newElement: SlideElement = {
                        id: `image-${Date.now()}`,
                        type: 'image',
                        left: 200,
                        top: 200,
                        src,
                        width: 200,
                        height: 200,
                    };

                    console.log('Dispatching addElement for image:', newElement);
                    dispatch(addElement(newElement));
                    // Select the newly uploaded image and bring it to front
                    dispatch(setSelectedElement(newElement.id));
                };
                reader.readAsDataURL(file);
            }
        };

        input.click();
    };



    return (
        <div className="bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 py-3">
                <div className="flex items-center justify-between">
                    {/* Shapes Panel */}
                    <div className="flex items-center space-x-4">
                        <ShapesPanel />
                    </div>

                    {/* File Operations */}
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => dispatch(setSelectedTool('text'))}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-md hover:shadow-lg ${selectedTool === 'text'
                                ? 'bg-blue-600 text-white'
                                : 'bg-blue-500 text-white hover:bg-blue-600'
                                }`}
                        >
                            📝 Text
                        </button>

                        <button
                            onClick={handleImageUpload}
                            className="px-4 py-2 bg-purple-500 text-white rounded-lg text-sm font-medium hover:bg-purple-600 transition-colors shadow-md hover:shadow-lg"
                        >
                            📷 Upload Image
                        </button>

                        <button
                            onClick={handleSave}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors shadow-md hover:shadow-lg"
                        >
                            💾 Save
                        </button>
                        <button
                            onClick={handleLoad}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors shadow-md hover:shadow-lg"
                        >
                            📂 Load
                        </button>


                    </div>
                </div>
            </div>
        </div>
    );
} 