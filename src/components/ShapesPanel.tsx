'use client';

import { useState } from 'react';
import { useAppDispatch } from '@/lib/hooks';
import { setSelectedTool } from '@/lib/slices/presentationSlice';

interface Shape {
    id: string;
    label: string;
    icon: string;
    color: string;
    description: string;
}

const shapes: Shape[] = [
    { id: 'rectangle', label: 'Rectangle', icon: '⬜', color: 'bg-red-500', description: 'Add a rectangle shape' },
    { id: 'circle', label: 'Circle', icon: '⭕', color: 'bg-green-500', description: 'Add a circle shape' },
    { id: 'line', label: 'Line', icon: '➖', color: 'bg-purple-500', description: 'Add a horizontal line' },
    { id: 'triangle', label: 'Triangle', icon: '🔺', color: 'bg-orange-500', description: 'Add a triangle shape' },
    { id: 'star', label: 'Star', icon: '⭐', color: 'bg-yellow-500', description: 'Add a star shape' },
];

export function ShapesPanel() {
    const [isOpen, setIsOpen] = useState(false);
    const dispatch = useAppDispatch();

    const handleShapeSelect = (shapeId: string) => {
        dispatch(setSelectedTool(shapeId as any));
        setIsOpen(false); // Close panel after selection
    };

    return (
        <div className="relative">
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md transition-colors flex items-center space-x-2"
            >
                <span>{isOpen ? '🔼' : '🔽'}</span>
                <span>Shapes</span>
            </button>

            {/* Collapsible Panel */}
            {isOpen && (
                <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-[200px] z-50">
                    <div className="grid grid-cols-1 gap-2">
                        {shapes.map((shape) => (
                            <button
                                key={shape.id}
                                onClick={() => handleShapeSelect(shape.id)}
                                className="flex items-center space-x-3 p-2 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 group w-full text-left"
                                title={shape.description}
                            >
                                <div className={`w-8 h-8 rounded-lg ${shape.color} flex items-center justify-center text-white text-sm font-bold group-hover:scale-110 transition-transform duration-200`}>
                                    {shape.icon}
                                </div>
                                <span className="text-sm font-medium text-gray-700">
                                    {shape.label}
                                </span>
                            </button>
                        ))}
                    </div>
                    <div className="mt-3 pt-2 border-t border-gray-200">
                        <p className="text-xs text-gray-500 text-center">
                            Click a shape, then click on the canvas
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
