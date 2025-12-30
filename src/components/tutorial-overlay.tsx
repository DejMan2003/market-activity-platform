"use client"

import { useState, useEffect } from "react"
import { X, ChevronRight, ChevronLeft, Info, Activity, ShieldAlert, Globe, GraduationCap } from "lucide-react"

interface TutorialOverlayProps {
    onClose: () => void
}

const STEPS = [
    {
        title: "Welcome to The Bazaar",
        description: "Your digital exchange for high-density market intelligence. Let's take a quick look at how to navigate the stalls.",
        icon: GraduationCap,
        target: "header"
    },
    {
        title: "Market Activity Score",
        description: "Every asset has a 1-10 'Heat Score'. This uses AI to weigh price action and volume relative to normal market moves.",
        icon: Activity,
        target: "score"
    },
    {
        title: "Smart Risk Analysis",
        description: "The Risk Badge detects unusual patterns like volume spikes or asset-specific dangers (like penny stock volatility).",
        icon: ShieldAlert,
        target: "risk"
    },
    {
        title: "Global Markets",
        description: "Use the region tabs to switch between US, UK (LSE), and Canadian (TSX) markets seamlessly.",
        icon: Globe,
        target: "region"
    },
    {
        title: "Deep Analytics",
        description: "Click 'More Analytics' on any card to see real-time news headlines and detailed market fundamentals.",
        icon: Info,
        target: "analytics"
    }
]

export function TutorialOverlay({ onClose }: TutorialOverlayProps) {
    const [currentStep, setCurrentStep] = useState(0)
    const [dontShowAgain, setDontShowAgain] = useState(false)

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(currentStep + 1)
        } else {
            handleComplete()
        }
    }

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1)
        }
    }

    const handleComplete = () => {
        if (dontShowAgain) {
            localStorage.setItem("bazaar-tutorial-skip", "true")
        }
        onClose()
    }

    const step = STEPS[currentStep]
    const Icon = step.icon

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-background/60 backdrop-blur-xl animate-in fade-in duration-500"
                onClick={onClose}
            />

            <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-primary/20 bg-card/90 p-8 shadow-2xl backdrop-blur-2xl animate-in zoom-in-95 duration-300">
                {/* Step Indicator */}
                <div className="mb-8 flex justify-between items-center">
                    <div className="flex gap-1.5">
                        {STEPS.map((_, i) => (
                            <div
                                key={i}
                                className={`h-1.5 rounded-full transition-all duration-300 ${i === currentStep ? "w-8 bg-primary shadow-[0_0_8px_var(--color-primary)]" : "w-1.5 bg-muted"
                                    }`}
                            />
                        ))}
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex flex-col items-center text-center space-y-6">
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
                        <div className="relative rounded-2xl bg-primary/10 p-4 border border-primary/20">
                            <Icon className="h-10 w-10 text-primary" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-2xl font-black tracking-tight text-foreground uppercase italic px-4">
                            {step.title}
                        </h2>
                        <p className="text-sm font-medium text-muted-foreground leading-relaxed px-4">
                            {step.description}
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-10 space-y-6">
                    <div className="flex gap-3">
                        {currentStep > 0 && (
                            <button
                                onClick={handleBack}
                                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border/50 bg-background/50 py-3.5 text-xs font-black uppercase tracking-widest text-foreground hover:bg-muted transition-all"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Back
                            </button>
                        )}
                        <button
                            onClick={handleNext}
                            className="group flex flex-[2] items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-xs font-black uppercase tracking-widest text-primary-foreground shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                        >
                            {currentStep === STEPS.length - 1 ? "Get Started" : "Next Step"}
                            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </button>
                    </div>

                    <div className="flex items-center justify-center gap-2">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={dontShowAgain}
                                onChange={(e) => setDontShowAgain(e.target.checked)}
                                className="h-4 w-4 rounded border-primary/20 bg-background text-primary focus:ring-primary/20 transition-all cursor-pointer"
                            />
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest group-hover:text-foreground transition-colors">
                                Don't show this again
                            </span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    )
}
