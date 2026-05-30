/* eslint-disable @next/next/no-img-element */

"use client";

import { useProgressStore } from "@/store/useProgressStore";
import { BookOpen, LogIn, LogOut, User } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";

export default function Navbar() {
    const { data: session, status } = useSession();
    const resetAllLocal = useProgressStore((state) => state.resetAllLocal); // <-- Import de l'action de reset

    const handleFederatedLogout = async () => {
        resetAllLocal();

        const res = await fetch('/api/auth/logout-url');
        const data = await res.json();

        await signOut({ redirect: false });

        window.location.href = data.url;
    };

    return (
        <nav className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <Link href="/" className="flex items-center space-x-2 group focus:outline-none">
                        <div className="bg-indigo-600 text-white p-1.5 rounded-lg group-hover:bg-indigo-700 transition-colors">
                            <BookOpen className="h-5 w-5" />
                        </div>
                        <span className="font-bold text-xl tracking-tight text-slate-900">3-Istor QCM</span>
                    </Link>

                    <div className="flex items-center space-x-4">
                        {status === "loading" ? (
                            <div className="h-8 w-24 bg-slate-200 animate-pulse rounded-full"></div>
                        ) : session ? (
                            <div className="flex items-center space-x-3 sm:space-x-4">
                                <Link
                                    href="/profile"
                                    className="flex items-center space-x-2 text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors group"
                                >
                                    {session.user.image ? (
                                        <img src={session.user.image} alt="Avatar" className="h-8 w-8 rounded-full object-cover ring-2 ring-transparent group-hover:ring-indigo-200" />
                                    ) : (
                                        <div className="h-8 w-8 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200 group-hover:border-indigo-300">
                                            <User className="h-4 w-4 text-slate-500 group-hover:text-indigo-500" />
                                        </div>
                                    )}
                                    <span className="hidden sm:inline">{session.user.given_name || session.user.name?.split(' ')[ 0 ] || "Profile"}</span>
                                </Link>

                                <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>

                                <button
                                    onClick={handleFederatedLogout}
                                    className="flex items-center space-x-1.5 px-3 py-1.5 text-sm font-semibold text-slate-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors focus:outline-none"
                                    title="Sign Out"
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span className="hidden sm:inline">Sign Out</span>
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => signIn("keycloak", { callbackUrl: window.location.href })}
                                className="flex items-center space-x-1.5 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all hover:shadow focus:outline-none"
                            >
                                <LogIn className="h-4 w-4" />
                                <span>Sign In</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
