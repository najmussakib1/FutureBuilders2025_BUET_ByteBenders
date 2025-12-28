'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { addCaseNote } from '@/app/actions/alert';
import { Send, User, Stethoscope, Loader2 } from 'lucide-react';

interface CaseNote {
    id: string;
    content: string;
    type: 'INSTRUCTION' | 'UPDATE';
    createdAt: Date;
    doctor?: { name: string };
    worker?: { name: string };
}

interface CaseNotesTimelineProps {
    alertId: string;
    initialNotes: CaseNote[];
    currentUserId: string;
    currentUserRole: 'DOCTOR' | 'WORKER';
}

export default function CaseNotesTimeline({
    alertId,
    initialNotes,
    currentUserId,
    currentUserRole
}: CaseNotesTimelineProps) {
    const [notes, setNotes] = useState<CaseNote[]>(initialNotes);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const router = useRouter();
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [notes]);

    // Keep local state in sync with server state (optional, if parent re-renders)
    useEffect(() => {
        setNotes(initialNotes);
    }, [initialNotes]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;

        console.log('Sending message:', { alertId, newMessage, currentUserRole, currentUserId });
        setSending(true);
        const type = currentUserRole === 'DOCTOR' ? 'INSTRUCTION' : 'UPDATE';

        try {
            const result = await addCaseNote(alertId, newMessage, type, currentUserId);
            console.log('Add note result:', result);
            if (result.success && result.note) {
                // The revalidatePath in the action should handle the server-side update,
                // but we keep the optimistic update for immediate feedback.
                setNotes(prev => [...prev, result.note as any]);
                setNewMessage('');
                router.refresh();
            } else {
                alert(result.error || 'Failed to send message. Please try again.');
            }
        } catch (error) {
            console.error('Failed to send note error:', error);
            alert('A network error occurred. Please check your connection.');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <h3 className="font-bold text-slate-700 flex items-center gap-2">
                    {currentUserRole === 'DOCTOR' ? (
                        <>
                            <Stethoscope size={18} className="text-indigo-600" />
                            Clinical Record & Instructions
                        </>
                    ) : (
                        <>
                            <User size={18} className="text-teal-600" />
                            Doctor's Instructions & Updates
                        </>
                    )}
                </h3>
                <span className="text-xs text-slate-400 font-medium px-2 py-1 bg-white rounded border border-slate-200">
                    Live Chat
                </span>
            </div>

            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[500px] bg-slate-50/50"
            >
                {notes.length === 0 ? (
                    <div className="text-center text-slate-400 py-8 italic text-sm">
                        No messages yet. Start the conversation.
                    </div>
                ) : (
                    notes.map((note) => {
                        const isDoctor = note.type === 'INSTRUCTION';
                        const isMe = (currentUserRole === 'DOCTOR' && isDoctor) || (currentUserRole === 'WORKER' && !isDoctor);

                        return (
                            <div
                                key={note.id}
                                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[80%] rounded-xl p-3 shadow-sm ${isDoctor
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-white border border-slate-200 text-slate-800'
                                    }`}>
                                    <div className={`text-xs font-bold mb-1 flex items-center gap-1 ${isDoctor ? 'text-indigo-200' : 'text-teal-600'
                                        }`}>
                                        {isDoctor ? <Stethoscope size={12} /> : <User size={12} />}
                                        {isDoctor ? note.doctor?.name || 'Doctor' : note.worker?.name || 'Field Worker'}
                                    </div>
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{note.content}</p>
                                    <div className={`text-[10px] mt-2 text-right ${isDoctor ? 'text-indigo-200' : 'text-slate-400'
                                        }`}>
                                        {new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={currentUserRole === 'DOCTOR' ? "Send instruction to worker..." : "Send update to doctor..."}
                    className="flex-1 input-minimal bg-slate-50 border-transparent focus:bg-white transition-colors"
                />
                <button
                    type="submit"
                    disabled={sending || !newMessage.trim()}
                    className={`p-2 rounded-lg transition-all ${currentUserRole === 'DOCTOR'
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        : 'bg-teal-600 hover:bg-teal-700 text-white'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    {sending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                </button>
            </form>
        </div>
    );
}
