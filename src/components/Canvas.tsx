'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import {
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
    DEFAULT_RECTANGLE_WIDTH,
    DEFAULT_RECTANGLE_HEIGHT,
    DEFAULT_CIRCLE_SIZE,
    DEFAULT_TRIANGLE_SIZE,
    DEFAULT_STAR_SIZE,
    DEFAULT_LINE_WIDTH,
    DEFAULT_IMAGE_WIDTH,
    DEFAULT_IMAGE_HEIGHT,
    DEFAULT_TEXT_WIDTH,
    DEFAULT_TEXT_HEIGHT,
    DEFAULT_FONT_SIZE,
    DEFAULT_FONT_WEIGHT,
    DEFAULT_FONT_STYLE,
    DEFAULT_TEXT_DECORATION,
    DEFAULT_TEXT_INDENT
} from '@/lib/constants';
import {
    addElement,
    updateElement,
    setSelectedElement,
    setSelectedTool,
    setActiveSlide,
    bringElementToFront,
    deleteElement
} from '@/lib/slices/presentationSlice';
import type { SlideElement } from '@/lib/slices/presentationSlice';



const drawRectangle = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, fill: string = '#ff0000') => {
    ctx.fillStyle = fill;
    ctx.fillRect(x, y, width, height);
};

const drawCircle = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, fill: string = '#00ff00') => {
    ctx.beginPath();
    ctx.arc(x + radius, y + radius, radius, 0, 2 * Math.PI);
    ctx.fillStyle = fill;
    ctx.fill();
};

const drawTriangle = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, fill: string = '#ff8800') => {
    ctx.beginPath();
    ctx.moveTo(x + size / 2, y);
    ctx.lineTo(x, y + size);
    ctx.lineTo(x + size, y + size);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
};

const drawStar = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, fill: string = '#ffdd00') => {
    const spikes = 5;
    const outerRadius = size / 2;
    const innerRadius = outerRadius * 0.4;

    ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (i * Math.PI) / spikes;
        const px = x + size / 2 + radius * Math.cos(angle - Math.PI / 2);
        const py = y + size / 2 + radius * Math.sin(angle - Math.PI / 2);

        if (i === 0) {
            ctx.moveTo(px, py);
        } else {
            ctx.lineTo(px, py);
        }
    }
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
};

const drawSelectionBorder = (ctx: CanvasRenderingContext2D, element: SlideElement) => {
    ctx.strokeStyle = '#0066ff';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);

    switch (element.type) {

        case 'rectangle':
            ctx.strokeRect(element.left - 3, element.top - 3, (element.width || 100) + 6, (element.height || 100) + 6);
            break;
        case 'circle':
            const radius = (element.width || 100) / 2;
            ctx.strokeRect(element.left - 3, element.top - 3, radius * 2 + 6, radius * 2 + 6);
            break;
        case 'line':
            // Use actual line width for selection border
            const lineWidth = element.width || 100;
            ctx.strokeRect(element.left - 3, element.top - 8, lineWidth + 6, 16);
            break;
        case 'image':
            ctx.strokeRect(element.left - 3, element.top - 3, (element.width || 200) + 6, (element.height || 200) + 6);
            break;
        case 'text':
            ctx.strokeRect(element.left - 3, element.top - 3, (element.width || DEFAULT_TEXT_WIDTH) + 6, (element.height || DEFAULT_TEXT_HEIGHT) + 6);
            break;
        case 'triangle':
            const triangleSize = element.width || DEFAULT_TRIANGLE_SIZE;
            ctx.strokeRect(element.left - 3, element.top - 3, triangleSize + 6, triangleSize + 6);
            break;
        case 'star':
            const starSize = element.width || DEFAULT_STAR_SIZE;
            ctx.strokeRect(element.left - 3, element.top - 3, starSize + 6, starSize + 6);
            break;
    }

    ctx.setLineDash([]);
};

const drawResizeHandles = (ctx: CanvasRenderingContext2D, element: SlideElement) => {
    ctx.fillStyle = '#0066ff';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;

    const handleSize = 12; // Visual size of the handles

    switch (element.type) {
        case 'rectangle':
            const width = element.width || 100;
            const height = element.height || 100;

            // Corner handles
            drawHandle(ctx, element.left, element.top, handleSize);
            drawHandle(ctx, element.left + width, element.top, handleSize);
            drawHandle(ctx, element.left, element.top + height, handleSize);
            drawHandle(ctx, element.left + width, element.top + height, handleSize);

            // Edge handles
            drawHandle(ctx, element.left + width / 2, element.top, handleSize);
            drawHandle(ctx, element.left + width / 2, element.top + height, handleSize);
            drawHandle(ctx, element.left, element.top + height / 2, handleSize);
            drawHandle(ctx, element.left + width, element.top + height / 2, handleSize);
            break;

        case 'circle':
            const radius = (element.width || 100) / 2;
            drawHandle(ctx, element.left, element.top, handleSize);
            drawHandle(ctx, element.left + radius * 2, element.top, handleSize);
            drawHandle(ctx, element.left, element.top + radius * 2, handleSize);
            drawHandle(ctx, element.left + radius * 2, element.top + radius * 2, handleSize);
            break;

        case 'line':
            // Use actual line width for resize handles
            const lineWidth = element.width || 100;
            drawHandle(ctx, element.left, element.top, handleSize);
            drawHandle(ctx, element.left + lineWidth, element.top, handleSize);
            break;
        case 'image':
            const imgWidth = element.width || 200;
            const imgHeight = element.height || 200;

            // Corner handles
            drawHandle(ctx, element.left, element.top, handleSize);
            drawHandle(ctx, element.left + imgWidth, element.top, handleSize);
            drawHandle(ctx, element.left, element.top + imgHeight, handleSize);
            drawHandle(ctx, element.left + imgWidth, element.top + imgHeight, handleSize);

            // Edge handles
            drawHandle(ctx, element.left + imgWidth / 2, element.top, handleSize);
            drawHandle(ctx, element.left + imgWidth / 2, element.top + imgHeight, handleSize);
            drawHandle(ctx, element.left, element.top + imgHeight / 2, handleSize);
            drawHandle(ctx, element.left + imgWidth, element.top + imgHeight / 2, handleSize);
            break;
        case 'text':
            const textWidth = element.width || DEFAULT_TEXT_WIDTH;
            const textHeight = element.height || DEFAULT_TEXT_HEIGHT;

            // Corner handles
            drawHandle(ctx, element.left, element.top, handleSize);
            drawHandle(ctx, element.left + textWidth, element.top, handleSize);
            drawHandle(ctx, element.left, element.top + textHeight, handleSize);
            drawHandle(ctx, element.left + textWidth, element.top + textHeight, handleSize);

            // Edge handles
            drawHandle(ctx, element.left + textWidth / 2, element.top, handleSize);
            drawHandle(ctx, element.left + textWidth / 2, element.top + textHeight, handleSize);
            drawHandle(ctx, element.left, element.top + textHeight / 2, handleSize);
            drawHandle(ctx, element.left + textWidth, element.top + textHeight / 2, handleSize);
            break;
        case 'triangle':
            const triangleSize = element.width || DEFAULT_TRIANGLE_SIZE;
            // Corner handles
            drawHandle(ctx, element.left, element.top, handleSize);
            drawHandle(ctx, element.left + triangleSize, element.top, handleSize);
            drawHandle(ctx, element.left, element.top + triangleSize, handleSize);
            drawHandle(ctx, element.left + triangleSize, element.top + triangleSize, handleSize);
            break;
        case 'star':
            const starSize = element.width || DEFAULT_STAR_SIZE;
            // Corner handles
            drawHandle(ctx, element.left, element.top, handleSize);
            drawHandle(ctx, element.left + starSize, element.top, handleSize);
            drawHandle(ctx, element.left, element.top + starSize, handleSize);
            drawHandle(ctx, element.left + starSize, element.top + starSize, handleSize);
            break;
    }
};

