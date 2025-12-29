"use client"

import { useState, useEffect } from "react"
import { X, ExternalLink, Calendar, Newspaper, Loader2 } from "lucide-react"
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
                    <div>
                        <h2 className="text-xl font-black tracking-tight text-foreground uppercase">
                            {symbol} News
                        </h2>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            Latest Headlines for {name}
                        </p>
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
                                Fetching Articles...
                            </p>
                        </div>
                    ) : news.length > 0 ? (
                        news.map((item) => (
                            <a
                                key={item.uuid}
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group block p-4 rounded-xl bg-background/50 border border-border/30 hover:border-primary/50 hover:bg-primary/5 transition-all"
                            >
                                <div className="flex gap-4">
                                    {item.thumbnail?.resolutions[0]?.url && (
                                        <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border border-border/50">
                                            <img
                                                src={item.thumbnail.resolutions[0].url}
                                                alt=""
                                                className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                            />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-1.5 text-[10px] font-black text-primary uppercase tracking-wider">
                                                <Newspaper className="h-3 w-3" />
                                                <span>{item.publisher}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
                                                <Calendar className="h-3 w-3" />
                                                <span>{new Date(item.providerPublishTime).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <h3 className="text-sm font-black text-foreground mb-2 line-clamp-2 transition-colors group-hover:text-primary">
                                            {item.title}
                                        </h3>
                                        <div className="flex items-center gap-1 text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-tighter">
                                            Read Full Article
                                            <ExternalLink className="h-2.5 w-2.5" />
                                        </div>
                                    </div>
                                </div>
                            </a>
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                                No recent news found for this asset.
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-border/50 p-6 bg-muted/30">
                    <p className="text-[10px] font-bold text-muted-foreground text-center uppercase tracking-widest">
                        News aggregation powered by Yahoo Finance
                    </p>
                </div>
            </div>
        </div>
    )
}
