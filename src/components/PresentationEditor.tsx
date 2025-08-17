'use client';

import { Canvas } from './Canvas';
import { Toolbar } from './Toolbar';
import { SlidePanel } from './SlidePanel';
import { PropertiesPanel } from './PropertiesPanel';


export function PresentationEditor() {
    return (
        <div className="flex h-screen bg-gray-100">
            {/* Left Panel - Slide Thumbnails */}
            <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">M</span>
                        </div>
                        <h2 className="text-lg font-semibold text-gray-800">MetaPresenter</h2>
                    </div>
                </div>
                <SlidePanel />
            </div>

            {/* Main Canvas Area */}
            <div className="flex-1 flex flex-col">
                {/* Top Toolbar */}
                <Toolbar />

                {/* Canvas Area */}
                <div className="flex-1 flex items-center justify-center p-8">
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                        <Canvas />
                    </div>
                </div>


            </div>

            {/* Right Panel - Properties */}
            <div className="w-80 bg-white border-l border-gray-200">
                <PropertiesPanel />
            </div>
        </div>
    );
} 