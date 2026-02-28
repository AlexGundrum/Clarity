"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export function Navbar() {
    return (
        <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="fixed top-0 right-0 left-0 z-50"
        >
            <div className="mx-auto max-w-7xl px-4 py-4">
                <nav className="glass-nav flex items-center justify-between rounded-2xl px-6 py-2">
                    {/* Logo + wordmark */}
                    <Link href="/" className="flex items-center gap-2.5">
                        <Image
                            src="/logo.png"
                            alt="Clarity mascot"
                            width={36}
                            height={36}
                            className="h-9 w-9 object-contain"
                        />
                        <span className="text-marker text-lg tracking-wider !text-blue-600/80">
                            CLARITY
                        </span>
                    </Link>

                    {/* Center links */}
                    <div className="hidden items-center gap-8 md:flex">
                        <Link
                            href="#how-it-works"
                            className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-800"
                        >
                            How It Works
                        </Link>
                        <Link
                            href="#features"
                            className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-800"
                        >
                            Features
                        </Link>
                        <Link
                            href="/dashboard"
                            className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-800"
                        >
                            Dashboard
                        </Link>
                    </div>

                    {/* Right side actions */}
                    <div className="flex items-center gap-3">
                        <button className="hidden items-center gap-1.5 rounded-full border border-blue-200/50 bg-white/30 px-4 py-2 text-sm font-medium text-blue-700 backdrop-blur-sm transition-all duration-200 hover:bg-white/50 sm:flex">
                            <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                            </svg>
                            Watch Demo
                        </button>
                        <button className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-blue-600/15 transition-all duration-200 hover:bg-blue-700 hover:shadow-blue-700/20">
                            Get Access
                        </button>
                    </div>
                </nav>
            </div>
        </motion.header>
    );
}
