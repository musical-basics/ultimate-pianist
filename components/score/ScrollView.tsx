'use client'

/**
 * ScrollView — Renders sheet music via OSMD and synchronizes with audio playback.
 * This is a simplified port focused on rendering and cursor tracking.
 * Full reveal modes and effects will be implemented progressively.
 */

import * as React from 'react'
import { useRef, useEffect, useCallback } from 'react'
import { useOSMD } from '@/hooks/useOSMD'
import { getPlaybackManager } from '@/lib/engine/PlaybackManager'
import { mapTimeToPosition } from '@/lib/engine/TimeMapper'
import type { Anchor, BeatAnchor } from '@/lib/types'

interface ScrollViewProps {
    xmlUrl: string | null
    anchors: Anchor[]
    beatAnchors?: BeatAnchor[]
    isPlaying: boolean
    isAdmin?: boolean
    darkMode?: boolean
    revealMode?: 'OFF' | 'NOTE' | 'CURTAIN'
    highlightNote?: boolean
    glowEffect?: boolean
    popEffect?: boolean
    isLocked?: boolean
    cursorPosition?: number
    showCursor?: boolean
    onMeasureChange?: (measure: number) => void
}

export const ScrollView: React.FC<ScrollViewProps> = ({
    xmlUrl,
    anchors,
    beatAnchors = [],
    isPlaying,
    isAdmin = false,
    darkMode = false,
    revealMode = 'OFF',
    highlightNote = true,
    glowEffect = true,
    popEffect = false,
    isLocked = true,
    cursorPosition = 0.2,
    showCursor = true,
    onMeasureChange,
}) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const cursorRef = useRef<HTMLDivElement>(null)
    const rafRef = useRef<number>(0)
    const lastMeasureRef = useRef(1)

    const { osmd, isLoaded, error, totalMeasures } = useOSMD(containerRef, xmlUrl)

    // Animation loop: update cursor position based on playback time
    const updateCursor = useCallback(() => {
        if (!isLoaded || !osmd.current || anchors.length === 0) return

        const pm = getPlaybackManager()
        const time = pm.getVisualTime()
        const pos = mapTimeToPosition(time, anchors, beatAnchors)

        // Update cursor visual position
        if (cursorRef.current && containerRef.current) {
            const scoreContainer = containerRef.current
            const measures = scoreContainer.querySelectorAll('.vf-measure')

            if (measures.length > 0) {
                const measureIdx = Math.max(0, Math.min(pos.measure - 1, measures.length - 1))
                const measureEl = measures[measureIdx] as HTMLElement

                if (measureEl) {
                    const containerRect = scoreContainer.getBoundingClientRect()
                    const measureRect = measureEl.getBoundingClientRect()

                    const baseX = measureRect.left - containerRect.left
                    const measureWidth = measureRect.width
                    const cursorX = baseX + (pos.progress * measureWidth)

                    cursorRef.current.style.transform = `translateX(${cursorX}px)`
                    cursorRef.current.style.display = showCursor ? 'block' : 'none'

                    // Auto-scroll to keep cursor in view
                    if (isLocked) {
                        const viewportCenter = scoreContainer.clientWidth * cursorPosition
                        const scrollTarget = cursorX - viewportCenter
                        scoreContainer.scrollLeft = scrollTarget
                    }
                }
            }

            // Notify parent of measure change
            if (pos.measure !== lastMeasureRef.current) {
                lastMeasureRef.current = pos.measure
                onMeasureChange?.(pos.measure)
            }
        }

        if (isPlaying) {
            rafRef.current = requestAnimationFrame(updateCursor)
        }
    }, [isLoaded, osmd, anchors, beatAnchors, isPlaying, isLocked, cursorPosition, showCursor, onMeasureChange])

    // Start/stop animation loop
    useEffect(() => {
        if (isPlaying && isLoaded) {
            rafRef.current = requestAnimationFrame(updateCursor)
        }
        return () => {
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current)
                rafRef.current = 0
            }
        }
    }, [isPlaying, isLoaded, updateCursor])

    return (
        <div
            className={`relative w-full h-full overflow-x-auto overflow-y-hidden ${darkMode ? 'bg-zinc-900' : 'bg-white'
                }`}
            style={{ WebkitOverflowScrolling: 'touch' }}
        >
            {/* OSMD renders into this div */}
            <div
                ref={containerRef}
                className="min-w-full"
                style={{
                    filter: darkMode ? 'invert(1) hue-rotate(180deg)' : 'none',
                }}
            />

            {/* Playback cursor */}
            <div
                ref={cursorRef}
                className="absolute top-0 bottom-0 w-0.5 bg-blue-500 pointer-events-none z-20 transition-none"
                style={{
                    display: showCursor && isLoaded ? 'block' : 'none',
                    willChange: 'transform',
                }}
            />

            {/* Loading state */}
            {!isLoaded && xmlUrl && !error && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center space-y-2">
                        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
                        <p className={`text-sm ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                            Loading score...
                        </p>
                    </div>
                </div>
            )}

            {/* Error state */}
            {error && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-red-500 text-sm">{error}</p>
                </div>
            )}

            {/* Empty state */}
            {!xmlUrl && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <p className={`text-sm ${darkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>
                        {isAdmin ? 'Upload a MusicXML file to begin' : 'No score loaded'}
                    </p>
                </div>
            )}
        </div>
    )
}

export default ScrollView
