"use client"

import { useState, useEffect, useRef } from "react"
import { Search as SearchIcon, X, Loader2, History, TrendingUp, TrendingDown } from "lucide-react"
import { Card } from "@/components/ui/card"

interface SearchSuggestion {
    symbol: string
    name: string
    type: string
    exchange: string
}

interface SearchBarProps {
    onSelect: (symbol: string) => void
    history: string[]
    onClearHistory: () => void
    onRemoveHistoryItem: (symbol: string) => void
}

export function SearchBar({ onSelect, history, onClearHistory, onRemoveHistoryItem }: SearchBarProps) {
    const [query, setQuery] = useState("")
    const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
    const [loading, setLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.trim().length > 1) {
                setLoading(true)
                try {
                    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
                    const data = await res.json()
                    setSuggestions(data)
                    setIsOpen(true)
                } catch (err) {
                    console.error("Search error:", err)
                } finally {
                    setLoading(false)
                }
            } else {
                setSuggestions([])
                setIsOpen(false)
            }
        }, 300)

        return () => clearTimeout(timer)
    }, [query])

    const handleSelect = (symbol: string) => {
        onSelect(symbol)
        setQuery("")
        setIsOpen(false)
    }

    const handleRemove = (e: React.MouseEvent, symbol: string) => {
        e.stopPropagation()
        onRemoveHistoryItem(symbol)
    }

    return (
        <div className="relative w-full max-w-xl mx-auto" ref={dropdownRef}>
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <SearchIcon className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                </div>
                <input
                    type="text"
                    className="flex h-12 w-full rounded-2xl border border-white/5 bg-card/40 px-11 py-6 text-sm font-black uppercase tracking-widest ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                    placeholder="Search Market Assets (Symbol or Name)..."
                    value={query}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
                    onFocus={() => query.trim().length > 1 && setIsOpen(true)}
                />
                {(query || loading) && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        ) : (
                            <button onClick={() => setQuery("")} className="hover:text-primary transition-colors">
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Suggestions Dropdown */}
            {isOpen && (suggestions.length > 0 || history.length > 0) && (
                <Card className="absolute z-50 w-full mt-2 bg-background/95 backdrop-blur-xl border-border/50 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="max-h-[400px] overflow-y-auto">
                        {/* Current Suggestions */}
                        {suggestions.length > 0 && (
                            <div className="p-2">
                                <span className="px-3 py-2 text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] block">
                                    Results
                                </span>
                                {suggestions.map((s) => (
                                    <button
                                        key={s.symbol}
                                        onClick={() => handleSelect(s.symbol)}
                                        className="w-full flex items-center justify-between px-3 py-3 rounded-xl hover:bg-primary/10 transition-colors group text-left"
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-foreground group-hover:text-primary transition-colors uppercase">
                                                {s.symbol}
                                            </span>
                                            <span className="text-[10px] font-bold text-muted-foreground truncate max-w-[200px]">
                                                {s.name}
                                            </span>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <span className="text-[9px] font-black text-accent uppercase tracking-widest">
                                                {s.type}
                                            </span>
                                            <span className="text-[8px] font-bold text-muted-foreground/60 uppercase">
                                                {s.exchange}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Recent History */}
                        {history.length > 0 && (
                            <div className="p-2 border-t border-border/30 bg-muted/20">
                                <div className="flex items-center justify-between px-3 py-2 mb-1">
                                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                                        <History className="h-3 w-3" />
                                        Recent
                                    </span>
                                    <button
                                        onClick={onClearHistory}
                                        className="text-[8px] font-black text-muted-foreground hover:text-destructive uppercase tracking-widest transition-colors"
                                    >
                                        Clear
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2 px-3 pb-2">
                                    {history.map((h) => (
                                        <div
                                            key={h}
                                            className="group/item flex items-center gap-1 pl-3 pr-1.5 py-1.5 rounded-lg bg-background border border-border/50 text-[10px] font-black text-foreground hover:border-primary/50 transition-all uppercase cursor-pointer"
                                            onClick={() => handleSelect(h)}
                                        >
                                            <span className="group-hover/item:text-primary">{h}</span>
                                            <button
                                                onClick={(e) => handleRemove(e, h)}
                                                className="p-0.5 rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors opacity-40 group-hover/item:opacity-100"
                                            >
                                                <X className="h-2.5 w-2.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </Card>
            )}
        </div>
    )
}
