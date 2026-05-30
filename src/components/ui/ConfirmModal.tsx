"use client";

import { AlertTriangle, X } from "lucide-react";

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmModal({
    isOpen,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    onConfirm,
    onCancel,
}: ConfirmModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3 text-rose-600">
                            <div className="bg-rose-100 p-2 rounded-full">
                                <AlertTriangle className="h-6 w-6" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900">{title}</h2>
                        </div>
                        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 transition-colors">
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                    <p className="mt-4 text-slate-600 leading-relaxed">
                        {message}
                    </p>
                </div>
                <div className="bg-slate-50 px-6 py-4 flex justify-end space-x-3 border-t border-slate-100">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 rounded-lg hover:bg-rose-700 transition-colors shadow-sm"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
