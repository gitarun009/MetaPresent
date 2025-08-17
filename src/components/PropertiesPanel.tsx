'use client';

import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { updateElement, updateSlideBackground, deleteElement } from '@/lib/slices/presentationSlice';

export function PropertiesPanel() {
    const dispatch = useAppDispatch();
    const { slides, activeSlideIndex, selectedElementId } = useAppSelector(
        (state) => state.presentation
    );

    const activeSlide = slides[activeSlideIndex];
    const selectedElement = activeSlide?.elements.find(el => el.id === selectedElementId);

    const handleElementPropertyChange = (property: string, value: string | number) => {
        if (selectedElementId) {
            const updates: any = { [property]: value };

            // Auto-resize text elements when text content or formatting changes
            if (selectedElement?.type === 'text' &&
                (property === 'text' || property === 'fontSize' || property === 'fontWeight' ||
                    property === 'fontStyle' || property === 'fontFamily')) {

                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    // Get current text properties (use new value for the property being changed)
                    const currentText = property === 'text' ? (value as string) : (selectedElement.text || 'Sample Text');
                    const currentFontSize = property === 'fontSize' ? (value as number) : (selectedElement.fontSize || 16);
                    const currentFontFamily = property === 'fontFamily' ? (value as string) : (selectedElement.fontFamily || 'Arial');
                    const currentFontWeight = property === 'fontWeight' ? (value as string) : (selectedElement.fontWeight || 'normal');
                    const currentFontStyle = property === 'fontStyle' ? (value as string) : (selectedElement.fontStyle || 'normal');

                    // Build font string
                    let fontString = '';
                    if (currentFontStyle === 'italic') fontString += 'italic ';
                    if (currentFontWeight === 'bold') fontString += 'bold ';
                    fontString += `${currentFontSize}px ${currentFontFamily}`;

                    ctx.font = fontString;

                    // Calculate optimal dimensions considering text wrapping
                    const padding = 20; // Padding around text
                    const minWidth = 150; // Minimum width
                    const maxWidth = 600; // Maximum width (to prevent excessive expansion)
                    const minHeight = 60; // Minimum height

                    // Split text into lines and calculate the widest line
                    const lines = currentText.split('\n');
                    let maxLineWidth = 0;

                    lines.forEach(line => {
                        const lineWidth = ctx.measureText(line).width;
                        maxLineWidth = Math.max(maxLineWidth, lineWidth);
                    });

                    // Calculate optimal dimensions
                    const optimalWidth = Math.max(minWidth, Math.min(maxWidth, maxLineWidth + padding * 2));

                    // Calculate height based on number of lines
                    const lineHeight = currentFontSize * 1.2; // Line height with spacing
                    const totalHeight = lines.length * lineHeight + padding * 2;
                    const optimalHeight = Math.max(minHeight, totalHeight);

                    updates.width = optimalWidth;
                    updates.height = optimalHeight;
                }
            }

            dispatch(updateElement({
                elementId: selectedElementId,
                updates
            }));
        }
    };

    // Helper function to handle numeric input changes with proper empty value handling
    const handleNumericChange = (property: string, value: string) => {
        if (value === '') {
            // If the field is empty, set the property to null/undefined to use default
            handleElementPropertyChange(property, null as any);
        } else {
            const numValue = Number(value);
            if (!isNaN(numValue)) {
                handleElementPropertyChange(property, numValue);
            }
        }
    };

    const handleDeleteElement = () => {
        if (selectedElementId) {
            dispatch(deleteElement(selectedElementId));
        }
    };

    const handleBackgroundChange = (color: string) => {
        dispatch(updateSlideBackground(color));
    };

    const backgroundColors = [
        { name: 'White', value: '#ffffff' },
        { name: 'Light Gray', value: '#f3f4f6' },
        { name: 'Gray', value: '#e5e7eb' },
        { name: 'Dark Gray', value: '#d1d5db' },
        { name: 'Blue', value: '#dbeafe' },
        { name: 'Green', value: '#dcfce7' },
        { name: 'Yellow', value: '#fef3c7' },
        { name: 'Pink', value: '#fce7f3' },
    ];

    return (
        <div className="h-full flex flex-col bg-white">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-800">Properties</h3>
                <p className="text-sm text-gray-600 mt-1">
                    {selectedElement ? `Editing ${selectedElement.type}` : 'Select an element to edit'}
                </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Slide Background */}
                <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Slide Background</h4>
                    <div className="grid grid-cols-4 gap-2">
                        {backgroundColors.map((color) => (
                            <button
                                key={color.value}
                                onClick={() => handleBackgroundChange(color.value)}
                                className={`w-12 h-12 rounded-lg border-2 transition-all ${activeSlide?.background === color.value
                                    ? 'border-blue-500 scale-110 shadow-lg'
                                    : 'border-gray-300 hover:border-gray-400 hover:scale-105'
                                    }`}
                                style={{ backgroundColor: color.value }}
                                title={color.name}
                            />
                        ))}
                    </div>

                    {/* Custom Background Color */}
                    <div className="mt-3">
                        <label className="block text-xs text-gray-600 mb-2 font-medium">Custom Background Color</label>
                        <input
                            type="color"
                            value={activeSlide?.background || '#ffffff'}
                            onChange={(e) => handleBackgroundChange(e.target.value)}
                            className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
                        />
                    </div>
                </div>

                {/* Element Properties */}
                {selectedElement && (
                    <div className="space-y-6">
                        <div className="bg-blue-50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-sm font-medium text-blue-800">Element Properties</h4>
                                <button
                                    onClick={handleDeleteElement}
                                    className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
                                >
                                    🗑️ Delete
                                </button>
                            </div>



                            {/* Size (for shapes and text) */}
                            {(selectedElement.type === 'rectangle' || selectedElement.type === 'circle' || selectedElement.type === 'text') && (
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1 font-medium">Width</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={selectedElement.width || 100}
                                            onChange={(e) => handleNumericChange('width', e.target.value)}
                                            onFocus={(e) => e.target.select()}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-black placeholder-gray-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1 font-medium">Height</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={selectedElement.height || 100}
                                            onChange={(e) => handleNumericChange('height', e.target.value)}
                                            onFocus={(e) => e.target.select()}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-black placeholder-gray-500"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Text Properties */}
                            {selectedElement.type === 'text' && (
                                <div className="space-y-3 mb-4">
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1 font-medium">Text Content</label>
                                        <textarea
                                            value={selectedElement.text || ''}
                                            onChange={(e) => handleElementPropertyChange('text', e.target.value)}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-black placeholder-gray-500"
                                            rows={3}
                                        />
                                    </div>



                                    {/* Text Formatting Options */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs text-gray-600 mb-1 font-medium">Font Size</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={selectedElement.fontSize || 16}
                                                onChange={(e) => handleNumericChange('fontSize', e.target.value)}
                                                onFocus={(e) => e.target.select()}
                                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-black placeholder-gray-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-600 mb-1 font-medium">Indentation</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={selectedElement.textIndent || 0}
                                                onChange={(e) => handleNumericChange('textIndent', e.target.value)}
                                                onFocus={(e) => e.target.select()}
                                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-black placeholder-gray-500"
                                            />
                                        </div>
                                    </div>

                                    {/* Text Alignment */}
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-2 font-medium">Text Alignment</label>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleElementPropertyChange('textAlign', 'left')}
                                                className={`px-3 py-2 text-xs rounded-md transition-all ${selectedElement.textAlign === 'left' || !selectedElement.textAlign
                                                    ? 'bg-blue-500 text-white'
                                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                    }`}
                                            >
                                                Left
                                            </button>
                                            <button
                                                onClick={() => handleElementPropertyChange('textAlign', 'center')}
                                                className={`px-3 py-2 text-xs rounded-md transition-all ${selectedElement.textAlign === 'center'
                                                    ? 'bg-blue-500 text-white'
                                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                    }`}
                                            >
                                                Center
                                            </button>
                                            <button
                                                onClick={() => handleElementPropertyChange('textAlign', 'right')}
                                                className={`px-3 py-2 text-xs rounded-md transition-all ${selectedElement.textAlign === 'right'
                                                    ? 'bg-blue-500 text-white'
                                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                    }`}
                                            >
                                                Right
                                            </button>
                                        </div>
                                    </div>

                                    {/* Font Color */}
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-2 font-medium">Font Color</label>
                                        <input
                                            type="color"
                                            value={selectedElement.fontColor || '#000000'}
                                            onChange={(e) => handleElementPropertyChange('fontColor', e.target.value)}
                                            className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
                                        />
                                    </div>

                                    {/* Fill Width */}
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1 font-medium">Fill Width</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={selectedElement.fillWidth || 8}
                                            onChange={(e) => handleNumericChange('fillWidth', e.target.value)}
                                            onFocus={(e) => e.target.select()}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-black placeholder-gray-500"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Padding around text background (in pixels)</p>
                                    </div>

                                    {/* Text Style Toggles */}
                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-4">
                                            <label className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedElement.fontWeight === 'bold'}
                                                    onChange={(e) => handleElementPropertyChange('fontWeight', e.target.checked ? 'bold' : 'normal')}
                                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                />
                                                <span className="text-xs text-gray-600 font-medium">Bold</span>
                                            </label>

                                            <label className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedElement.fontStyle === 'italic'}
                                                    onChange={(e) => handleElementPropertyChange('fontStyle', e.target.checked ? 'italic' : 'normal')}
                                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                />
                                                <span className="text-xs text-gray-600 font-medium">Italic</span>
                                            </label>

                                            <label className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedElement.textDecoration === 'underline'}
                                                    onChange={(e) => handleElementPropertyChange('textDecoration', e.target.checked ? 'underline' : 'none')}
                                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                />
                                                <span className="text-xs text-gray-600 font-medium">Underline</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Color Properties */}
                            <div className="space-y-3">
                                {/* Fill Color - Only for shapes and text, not for lines or images */}
                                {selectedElement.type !== 'line' && selectedElement.type !== 'image' && (
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-2 font-medium">Fill Color</label>
                                        <input
                                            type="color"
                                            value={selectedElement.fill || '#000000'}
                                            onChange={(e) => handleElementPropertyChange('fill', e.target.value)}
                                            className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
                                        />
                                    </div>
                                )}

                                {/* Stroke Color - Only for lines, not for shapes or text */}
                                {selectedElement.type === 'line' && (
                                    <div className="space-y-2">
                                        <label className="block text-xs text-gray-600 mb-2 font-medium">Stroke Color</label>
                                        <input
                                            type="color"
                                            value={selectedElement.stroke || '#000000'}
                                            onChange={(e) => handleElementPropertyChange('stroke', e.target.value)}
                                            className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
                                        />
                                        <div>
                                            <label className="block text-xs text-gray-600 mb-1 font-medium">Stroke Width</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={selectedElement.strokeWidth || 0}
                                                onChange={(e) => handleNumericChange('strokeWidth', e.target.value)}
                                                onFocus={(e) => e.target.select()}
                                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-black placeholder-gray-500"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {!selectedElement && (
                    <div className="text-center text-gray-500 py-12">
                        <div className="text-4xl mb-4">👆</div>
                        <p className="text-sm font-medium">Select an element to edit its properties</p>
                        <p className="text-xs text-gray-400 mt-1">Click on any element on the canvas</p>
                    </div>
                )}
            </div>
        </div>
    );
} 