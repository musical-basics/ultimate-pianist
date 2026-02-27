'use client'

/**
 * AnchorSidebar — UI for managing measure and beat anchor points
 */

import * as React from 'react'
import { Trash2, Plus, ChevronUp, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Anchor, BeatAnchor } from '@/lib/types'

interface AnchorSidebarProps {
    anchors: Anchor[]
    beatAnchors?: BeatAnchor[]
    currentMeasure: number
    totalMeasures: number
    isLevel2Mode: boolean
    subdivision: number
    darkMode?: boolean
    onSetAnchor: (measure: number, time: number) => void
    onDeleteAnchor: (measure: number) => void
    onToggleLevel2: (enabled: boolean) => void
    onSetSubdivision: (sub: number) => void
    onAIPredict?: () => void
    onTeachAI?: () => void
}

export const AnchorSidebar: React.FC<AnchorSidebarProps> = ({
    anchors,
    beatAnchors = [],
    currentMeasure,
    totalMeasures,
    isLevel2Mode,
    subdivision,
    darkMode = false,
    onSetAnchor,
    onDeleteAnchor,
    onToggleLevel2,
    onSetSubdivision,
    onAIPredict,
    onTeachAI,
}) => {
    const bg = darkMode ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-900'
    const border = darkMode ? 'border-zinc-700' : 'border-zinc-200'

    const sortedAnchors = [...anchors].sort((a, b) => a.measure - b.measure)

    return (
        <div className={`w-64 ${bg} border-r ${border} flex flex-col h-full overflow-hidden`}>
            {/* Header */}
            <div className={`p-3 border-b ${border} flex items-center justify-between`}>
                <h2 className="text-sm font-semibold">Anchors</h2>
                <span className={`text-xs ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    {anchors.length} / {totalMeasures} measures
                </span>
            </div>

            {/* Level 2 Toggle */}
            <div className={`p-3 border-b ${border} space-y-2`}>
                <label className="flex items-center gap-2 text-xs">
                    <input
                        type="checkbox"
                        checked={isLevel2Mode}
                        onChange={(e) => onToggleLevel2(e.target.checked)}
                        className="rounded"
                    />
                    Beat-level mapping (L2)
                </label>
                {isLevel2Mode && (
                    <div className="flex items-center gap-2">
                        <span className="text-xs">Subdivision:</span>
                        <select
                            value={subdivision}
                            onChange={(e) => onSetSubdivision(Number(e.target.value))}
                            className={`text-xs px-2 py-1 rounded ${darkMode ? 'bg-zinc-800 border-zinc-600' : 'bg-zinc-100 border-zinc-300'} border`}
                        >
                            {[2, 3, 4, 6, 8].map((n) => (
                                <option key={n} value={n}>{n}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* AI Controls */}
            {(onAIPredict || onTeachAI) && (
                <div className={`p-3 border-b ${border} space-y-2`}>
                    {onAIPredict && (
                        <Button
                            size="sm"
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs"
                            onClick={onAIPredict}
                        >
                            🤖 AI Auto-Map
                        </Button>
                    )}
                    {onTeachAI && (
                        <Button
                            size="sm"
                            variant="outline"
                            className="w-full text-xs"
                            onClick={onTeachAI}
                        >
                            📚 Teach AI
                        </Button>
                    )}
                </div>
            )}

            {/* Anchor List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {sortedAnchors.map((anchor) => (
                    <div
                        key={anchor.measure}
                        className={`flex items-center gap-2 p-2 rounded text-xs ${anchor.measure === currentMeasure
                                ? darkMode ? 'bg-purple-900/30 border border-purple-500/30' : 'bg-purple-50 border border-purple-200'
                                : darkMode ? 'hover:bg-zinc-800' : 'hover:bg-zinc-50'
                            }`}
                    >
                        <span className="font-mono font-medium w-8">M{anchor.measure}</span>
                        <input
                            type="number"
                            value={anchor.time.toFixed(2)}
                            step={0.01}
                            onChange={(e) => onSetAnchor(anchor.measure, parseFloat(e.target.value) || 0)}
                            className={`flex-1 px-2 py-1 rounded font-mono text-xs ${darkMode ? 'bg-zinc-800 border-zinc-600' : 'bg-zinc-100 border-zinc-300'
                                } border`}
                        />
                        <span className="text-zinc-500">s</span>
                        <button
                            onClick={() => onDeleteAnchor(anchor.measure)}
                            className="text-red-400 hover:text-red-500 p-0.5"
                        >
                            <Trash2 className="w-3 h-3" />
                        </button>
                    </div>
                ))}
            </div>

            {/* Footer: Current measure indicator */}
            <div className={`p-3 border-t ${border} text-center`}>
                <span className={`text-xs ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    Current: Measure {currentMeasure} / {totalMeasures}
                </span>
            </div>
        </div>
    )
}

export default AnchorSidebar
