import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ArrowLeft, IdCard, Mail, Shield, User } from "lucide-react";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/api/auth/signin");
    }

    const { user } = session;

    return (
        <main className="max-w-3xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
                <Link href="/" className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-700 mb-4 transition-colors">
                    <ArrowLeft className="mr-1.5 h-4 w-4" />
                    Back to Dashboard
                </Link>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Account Settings</h1>
                <p className="text-slate-500 mt-1">Manage your profile and Keycloak preferences.</p>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Profile Banner */}
                <div className="bg-indigo-50 px-8 py-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 border-b border-indigo-100">
                    {user.image ? (
                        <img
                            src={user.image}
                            alt={user.name || "Avatar"}
                            className="h-24 w-24 rounded-full object-cover shadow-md ring-4 ring-white"
                        />
                    ) : (
                        <div className="h-24 w-24 rounded-full bg-white shadow-md border-2 border-indigo-100 flex items-center justify-center">
                            <User className="h-10 w-10 text-indigo-300" />
                        </div>
                    )}

                    <div className="text-center sm:text-left mt-2">
                        <h2 className="text-2xl font-bold text-slate-900">{user.name || `${user.given_name} ${user.family_name}`}</h2>
                        <p className="text-indigo-600 font-medium">{user.email}</p>

                        {user.groups && user.groups.length > 0 && (
                            <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-2">
                                {user.groups.map(group => (
                                    <span key={group} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
                                        {group.replace('/', '')} {/* Cleans up Keycloak group prefix if any */}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Details Grid */}
                <div className="p-8">
                    <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
                        <Shield className="h-5 w-5 mr-2 text-slate-400" />
                        SSO Identity Details
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <div className="space-y-1">
                            <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">First Name</label>
                            <div className="flex items-center text-slate-900 font-medium">
                                {user.given_name || <span className="text-slate-300 italic">Not set</span>}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">Last Name</label>
                            <div className="flex items-center text-slate-900 font-medium">
                                {user.family_name || <span className="text-slate-300 italic">Not set</span>}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">Email Address</label>
                            <div className="flex items-center text-slate-900 font-medium">
                                <Mail className="h-4 w-4 mr-2 text-slate-400" />
                                {user.email}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">Keycloak User ID</label>
                            <div className="flex items-center text-slate-500 font-mono text-sm break-all bg-slate-50 p-2 rounded-lg border border-slate-100">
                                <IdCard className="h-4 w-4 mr-2 text-slate-400 shrink-0" />
                                {user.id}
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100">
                        <p className="text-sm text-slate-500 bg-slate-50 p-4 rounded-xl">
                            Profile information (name, email, avatar) is managed centrally by <strong>3-Istor ID</strong>.
                            To update your profile picture or details, please access the Keycloak Account Console.
                        </p>
                        <div className="mt-4">
                            <a
                                href={`${process.env.KEYCLOAK_ISSUER}/account`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                            >
                                Manage Keycloak Account &rarr;
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