const drawHandle = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
    ctx.fillRect(x - size / 2, y - size / 2, size, size);
    ctx.strokeRect(x - size / 2, y - size / 2, size, size);
};

export function Canvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const dispatch = useAppDispatch();
    const [isResizing, setIsResizing] = useState(false);
    const [resizeHandle, setResizeHandle] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [editingTextId, setEditingTextId] = useState<string | null>(null);
    const [editingTextValue, setEditingTextValue] = useState('');

    const { slides, activeSlideIndex, selectedTool, selectedElementId } = useAppSelector(
        (state) => state.presentation
    );

    const activeSlide = slides[activeSlideIndex];

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return; // Don't handle keyboard events when typing in input fields
            }

            switch (e.key) {
                case 'ArrowLeft':
                    if (activeSlideIndex > 0) {
                        e.preventDefault();
                        dispatch(setActiveSlide(activeSlideIndex - 1));
                    }
                    break;
                case 'ArrowRight':
                    if (activeSlideIndex < slides.length - 1) {
                        e.preventDefault();
                        dispatch(setActiveSlide(activeSlideIndex + 1));
                    }
                    break;
                case 'Backspace':
                case 'Delete':
                    if (selectedElementId) {
                        e.preventDefault();
                        dispatch(deleteElement(selectedElementId));
                        dispatch(setSelectedElement(null));
                    }
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activeSlideIndex, slides.length, selectedElementId, dispatch]);

    // Initialize canvas
    useEffect(() => {
        if (canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                // Set canvas size
                canvas.width = CANVAS_WIDTH;
                canvas.height = CANVAS_HEIGHT;

                // Set background
                ctx.fillStyle = activeSlide?.background || '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                console.log('Canvas initialized with size:', canvas.width, 'x', canvas.height);
            }
        }
    }, []);

    // Update canvas when slide or background changes
    useEffect(() => {
        if (canvasRef.current && activeSlide) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                // Clear canvas
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // Set background
                ctx.fillStyle = activeSlide.background;
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Draw all elements first
                activeSlide.elements.forEach(element => {
                    switch (element.type) {
                        case 'rectangle':
                            drawRectangle(ctx, element.left, element.top, element.width || 100, element.height || 100, element.fill);
                            break;
                        case 'circle':
                            drawCircle(ctx, element.left, element.top, (element.width || 100) / 2, element.fill);
                            break;
                        case 'triangle':
                            drawTriangle(ctx, element.left, element.top, element.width || DEFAULT_TRIANGLE_SIZE, element.fill);
                            break;
                        case 'star':
                            drawStar(ctx, element.left, element.top, element.width || DEFAULT_STAR_SIZE, element.fill);
                            break;
                        case 'line':
                            ctx.beginPath();
                            ctx.moveTo(element.left, element.top);
                            ctx.lineTo(element.left + (element.width || 100), element.top);
                            ctx.strokeStyle = element.stroke || '#000000';
                            ctx.lineWidth = element.strokeWidth || 2;
                            ctx.stroke();
                            break;
                        case 'image':
                            console.log('Rendering image element:', element);
                            if (element.src) {
                                const img = new Image();
                                img.onload = () => {
                                    console.log('Image loaded, drawing to canvas');
                                    ctx.drawImage(img, element.left, element.top, element.width || 200, element.height || 200);
                                };
                                img.onerror = (e) => {
                                    console.error('Error loading image:', e);
                                };
                                img.src = element.src;
                            } else {
                                console.warn('Image element has no src:', element);
                            }
                            break;
                        case 'text':
                            // Build font string with all formatting options
                            const fontStyle = element.fontStyle || DEFAULT_FONT_STYLE;
                            const fontWeight = element.fontWeight || DEFAULT_FONT_WEIGHT;
                            const fontSize = element.fontSize || DEFAULT_FONT_SIZE;
                            const fontFamily = element.fontFamily || 'Arial';

                            // Draw text background if fill color is set and not black (default text color)
                            if (element.fill && element.fill !== '#000000') {
                                const elementWidth = element.width || DEFAULT_TEXT_WIDTH;
                                const elementHeight = element.height || DEFAULT_TEXT_HEIGHT;
                                const fillWidth = element.fillWidth || 8;

                                // Background should cover the entire element area
                                ctx.fillStyle = element.fill;
                                ctx.fillRect(
                                    element.left - fillWidth,
                                    element.top - fillWidth,
                                    elementWidth + fillWidth * 2,
                                    elementHeight + fillWidth * 2
                                );
                            }

                            ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
                            // Use fontColor if set, otherwise use black text if background is set, otherwise use the fill color
                            ctx.fillStyle = element.fontColor || (element.fill && element.fill !== '#000000' ? '#000000' : (element.fill || '#000000'));

                            // Apply text decoration (underline)
                            if (element.textDecoration === 'underline') {
                                const textWidth = ctx.measureText(element.text || 'Sample Text').width;
                                const textAlign = element.textAlign || 'center';
                                const elementWidth = element.width || DEFAULT_TEXT_WIDTH;
                                const textIndent = element.textIndent || DEFAULT_TEXT_INDENT;

                                // Calculate underline position to align with text (same logic as text positioning)
                                let underlineLeft = element.left;
                                if (textAlign === 'center') {
                                    underlineLeft = element.left + (elementWidth / 2) - (textWidth / 2) + textIndent;
                                } else if (textAlign === 'right') {
                                    underlineLeft = element.left + elementWidth - textWidth - textIndent;
                                } else {
                                    // Left alignment
                                    underlineLeft = element.left + textIndent;
                                }

                                // Position underline below text with proper spacing
                                // Use the same text baseline calculation as the text drawing
                                const elementHeight = element.height || DEFAULT_TEXT_HEIGHT;
                                const textBaselineY = element.top + (elementHeight / 2) + (fontSize / 2);
                                const underlineY = textBaselineY + 8; // 8px below text baseline for proper spacing

                                ctx.strokeStyle = element.fontColor || ctx.fillStyle;
                                ctx.lineWidth = 1;
                                ctx.beginPath();
                                // Extend underline slightly beyond text for better visual balance
                                ctx.moveTo(underlineLeft - 4, underlineY);
                                ctx.lineTo(underlineLeft + textWidth + 4, underlineY);
                                ctx.stroke();
                            }

                            // Draw text with proper wrapping within the element
                            const textIndent = element.textIndent || DEFAULT_TEXT_INDENT;
                            const elementWidth = element.width || DEFAULT_TEXT_WIDTH;
                            const elementHeight = element.height || DEFAULT_TEXT_HEIGHT;
                            const textAlign = element.textAlign || 'center';

                            // Split text into lines first (handle newlines), then handle word wrapping
                            const textContent = element.text || 'Sample Text';
                            const initialLines = textContent.split('\n');
                            const lines: string[] = [];

                            initialLines.forEach(initialLine => {
                                if (initialLine.trim() === '') {
                                    // Empty line, add it as is
                                    lines.push('');
                                    return;
                                }

                                const words = initialLine.trim().split(' ');
                                let currentLine = '';

                                for (const word of words) {
                                    const testLine = currentLine ? currentLine + ' ' + word : word;
                                    const testWidth = ctx.measureText(testLine).width;
                                    const availableWidth = elementWidth - (textIndent * 2); // Account for left and right indentation

                                    if (testWidth > availableWidth) {
                                        if (currentLine) {
                                            lines.push(currentLine);
                                            currentLine = word;
                                        } else {
                                            // Single word is too long, break it
                                            lines.push(word);
                                        }
                                    } else {
                                        currentLine = testLine;
                                    }
                                }
                                if (currentLine) {
                                    lines.push(currentLine);
                                }
                            });

                            // If no lines were created (empty text), create a default line
                            if (lines.length === 0) {
                                lines.push('Sample Text');
                            }



                            // Calculate starting Y position for centered text
                            const totalTextHeight = lines.length * fontSize;
                            const lineSpacing = fontSize * 0.2; // 20% of font size for spacing
                            const totalHeight = totalTextHeight + (lines.length - 1) * lineSpacing;
                            const startY = element.top + (elementHeight / 2) - (totalHeight / 2) + fontSize;

                            // Draw each line
                            lines.forEach((line, index) => {
                                const lineWidth = ctx.measureText(line).width;
                                let textX = element.left;

                                if (textAlign === 'center') {
                                    textX = element.left + (elementWidth / 2) - (lineWidth / 2) + textIndent;
                                } else if (textAlign === 'right') {
                                    textX = element.left + elementWidth - lineWidth - textIndent;
                                } else {
                                    // Left alignment
                                    textX = element.left + textIndent;
                                }

                                const textY = startY + index * (fontSize + lineSpacing);

                                ctx.fillText(line, textX, textY);
                            });
                            break;
                    }
                });

                // Draw selection borders and resize handles on top of all elements
                activeSlide.elements.forEach(element => {
                    const isSelected = element.id === selectedElementId;
                    if (isSelected) {
                        drawSelectionBorder(ctx, element);
                        drawResizeHandles(ctx, element);
                    }
                });

                console.log('Canvas updated with', activeSlide.elements.length, 'elements');
            }
        }
    }, [activeSlide, activeSlideIndex, selectedElementId]);



    // Find element at position
    const findElementAtPosition = (x: number, y: number): SlideElement | null => {
        if (!activeSlide) return null;

        // Check elements in reverse order (top to bottom)
        for (let i = activeSlide.elements.length - 1; i >= 0; i--) {
            const element = activeSlide.elements[i];
            if (isPointInElement(x, y, element)) {
                return element;
            }
        }
        return null;
    };

    // Check if point is inside element
    const isPointInElement = (x: number, y: number, element: SlideElement): boolean => {
        switch (element.type) {
            case 'rectangle':
                return x >= element.left && x <= element.left + (element.width || 100) &&
                    y >= element.top && y <= element.top + (element.height || 100);
            case 'circle':
                const radius = (element.width || 100) / 2;
                const centerX = element.left + radius;
                const centerY = element.top + radius;
                const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
                return distance <= radius;
            case 'line':
                const lineWidth = element.width || 100;
                return x >= element.left && x <= element.left + lineWidth &&
                    y >= element.top - 5 && y <= element.top + 5;
            case 'image':
                return x >= element.left && x <= element.left + (element.width || 200) &&
                    y >= element.top && y <= element.top + (element.height || 200);
            case 'text':
                return x >= element.left && x <= element.left + (element.width || DEFAULT_TEXT_WIDTH) &&
                    y >= element.top && y <= element.top + (element.height || DEFAULT_TEXT_HEIGHT);
            case 'triangle':
                const triangleSize = element.width || DEFAULT_TRIANGLE_SIZE;
                return x >= element.left && x <= element.left + triangleSize &&
                    y >= element.top && y <= element.top + triangleSize;
            case 'star':
                const starSize = element.width || DEFAULT_STAR_SIZE;
                return x >= element.left && x <= element.left + starSize &&
                    y >= element.top && y <= element.top + starSize;
            default:
                return false;
        }
    };



    // Mouse event handlers for resizing and dragging
    const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Check if double-clicking on a text element
        const clickedElement = findElementAtPosition(x, y);
        if (clickedElement && clickedElement.type === 'text') {
            // For now, just select the text element
            // Text editing can be done through the properties panel
            dispatch(setSelectedElement(clickedElement.id));
            e.preventDefault();
            return;
        }
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // First, check if clicking on an element to select it (instant selection)
        const clickedElement = findElementAtPosition(x, y);
        if (clickedElement) {
            // Always select the element first
            dispatch(setSelectedElement(clickedElement.id));
            // Bring the clicked element to the front
            dispatch(bringElementToFront(clickedElement.id));

            // Check if clicking on resize handle (with larger hit area)
            const handle = getResizeHandle(x, y, clickedElement.id);
            if (handle) {
                console.log('Starting resize with handle:', handle, 'for element:', clickedElement.id);
                setIsResizing(true);
                setResizeHandle(handle);
                e.preventDefault();
                return;
            }

            // Check if clicking on the element itself (for dragging)
            if (isPointInElement(x, y, clickedElement)) {
                console.log('Starting drag for element:', clickedElement.id);
                setIsDragging(true);
                setDragStart({ x: x - clickedElement.left, y: y - clickedElement.top });
                e.preventDefault();
                return;
            }
        } else if (!isResizing && !isDragging) {
            // Clicked on empty space, deselect (but not when resizing or dragging)
            dispatch(setSelectedElement(null));
        }

        // If not resizing or dragging, and not adding new elements, return
        if (!selectedTool || selectedTool === 'select') return;

        // Add new element
        console.log('Canvas clicked at:', x, y, 'with tool:', selectedTool);
        // Calculate optimal dimensions for text elements
        let elementWidth = selectedTool === 'rectangle' ? DEFAULT_RECTANGLE_WIDTH :
            selectedTool === 'circle' ? DEFAULT_CIRCLE_SIZE :
                selectedTool === 'triangle' ? DEFAULT_TRIANGLE_SIZE :
                    selectedTool === 'star' ? DEFAULT_STAR_SIZE :
                        selectedTool === 'line' ? DEFAULT_LINE_WIDTH :
                            selectedTool === 'image' ? DEFAULT_IMAGE_WIDTH :
                                selectedTool === 'text' ? DEFAULT_TEXT_WIDTH : undefined;

        let elementHeight = selectedTool === 'rectangle' ? DEFAULT_RECTANGLE_HEIGHT :
            selectedTool === 'circle' ? DEFAULT_CIRCLE_SIZE :
                selectedTool === 'triangle' ? DEFAULT_TRIANGLE_SIZE :
                    selectedTool === 'star' ? DEFAULT_STAR_SIZE :
                        selectedTool === 'image' ? DEFAULT_IMAGE_HEIGHT :
                            selectedTool === 'text' ? DEFAULT_TEXT_HEIGHT : undefined;

        // For text elements, calculate optimal dimensions based on content
        if (selectedTool === 'text') {
            const canvas = canvasRef.current;
            if (canvas) {
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    const fontSize = DEFAULT_FONT_SIZE;
                    const fontFamily = 'Arial';
                    const fontWeight = DEFAULT_FONT_WEIGHT;
                    const fontStyle = DEFAULT_FONT_STYLE;

                    // Build font string - default values are 'normal' so no need to check
                    const fontString = `${fontSize}px ${fontFamily}`;

                    ctx.font = fontString;
                    const textMetrics = ctx.measureText('Sample Text');

                    // Calculate optimal dimensions with padding
                    const padding = 20; // Padding around text
                    const minWidth = 150; // Minimum width
                    const maxWidth = 400; // Maximum width to prevent excessive expansion
                    const minHeight = 60; // Minimum height

                    elementWidth = Math.max(minWidth, Math.min(maxWidth, textMetrics.width + padding * 2));
                    elementHeight = Math.max(minHeight, fontSize + padding * 2);
                }
            }
        }

        const newElement: SlideElement = {
            id: `element-${Date.now()}`,
            type: selectedTool,
            left: x,
            top: y,
            width: elementWidth,
            height: elementHeight,
            text: selectedTool === 'text' ? 'Sample Text' : undefined,
            fontSize: selectedTool === 'text' ? DEFAULT_FONT_SIZE : undefined,
            fontFamily: selectedTool === 'text' ? 'Arial' : undefined,
            fontWeight: selectedTool === 'text' ? DEFAULT_FONT_WEIGHT : undefined,
            fontStyle: selectedTool === 'text' ? DEFAULT_FONT_STYLE : undefined,
            textDecoration: selectedTool === 'text' ? DEFAULT_TEXT_DECORATION : undefined,
            textIndent: selectedTool === 'text' ? DEFAULT_TEXT_INDENT : undefined,
        };

        dispatch(addElement(newElement));
        // Select the newly created element and bring it to front
        dispatch(setSelectedElement(newElement.id));
        dispatch(bringElementToFront(newElement.id));
        // Switch back to select tool after adding element
        dispatch(setSelectedTool('select'));
    };



    const handleMouseUp = () => {
        if (isResizing) {
            console.log('Mouse up - ending resize for element:', selectedElementId);
        }
        if (isDragging) {
            console.log('Mouse up - ending drag for element:', selectedElementId);
        }
        setIsResizing(false);
        setResizeHandle(null);
        setIsDragging(false);
    };

    // Handle mouse enter to reset cursor
    const handleMouseEnter = () => {
        // Reset cursor when entering canvas
    };

    // Enhanced mouse move with cursor changes for resize handles
    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (isResizing && selectedElementId && resizeHandle) {
            console.log('Mouse move during resize:', selectedElementId, resizeHandle, x, y);
            resizeElement(selectedElementId, resizeHandle, x, y);
        } else if (isDragging && selectedElementId) {
            const element = activeSlide?.elements.find(el => el.id === selectedElementId);
            if (element) {
                const newLeft = x - dragStart.x;
                const newTop = y - dragStart.y;

                // Keep element within canvas bounds
                const maxLeft = canvas.width - (element.width || 100);
                const maxTop = canvas.height - (element.height || 100);

                const clampedLeft = Math.max(0, Math.min(newLeft, maxLeft));
                const clampedTop = Math.max(0, Math.min(newTop, maxTop));

                dispatch(updateElement({
                    elementId: selectedElementId,
                    updates: { left: clampedLeft, top: clampedTop }
                }));
            }
        } else if (selectedElementId) {
            // Check if hovering over resize handles and change cursor
            const handle = getResizeHandle(x, y, selectedElementId);
            if (handle) {
                // Change cursor based on handle type
                const cursorMap: { [key: string]: string } = {
                    'top-left': 'nw-resize',
                    'top-right': 'ne-resize',
                    'bottom-left': 'sw-resize',
                    'bottom-right': 'se-resize',
                    'top': 'n-resize',
                    'bottom': 's-resize',
                    'left': 'w-resize',
                    'right': 'e-resize',
                    'start': 'w-resize',
                    'end': 'e-resize'
                };
                canvas.style.cursor = cursorMap[handle] || 'default';
            } else {
                // Reset cursor if not hovering over handles
                canvas.style.cursor = 'default';
            }
        }
    };

    // Get resize handle at position
    const getResizeHandle = (x: number, y: number, elementId: string): string | null => {
        const element = activeSlide?.elements.find(el => el.id === elementId);
        if (!element) return null;

        const handleSize = 12; // Visual size of the handles
        let hitAreaSize = 32; // Default hit area size

        // For small elements, reduce hit area size to leave more space for dragging
        if (element.type === 'text') {
            const textWidth = element.width || DEFAULT_TEXT_WIDTH;
            const textHeight = element.height || DEFAULT_TEXT_HEIGHT;

            // If element is very small, use smaller hit areas to prioritize dragging
            if (textWidth < 300 || textHeight < 50) {
                hitAreaSize = 16; // Smaller hit area for small elements
            } else if (textWidth < 500 || textHeight < 80) {
                hitAreaSize = 24; // Medium hit area for medium elements
            }
        }

        switch (element.type) {
            case 'rectangle':
                const width = element.width || 100;
                const height = element.height || 100;

                // Check corner handles
                if (Math.abs(x - element.left) <= hitAreaSize && Math.abs(y - element.top) <= hitAreaSize) return 'top-left';
                if (Math.abs(x - (element.left + width)) <= hitAreaSize && Math.abs(y - element.top) <= hitAreaSize) return 'top-right';
                if (Math.abs(x - element.left) <= hitAreaSize && Math.abs(y - (element.top + height)) <= hitAreaSize) return 'bottom-left';
                if (Math.abs(x - (element.left + width)) <= hitAreaSize && Math.abs(y - (element.top + height)) <= hitAreaSize) return 'bottom-right';

                // Check edge handles
                if (Math.abs(x - (element.left + width / 2)) <= hitAreaSize && Math.abs(y - element.top) <= hitAreaSize) return 'top';
                if (Math.abs(x - (element.left + width / 2)) <= hitAreaSize && Math.abs(y - (element.top + height)) <= hitAreaSize) return 'bottom';
                if (Math.abs(x - element.left) <= hitAreaSize && Math.abs(y - (element.top + height / 2)) <= hitAreaSize) return 'left';
                if (Math.abs(x - (element.left + width)) <= hitAreaSize && Math.abs(y - (element.top + height / 2)) <= hitAreaSize) return 'right';
                break;

            case 'circle':
                const radius = (element.width || 100) / 2;
                console.log('Checking circle handles:', { x, y, elementLeft: element.left, elementTop: element.top, radius, handleSize });

                // Check corner handles
                if (Math.abs(x - element.left) <= hitAreaSize && Math.abs(y - element.top) <= hitAreaSize) {
                    console.log('Found top-left handle');
                    return 'top-left';
                }
                if (Math.abs(x - (element.left + radius * 2)) <= hitAreaSize && Math.abs(y - element.top) <= hitAreaSize) {
                    console.log('Found top-right handle');
                    return 'top-right';
                }
                if (Math.abs(x - element.left) <= hitAreaSize && Math.abs(y - (element.top + radius * 2)) <= hitAreaSize) {
                    console.log('Found bottom-left handle');
                    return 'bottom-left';
                }
                if (Math.abs(x - (element.left + radius * 2)) <= hitAreaSize && Math.abs(y - (element.top + radius * 2)) <= hitAreaSize) {
                    console.log('Found bottom-right handle');
                    return 'bottom-right';
                }

                // Check edge handles
                if (Math.abs(x - (element.left + radius)) <= hitAreaSize && Math.abs(y - element.top) <= hitAreaSize) {
                    console.log('Found top handle');
                    return 'top';
                }
                if (Math.abs(x - (element.left + radius)) <= hitAreaSize && Math.abs(y - (element.top + radius * 2)) <= hitAreaSize) {
                    console.log('Found bottom handle');
                    return 'bottom';
                }
                if (Math.abs(x - element.left) <= hitAreaSize && Math.abs(y - (element.top + radius)) <= hitAreaSize) {
                    console.log('Found left handle');
                    return 'left';
                }
                if (Math.abs(x - (element.left + radius * 2)) <= hitAreaSize && Math.abs(y - (element.top + radius)) <= hitAreaSize) {
                    console.log('Found right handle');
                    return 'right';
                }
                break;

            case 'line':
                // Check endpoint handles using actual line width
                const lineWidth = element.width || 100;
                if (Math.abs(x - element.left) <= hitAreaSize && Math.abs(y - element.top) <= hitAreaSize) return 'start';
                if (Math.abs(x - (element.left + lineWidth)) <= hitAreaSize && Math.abs(y - element.top) <= hitAreaSize) return 'end';
                break;
            case 'image':
                const imgWidth = element.width || 200;
                const imgHeight = element.height || 200;

                // Check corner handles
                if (Math.abs(x - element.left) <= hitAreaSize && Math.abs(y - element.top) <= hitAreaSize) return 'top-left';
                if (Math.abs(x - (element.left + imgWidth)) <= hitAreaSize && Math.abs(y - element.top) <= hitAreaSize) return 'top-right';
                if (Math.abs(x - element.left) <= hitAreaSize && Math.abs(y - (element.top + imgHeight)) <= hitAreaSize) return 'bottom-left';
                if (Math.abs(x - (element.left + imgWidth)) <= hitAreaSize && Math.abs(y - (element.top + imgHeight)) <= hitAreaSize) return 'bottom-right';

                // Check edge handles
                if (Math.abs(x - (element.left + imgWidth / 2)) <= hitAreaSize && Math.abs(y - element.top) <= hitAreaSize) return 'top';
                if (Math.abs(x - (element.left + imgWidth / 2)) <= hitAreaSize && Math.abs(y - (element.top + imgHeight)) <= hitAreaSize) return 'bottom';
                if (Math.abs(x - element.left) <= hitAreaSize && Math.abs(y - (element.top + imgHeight / 2)) <= hitAreaSize) return 'left';
                if (Math.abs(x - (element.left + imgWidth)) <= hitAreaSize && Math.abs(y - (element.top + imgHeight / 2)) <= hitAreaSize) return 'right';
                break;
            case 'text':
                const textWidth = element.width || DEFAULT_TEXT_WIDTH;
                const textHeight = element.height || DEFAULT_TEXT_HEIGHT;

                // Check corner handles
                if (Math.abs(x - element.left) <= hitAreaSize && Math.abs(y - element.top) <= hitAreaSize) return 'top-left';
                if (Math.abs(x - (element.left + textWidth)) <= hitAreaSize && Math.abs(y - element.top) <= hitAreaSize) return 'top-right';
                if (Math.abs(x - element.left) <= hitAreaSize && Math.abs(y - (element.top + textHeight)) <= hitAreaSize) return 'bottom-left';
                if (Math.abs(x - (element.left + textWidth)) <= hitAreaSize && Math.abs(y - (element.top + textHeight)) <= hitAreaSize) return 'bottom-right';

                // For very small text elements, only show corner handles to ensure draggable area
                if (textWidth < 300 || textHeight < 50) {
                    // Only corner handles for very small elements
                    break;
                }

                // Check edge handles only for larger elements
                if (Math.abs(x - (element.left + textWidth / 2)) <= hitAreaSize && Math.abs(y - element.top) <= hitAreaSize) return 'top';
                if (Math.abs(x - (element.left + textWidth / 2)) <= hitAreaSize && Math.abs(y - (element.top + textHeight)) <= hitAreaSize) return 'bottom';
                if (Math.abs(x - element.left) <= hitAreaSize && Math.abs(y - (element.top + textHeight / 2)) <= hitAreaSize) return 'left';
                if (Math.abs(x - (element.left + textWidth)) <= hitAreaSize && Math.abs(y - (element.top + textHeight / 2)) <= hitAreaSize) return 'right';
                break;
            case 'triangle':
                const triangleSize = element.width || DEFAULT_TRIANGLE_SIZE;

                // Check corner handles
                if (Math.abs(x - element.left) <= hitAreaSize && Math.abs(y - element.top) <= hitAreaSize) return 'top-left';
                if (Math.abs(x - (element.left + triangleSize)) <= hitAreaSize && Math.abs(y - element.top) <= hitAreaSize) return 'top-right';
                if (Math.abs(x - element.left) <= hitAreaSize && Math.abs(y - (element.top + triangleSize)) <= hitAreaSize) return 'bottom-left';
                if (Math.abs(x - (element.left + triangleSize)) <= hitAreaSize && Math.abs(y - (element.top + triangleSize)) <= hitAreaSize) return 'bottom-right';
                break;
            case 'star':
                const starSize = element.width || DEFAULT_STAR_SIZE;

                // Check corner handles
                if (Math.abs(x - element.left) <= hitAreaSize && Math.abs(y - element.top) <= hitAreaSize) return 'top-left';
                if (Math.abs(x - (element.left + starSize)) <= hitAreaSize && Math.abs(y - element.top) <= hitAreaSize) return 'top-right';
                if (Math.abs(x - element.left) <= hitAreaSize && Math.abs(y - (element.top + starSize)) <= hitAreaSize) return 'bottom-left';
                if (Math.abs(x - (element.left + starSize)) <= hitAreaSize && Math.abs(y - (element.top + starSize)) <= hitAreaSize) return 'bottom-right';
                break;
        }

        return null;
    };

    // Resize element
    const resizeElement = (elementId: string, handle: string, x: number, y: number) => {
        const element = activeSlide?.elements.find(el => el.id === elementId);
        if (!element) return;

        let updates: Partial<SlideElement> = {};

        switch (handle) {
            case 'top-left':
                updates.left = x;
                updates.top = y;
                if (element.type === 'rectangle') {
                    updates.width = Math.max(20, (element.left + (element.width || 100)) - x);
                    updates.height = Math.max(20, (element.top + (element.height || 100)) - y);
                } else if (element.type === 'circle') {
                    // For circles, resize from center - much simpler and more reliable
                    const centerX = element.left + (element.width || DEFAULT_CIRCLE_SIZE) / 2;
                    const centerY = element.top + (element.height || DEFAULT_CIRCLE_SIZE) / 2;
                    const distance = Math.max(20, Math.abs(x - centerX));
                    const newSize = distance * 2;
                    updates.width = newSize;
                    updates.height = newSize;
                    // Center the circle on the original center point
                    updates.left = centerX - newSize / 2;
                    updates.top = centerY - newSize / 2;
                } else if (element.type === 'image') {
                    updates.width = Math.max(20, (element.left + (element.width || 200)) - x);
                    updates.height = Math.max(20, (element.top + (element.height || 200)) - y);
                } else if (element.type === 'text') {
                    updates.width = Math.max(20, (element.left + (element.width || DEFAULT_TEXT_WIDTH)) - x);
                    updates.height = Math.max(20, (element.top + (element.height || DEFAULT_TEXT_HEIGHT)) - y);
                } else if (element.type === 'triangle') {
                    // For triangles, resize from center - much simpler and more reliable
                    const centerX = element.left + (element.width || DEFAULT_TRIANGLE_SIZE) / 2;
                    const centerY = element.top + (element.height || DEFAULT_TRIANGLE_SIZE) / 2;
                    const distance = Math.max(20, Math.abs(x - centerX));
                    const newSize = distance * 2;
                    updates.width = newSize;
                    updates.height = newSize;
                    // Center the triangle on the original center point
                    updates.left = centerX - newSize / 2;
                    updates.top = centerY - newSize / 2;
                } else if (element.type === 'star') {
                    // For stars, resize from center - much simpler and more reliable
                    const centerX = element.left + (element.width || DEFAULT_STAR_SIZE) / 2;
                    const centerY = element.top + (element.height || DEFAULT_STAR_SIZE) / 2;
                    const distance = Math.max(20, Math.abs(x - centerX));
                    const newSize = distance * 2;
                    updates.width = newSize;
                    updates.height = newSize;
                    // Center the star on the original center point
                    updates.left = centerX - newSize / 2;
                    updates.top = centerY - newSize / 2;
                }
                break;
            case 'top-right':
                updates.top = y;
                if (element.type === 'rectangle') {
                    updates.width = Math.max(20, x - element.left);
                    updates.height = Math.max(20, (element.top + (element.height || 100)) - y);
                } else if (element.type === 'circle') {
                    // For circles, resize from center - much simpler and more reliable
                    const centerX = element.left + (element.width || DEFAULT_CIRCLE_SIZE) / 2;
                    const centerY = element.top + (element.height || DEFAULT_CIRCLE_SIZE) / 2;
                    const distance = Math.max(20, Math.abs(x - centerX));
                    const newSize = distance * 2;
                    updates.width = newSize;
                    updates.height = newSize;
                    // Center the circle on the original center point
                    updates.left = centerX - newSize / 2;
                    updates.top = centerY - newSize / 2;
                } else if (element.type === 'image') {
                    updates.top = y;
                    updates.width = Math.max(20, x - element.left);
                    updates.height = Math.max(20, (element.top + (element.height || 200)) - y);
                } else if (element.type === 'text') {
                    updates.top = y;
                    updates.width = Math.max(20, x - element.left);
                    updates.height = Math.max(20, (element.top + (element.height || DEFAULT_TEXT_HEIGHT)) - y);
                } else if (element.type === 'triangle') {
                    // For triangles, resize from center - much simpler and more reliable
                    const centerX = element.left + (element.width || DEFAULT_TRIANGLE_SIZE) / 2;
                    const centerY = element.top + (element.height || DEFAULT_TRIANGLE_SIZE) / 2;
                    const distance = Math.max(20, Math.abs(x - centerX));
                    const newSize = distance * 2;
                    updates.width = newSize;
                    updates.height = newSize;
                    // Center the triangle on the original center point
                    updates.left = centerX - newSize / 2;
                    updates.top = centerY - newSize / 2;
                } else if (element.type === 'star') {
                    // For stars, resize from center - much simpler and more reliable
                    const centerX = element.left + (element.width || DEFAULT_STAR_SIZE) / 2;
                    const centerY = element.top + (element.height || DEFAULT_STAR_SIZE) / 2;
                    const distance = Math.max(20, Math.abs(x - centerX));
                    const newSize = distance * 2;
                    updates.width = newSize;
                    updates.height = newSize;
                    // Center the star on the original center point
                    updates.left = centerX - newSize / 2;
                    updates.top = centerY - newSize / 2;
                }
                break;
            case 'bottom-left':
                updates.left = x;
                if (element.type === 'rectangle') {
                    updates.width = Math.max(20, (element.left + (element.width || 100)) - x);
                    updates.height = Math.max(20, y - element.top);
                } else if (element.type === 'circle') {
                    // For circles, resize from center - much simpler and more reliable
                    const centerX = element.left + (element.width || DEFAULT_CIRCLE_SIZE) / 2;
                    const centerY = element.top + (element.height || DEFAULT_CIRCLE_SIZE) / 2;
                    const distance = Math.max(20, Math.abs(x - centerX));
                    const newSize = distance * 2;
                    updates.width = newSize;
                    updates.height = newSize;
                    // Center the circle on the original center point
                    updates.left = centerX - newSize / 2;
                    updates.top = centerY - newSize / 2;
                } else if (element.type === 'image') {
                    updates.left = x;
                    updates.width = Math.max(20, (element.left + (element.width || 200)) - x);
                    updates.height = Math.max(20, y - element.top);
                } else if (element.type === 'text') {
                    updates.left = x;
                    updates.width = Math.max(20, (element.left + (element.width || DEFAULT_TEXT_WIDTH)) - x);
                    updates.height = Math.max(20, y - element.top);
                } else if (element.type === 'triangle') {
                    // For triangles, resize from center - much simpler and more reliable
                    const centerX = element.left + (element.width || DEFAULT_TRIANGLE_SIZE) / 2;
                    const centerY = element.top + (element.height || DEFAULT_TRIANGLE_SIZE) / 2;
                    const distance = Math.max(20, Math.abs(x - centerX));
                    const newSize = distance * 2;
                    updates.width = newSize;
                    updates.height = newSize;
                    // Center the triangle on the original center point
                    updates.left = centerX - newSize / 2;
                    updates.top = centerY - newSize / 2;
                } else if (element.type === 'star') {
                    // For stars, resize from center - much simpler and more reliable
                    const centerX = element.left + (element.width || DEFAULT_STAR_SIZE) / 2;
                    const centerY = element.top + (element.height || DEFAULT_STAR_SIZE) / 2;
                    const distance = Math.max(20, Math.abs(x - centerX));
                    const newSize = distance * 2;
                    updates.width = newSize;
                    updates.height = newSize;
                    // Center the star on the original center point
                    updates.left = centerX - newSize / 2;
                    updates.top = centerY - newSize / 2;
                }
                break;
            case 'bottom-right':
                if (element.type === 'rectangle') {
                    updates.width = Math.max(20, x - element.left);
                    updates.height = Math.max(20, y - element.top);
                } else if (element.type === 'circle') {
                    // For circles, resize from center - much simpler and more reliable
                    const centerX = element.left + (element.width || DEFAULT_CIRCLE_SIZE) / 2;
                    const centerY = element.top + (element.height || DEFAULT_CIRCLE_SIZE) / 2;
                    const distance = Math.max(20, Math.min(Math.abs(x - centerX), Math.abs(y - centerY)));
                    const newSize = distance * 2;
                    updates.width = newSize;
                    updates.height = newSize;
                    // Center the circle on the original center point
                    updates.left = centerX - newSize / 2;
                    updates.top = centerY - newSize / 2;
                } else if (element.type === 'image') {
                    updates.width = Math.max(20, x - element.left);
                    updates.height = Math.max(20, y - element.top);
                } else if (element.type === 'text') {
                    updates.width = Math.max(20, x - element.left);
                    updates.height = Math.max(20, y - element.top);
                } else if (element.type === 'triangle') {
                    // For triangles, resize from center - much simpler and more reliable
                    const centerX = element.left + (element.width || DEFAULT_TRIANGLE_SIZE) / 2;
                    const centerY = element.top + (element.height || DEFAULT_TRIANGLE_SIZE) / 2;
                    const distance = Math.max(20, Math.min(Math.abs(x - centerX), Math.abs(y - centerY)));
                    const newSize = distance * 2;
                    updates.width = newSize;
                    updates.height = newSize;
                    // Center the triangle on the original center point
                    updates.left = centerX - newSize / 2;
                    updates.top = centerY - newSize / 2;
                } else if (element.type === 'star') {
                    // For stars, resize from center - much simpler and more reliable
                    const centerX = element.left + (element.width || DEFAULT_STAR_SIZE) / 2;
                    const centerY = element.top + (element.height || DEFAULT_STAR_SIZE) / 2;
                    const distance = Math.max(20, Math.min(Math.abs(x - centerX), Math.abs(y - centerY)));
                    const newSize = distance * 2;
                    updates.width = newSize;
                    updates.height = newSize;
                    // Center the star on the original center point
                    updates.left = centerX - newSize / 2;
                    updates.top = centerY - newSize / 2;
                }
                break;
            case 'top':
                updates.top = y;
                if (element.type === 'rectangle') {
                    updates.height = Math.max(20, (element.top + (element.height || 100)) - y);
                    // For circles, resize from center - much simpler and more reliable
                    const centerX = element.left + (element.width || DEFAULT_CIRCLE_SIZE) / 2;
                    const centerY = element.top + (element.height || DEFAULT_CIRCLE_SIZE) / 2;
                    const distance = Math.max(20, Math.abs(y - centerY));
                    const newSize = distance * 2;
                    updates.width = newSize;
                    updates.height = newSize;
                    // Center the circle on the original center point
                    updates.left = centerX - newSize / 2;
                    updates.top = centerY - newSize / 2;
                } else if (element.type === 'image') {
                    updates.top = y;
                    updates.height = Math.max(20, (element.top + (element.height || 200)) - y);
                } else if (element.type === 'text') {
                    updates.top = y;
                    updates.height = Math.max(20, (element.top + (element.height || DEFAULT_TEXT_HEIGHT)) - y);
                } else if (element.type === 'triangle') {
                    // For triangles, resize from center - much simpler and more reliable
                    const centerX = element.left + (element.width || DEFAULT_TRIANGLE_SIZE) / 2;
                    const centerY = element.top + (element.height || DEFAULT_TRIANGLE_SIZE) / 2;
                    const distance = Math.max(20, Math.abs(y - centerY));
                    const newSize = distance * 2;
                    updates.width = newSize;
                    updates.height = newSize;
                    // Center the triangle on the original center point
                    updates.left = centerX - newSize / 2;
                    updates.top = centerY - newSize / 2;
                } else if (element.type === 'star') {
                    // For stars, resize from center - much simpler and more reliable
                    const centerX = element.left + (element.width || DEFAULT_STAR_SIZE) / 2;
                    const centerY = element.top + (element.height || DEFAULT_STAR_SIZE) / 2;
                    const distance = Math.max(20, Math.abs(y - centerY));
                    const newSize = distance * 2;
                    updates.width = newSize;
                    updates.height = newSize;
                    // Center the star on the original center point
                    updates.left = centerX - newSize / 2;
                    updates.top = centerY - newSize / 2;
                }
                break;
            case 'bottom':
                if (element.type === 'rectangle') {
                    updates.height = Math.max(20, y - element.top);
                    // For circles, resize from center - much simpler and more reliable
                    const centerX = element.left + (element.width || DEFAULT_CIRCLE_SIZE) / 2;
                    const centerY = element.top + (element.height || DEFAULT_CIRCLE_SIZE) / 2;
                    const distance = Math.max(20, Math.abs(y - centerY));
                    const newSize = distance * 2;
                    updates.width = newSize;
                    updates.height = newSize;
                    // Center the circle on the original center point
                    updates.left = centerX - newSize / 2;
                    updates.top = centerY - newSize / 2;
                } else if (element.type === 'image') {
                    updates.height = Math.max(20, y - element.top);
                } else if (element.type === 'text') {
                    updates.height = Math.max(20, y - element.top);
                } else if (element.type === 'triangle') {
                    // For triangles, resize from center - much simpler and more reliable
                    const centerX = element.left + (element.width || DEFAULT_TRIANGLE_SIZE) / 2;
                    const centerY = element.top + (element.height || DEFAULT_TRIANGLE_SIZE) / 2;
                    const distance = Math.max(20, Math.abs(y - centerY));
                    const newSize = distance * 2;
                    updates.width = newSize;
                    updates.height = newSize;
                    // Center the triangle on the original center point
                    updates.left = centerX - newSize / 2;
                    updates.top = centerY - newSize / 2;
                } else if (element.type === 'star') {
                    // For stars, resize from center - much simpler and more reliable
                    const centerX = element.left + (element.width || DEFAULT_STAR_SIZE) / 2;
                    const centerY = element.top + (element.height || DEFAULT_STAR_SIZE) / 2;
                    const distance = Math.max(20, Math.abs(y - centerY));
                    const newSize = distance * 2;
                    updates.width = newSize;
                    updates.height = newSize;
                    // Center the star on the original center point
                    updates.left = centerX - newSize / 2;
                    updates.top = centerY - newSize / 2;
                }
                break;
            case 'left':
                updates.left = x;
                if (element.type === 'rectangle') {
                    updates.width = Math.max(20, (element.left + (element.width || 100)) - x);
                    // For circles, resize from center - much simpler and more reliable
                    const centerX = element.left + (element.width || DEFAULT_CIRCLE_SIZE) / 2;
                    const centerY = element.top + (element.height || DEFAULT_CIRCLE_SIZE) / 2;
                    const distance = Math.max(20, Math.abs(x - centerX));
                    const newSize = distance * 2;
                    updates.width = newSize;
                    updates.height = newSize;
                    // Center the circle on the original center point
                    updates.left = centerX - newSize / 2;
                    updates.top = centerY - newSize / 2;
                } else if (element.type === 'image') {
                    updates.left = x;
                    updates.width = Math.max(20, (element.left + (element.width || 200)) - x);
                } else if (element.type === 'text') {
                    updates.left = x;
                    updates.width = Math.max(20, (element.left + (element.width || DEFAULT_TEXT_WIDTH)) - x);
                } else if (element.type === 'triangle') {
                    // For triangles, resize from center - much simpler and more reliable
                    const centerX = element.left + (element.width || DEFAULT_TRIANGLE_SIZE) / 2;
                    const centerY = element.top + (element.height || DEFAULT_TRIANGLE_SIZE) / 2;
                    const distance = Math.max(20, Math.abs(x - centerX));
                    const newSize = distance * 2;
                    updates.width = newSize;
                    updates.height = newSize;
                    // Center the triangle on the original center point
                    updates.left = centerX - newSize / 2;
                    updates.top = centerY - newSize / 2;
                } else if (element.type === 'star') {
                    // For stars, resize from center - much simpler and more reliable
                    const centerX = element.left + (element.width || DEFAULT_STAR_SIZE) / 2;
                    const centerY = element.top + (element.height || DEFAULT_STAR_SIZE) / 2;
                    const distance = Math.max(20, Math.abs(x - centerX));
                    const newSize = distance * 2;
                    updates.width = newSize;
                    updates.height = newSize;
                    // Center the star on the original center point
                    updates.left = centerX - newSize / 2;
                    updates.top = centerY - newSize / 2;
                }
                break;
            case 'right':
                if (element.type === 'rectangle') {
                    updates.width = Math.max(20, x - element.left);
                    // For circles, resize from center - much simpler and more reliable
                    const centerX = element.left + (element.width || DEFAULT_CIRCLE_SIZE) / 2;
                    const centerY = element.top + (element.height || DEFAULT_CIRCLE_SIZE) / 2;
                    const distance = Math.max(20, Math.abs(x - centerX));
                    const newSize = distance * 2;
                    updates.width = newSize;
                    updates.height = newSize;
                    // Center the circle on the original center point
                    updates.left = centerX - newSize / 2;
                    updates.top = centerY - newSize / 2;
                } else if (element.type === 'image') {
                    updates.width = Math.max(20, x - element.left);
                } else if (element.type === 'text') {
                    updates.width = Math.max(20, x - element.left);
                } else if (element.type === 'triangle') {
                    // For triangles, resize from center - much simpler and more reliable
                    const centerX = element.left + (element.width || DEFAULT_TRIANGLE_SIZE) / 2;
                    const centerY = element.top + (element.height || DEFAULT_TRIANGLE_SIZE) / 2;
                    const distance = Math.max(20, Math.abs(x - centerX));
                    const newSize = distance * 2;
                    updates.width = newSize;
                    updates.height = newSize;
                    // Center the triangle on the original center point
                    updates.left = centerX - newSize / 2;
                    updates.top = centerY - newSize / 2;
                } else if (element.type === 'star') {
                    // For stars, resize from center - much simpler and more reliable
                    const centerX = element.left + (element.width || DEFAULT_STAR_SIZE) / 2;
                    const centerY = element.top + (element.height || DEFAULT_STAR_SIZE) / 2;
                    const distance = Math.max(20, Math.abs(x - centerX));
                    const newSize = distance * 2;
                    updates.width = newSize;
                    updates.height = newSize;
                    // Center the star on the original center point
                    updates.left = centerX - newSize / 2;
                    updates.top = centerY - newSize / 2;
                }
                break;
            case 'start':
                // For lines, move the start point
                updates.left = x;
                updates.top = y;
                break;
            case 'end':
                // For lines, adjust the length (keep start point, change end point)
                // Since lines are horizontal, only use x coordinate
                const newLength = x - element.left;
                if (newLength > 10) { // Minimum line length
                    updates.width = newLength;
                }
                break;
        }

        if (Object.keys(updates).length > 0) {
            console.log('Resizing element:', elementId, 'with updates:', updates);

            // Ensure element stays selected during resize
            if (selectedElementId !== elementId) {
                console.log('Re-selecting element during resize:', elementId);
                dispatch(setSelectedElement(elementId));
            }

            dispatch(updateElement({ elementId, updates }));
        } else {
            console.log('No updates to apply for resize');
        }
    };

    return (
        <div className="relative bg-white rounded-lg shadow-lg">
            {/* Slide Indicator */}
            {slides.length > 1 && (
                <div className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white px-3 py-1 rounded-lg text-sm">
                    Slide {activeSlideIndex + 1} of {slides.length}
                </div>
            )}
            <div className="p-4">
                <canvas
                    ref={canvasRef}
                    className="border-2 border-gray-200 rounded-lg shadow-inner"
                    style={{
                        width: `${CANVAS_WIDTH}px`,
                        height: `${CANVAS_HEIGHT}px`,
                        cursor: isResizing ? 'nw-resize' :
                            isDragging ? 'grabbing' :
                                selectedTool ? 'crosshair' : 'default'
                    }}

                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseEnter={handleMouseEnter}
                    onDoubleClick={handleDoubleClick}
                />




            </div>
        </div>
    );
} 