"use client"

import { useState, useEffect } from "react"
import { X, ExternalLink, Calendar, Newspaper, Loader2, Sparkles, AlertTriangle, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { NewsItem } from "@/types/market"

interface NewsModalProps {
    symbol: string
    name: string
    isOpen: boolean
    onClose: () => void
}

export function NewsModal({ symbol, name, isOpen, onClose }: NewsModalProps) {
    const [news, setNews] = useState<NewsItem[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (isOpen) {
            fetchNews()
        }
    }, [isOpen, symbol])

    const fetchNews = async () => {
        try {
            setLoading(true)
            const res = await fetch(`/api/news/${symbol}`)
            const data = await res.json()
            setNews(data)
        } catch (error) {
            console.error("Error fetching news:", error)
        } finally {
            setLoading(false)
        }
    }

    const getSentimentInfo = (sentiment: string) => {
        switch (sentiment) {
            case 'BULLISH': return { color: 'text-primary', bg: 'bg-primary/20', icon: TrendingUp, label: 'Bullish' };
            case 'BEARISH': return { color: 'text-destructive', bg: 'bg-destructive/10', icon: TrendingDown, label: 'Bearish' };
            default: return { color: 'text-muted-foreground', bg: 'bg-muted/10', icon: Minus, label: 'Meh' };
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div
                className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                onClick={onClose}
            />

            <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-border/50 bg-card/95 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-border/50 p-6">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                            <Sparkles className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black tracking-tight text-foreground uppercase">
                                {symbol} News Analytics
                            </h2>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                AI-Analyzed News for {name}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="max-h-[60vh] overflow-y-auto p-6 space-y-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                                Running AI Analysis...
                            </p>
                        </div>
                    ) : news.length > 0 ? (
                        news.map((item) => {
                            const sentiment = getSentimentInfo(item.sentiment);
                            const SentimentIcon = sentiment.icon;

                            return (
                                <div
                                    key={item.uuid}
                                    className="relative group p-4 rounded-xl bg-background/50 border border-border/30 hover:border-primary/40 transition-all flex flex-col gap-4"
                                >
                                    {/* Headline & Metadata */}
                                    <div className="flex gap-4">
                                        {item.thumbnail && (
                                            <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border border-border/50">
                                                <img
                                                    src={item.thumbnail}
                                                    alt=""
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                                                    <Newspaper className="h-3 w-3" />
                                                    <span>{item.publisher}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {/* Importance Indicator */}
                                                    <div className="flex gap-0.5">
                                                        {[...Array(5)].map((_, i) => (
                                                            <div
                                                                key={i}
                                                                className={`h-1.5 w-1.5 rounded-full ${i < item.importance ? 'bg-primary shadow-[0_0_4px_var(--color-primary)]' : 'bg-muted'}`}
                                                            />
                                                        ))}
                                                    </div>
                                                    <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
                                                        <Calendar className="h-3 w-3" />
                                                        <span>{new Date(item.providerPublishTime).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <h3 className="text-sm font-black text-foreground mb-1 leading-snug">
                                                {item.title}
                                            </h3>
                                            <a
                                                href={item.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 text-[10px] font-bold text-primary uppercase tracking-tighter hover:underline"
                                            >
                                                Source Link <ExternalLink className="h-2 w-2" />
                                            </a>
                                        </div>
                                    </div>

                                    {/* AI Insight Box */}
                                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 relative overflow-hidden">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${sentiment.bg} ${sentiment.color}`}>
                                                <SentimentIcon className="h-2.5 w-2.5" />
                                                {sentiment.label}
                                            </span>
                                            <span className="text-[9px] font-black text-foreground uppercase tracking-widest flex items-center gap-1">
                                                <Sparkles className="h-3 w-3 text-primary" />
                                                AI Forecast Influence
                                            </span>
                                        </div>
                                        <p className="text-[11px] font-medium text-foreground/80 leading-relaxed italic">
                                            "{item.aiInsight}"
                                        </p>
                                        {item.importance >= 4 && (
                                            <div className="absolute right-0 top-0 bottom-0 w-1 bg-primary/30" />
                                        )}
                                    </div>
                                </div>
                            )
                        })
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                                No recent intel found for this asset.
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-border/50 p-6 bg-muted/30 flex items-center justify-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">High Relevance</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-muted" />
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Market Noise</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
