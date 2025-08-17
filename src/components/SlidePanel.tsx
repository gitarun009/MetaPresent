'use client';

import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { addSlide, deleteSlide, setActiveSlide } from '@/lib/slices/presentationSlice';

export function SlidePanel() {
    const dispatch = useAppDispatch();
    const { slides, activeSlideIndex } = useAppSelector((state) => state.presentation);

    const handleAddSlide = () => {
        dispatch(addSlide());
    };

    const handleDeleteSlide = (index: number) => {
        dispatch(deleteSlide(index));
    };

    const handleSelectSlide = (index: number) => {
        dispatch(setActiveSlide(index));
    };

    return (
        <div className="flex-1 overflow-y-auto">
            <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">Slides</h2>
                    <span className="text-sm text-gray-500">{slides.length} total</span>
                </div>

                <div className="space-y-3">
                    {slides.map((slide, index) => (
                        <div
                            key={slide.id}
                            className={`relative cursor-pointer rounded-lg border-2 transition-all duration-200 hover:shadow-md ${index === activeSlideIndex
                                ? 'border-blue-500 bg-blue-50 shadow-lg'
                                : 'border-gray-200 hover:border-gray-300 bg-white'
                                }`}
                            onClick={() => handleSelectSlide(index)}
                        >
                            {/* Slide Thumbnail */}
                            <div className="aspect-video bg-white rounded-md p-3 relative">
                                <div
                                    className="w-full h-full rounded flex flex-col items-center justify-center"
                                    style={{ backgroundColor: slide.background }}
                                >
                                    <div className="text-2xl font-bold text-gray-700 mb-1">
                                        {index + 1}
                                    </div>
                                    <div className="text-xs text-gray-600 text-center font-medium">
                                        Slide {index + 1}
                                    </div>
                                </div>
                            </div>

                            {/* Slide info */}
                            <div className="p-2 bg-gray-50 rounded-b-md">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-600">
                                        {slide.elements.length} elements
                                    </span>
                                    {slides.length > 1 && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteSlide(index);
                                            }}
                                            className="text-red-500 hover:text-red-700 text-xs font-medium transition-colors"
                                            title="Delete slide"
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Active indicator */}
                            {index === activeSlideIndex && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Add Slide Button */}
                <button
                    onClick={handleAddSlide}
                    className="w-full mt-4 p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-all duration-200 hover:bg-blue-50"
                >
                    <div className="flex flex-col items-center">
                        <span className="text-2xl mb-1">+</span>
                        <span className="text-sm font-medium">Add New Slide</span>
                    </div>
                </button>
            </div>
        </div>
    );
} 