"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

function SignInContent() {
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/";
    const error = searchParams.get("error");

    useEffect(() => {
        if (!error) {
            signIn("keycloak", { callbackUrl });
        }
    }, [ callbackUrl, error ]);

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <div className="text-center bg-white p-8 rounded-3xl shadow-sm border border-rose-200 max-w-sm w-full">
                    <h1 className="text-xl font-bold text-rose-600 mb-2">
                        Erreur d&apos;Authentification
                    </h1>
                    <p className="text-sm text-slate-600 mb-4">{error}</p>
                    <Link href="/" className="text-indigo-600 font-medium hover:underline">
                        Retourner à l&apos;accueil
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
            <div className="text-center bg-white p-8 rounded-3xl shadow-sm border border-slate-200 max-w-sm w-full animate-in fade-in duration-200">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <h1 className="text-xl font-bold text-slate-900 mb-2">Redirecting to 3-Istor ID...</h1>
                <p className="text-sm text-slate-500">
                    Please wait while we securely redirect you to the login page.
                </p>
            </div>
        </div>
    );
}

export default function SignInPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        }>
            <SignInContent />
        </Suspense>
    );
}
