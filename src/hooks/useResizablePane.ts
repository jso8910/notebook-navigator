/*
 * Notebook Navigator - Plugin for Obsidian
 * Copyright (c) 2025 Johan Sanneblad
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

// src/hooks/useResizablePane.ts
import { useState, useCallback, useEffect } from 'react';

interface UseResizablePaneConfig {
    initialWidth?: number;
    min?: number;
    max?: number;
    storageKey?: string;
}

interface UseResizablePaneResult {
    paneWidth: number;
    resizeHandleProps: {
        onMouseDown: (e: React.MouseEvent) => void;
    };
}

/**
 * Custom hook for managing resizable pane width with optional localStorage persistence.
 * Handles mouse events for dragging the resize handle and constrains the width
 * within specified bounds.
 * 
 * @param config - Configuration object with initial width, min/max bounds, and storage key
 * @returns Current pane width and props to spread on the resize handle element
 */
export function useResizablePane({
    initialWidth = 300,
    min = 150,
    max = 600,
    storageKey
}: UseResizablePaneConfig = {}): UseResizablePaneResult {
    // Load initial width from localStorage if storage key is provided
    const [paneWidth, setPaneWidth] = useState(() => {
        if (storageKey) {
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                const width = parseInt(saved, 10);
                if (!isNaN(width)) {
                    return Math.max(min, Math.min(max, width));
                }
            }
        }
        return initialWidth;
    });

    // Save width to localStorage when it changes
    useEffect(() => {
        if (storageKey) {
            localStorage.setItem(storageKey, paneWidth.toString());
        }
    }, [paneWidth, storageKey]);

    const handleResizeMouseDown = useCallback((e: React.MouseEvent) => {
        const startX = e.clientX;
        const startWidth = paneWidth;
        let currentWidth = startWidth;

        const handleMouseMove = (moveEvent: MouseEvent) => {
            const deltaX = moveEvent.clientX - startX;
            currentWidth = Math.max(min, Math.min(max, startWidth + deltaX));
            setPaneWidth(currentWidth);
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            // Remove resizing class to restore text selection
            document.body.classList.remove('nn-resizing');
        };

        // Add resizing class to prevent text selection during drag
        document.body.classList.add('nn-resizing');
        
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }, [paneWidth, min, max]);

    return {
        paneWidth,
        resizeHandleProps: {
            onMouseDown: handleResizeMouseDown
        }
    };
}