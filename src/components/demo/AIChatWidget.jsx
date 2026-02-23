import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Sparkles, Loader2, Bot, User } from 'lucide-react';
import { sendChatMessage } from '../../services/geminiChat';
import { isApiKeyConfigured } from '../../services/geminiAgents';

const STARTER_PROMPTS = [
    'What are my top 3 priorities this month?',
    'Where am I losing the most money?',
    'Which tools can I consolidate?',
];

const AIChatWidget = ({ intakeData, analysisResults, companyName }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [hasGreeted, setHasGreeted] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Focus input when opened
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 200);
        }
    }, [isOpen]);

    // Greeting on first open
    useEffect(() => {
        if (isOpen && !hasGreeted) {
            setHasGreeted(true);
            const name = companyName || 'there';
            setMessages([{
                role: 'assistant',
                content: `Hi ${name === 'Sample Business' ? 'there' : name}! 👋 I'm the SBOS Assistant. I've analyzed all your business data — ask me anything about your results, subscriptions, processes, or next steps.`,
            }]);
        }
    }, [isOpen, hasGreeted, companyName]);

    const handleSend = useCallback(async (text) => {
        const message = text || input.trim();
        if (!message || isLoading) return;

        setInput('');
        const userMsg = { role: 'user', content: message };
        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);

        try {
            if (!isApiKeyConfigured()) {
                throw new Error('API key not configured');
            }

            const history = [...messages, userMsg].map(m => ({
                role: m.role,
                content: m.content,
            }));

            // Remove the new message from history (it's sent separately)
            history.pop();

            const response = await sendChatMessage(message, history, intakeData, analysisResults);
            setMessages(prev => [...prev, { role: 'assistant', content: response }]);
        } catch (err) {
            console.error('Chat error:', err);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, I ran into an issue. Make sure your API key is configured and try again.',
            }]);
        } finally {
            setIsLoading(false);
        }
    }, [input, isLoading, messages, intakeData, analysisResults]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Simple markdown-like formatting
    const formatMessage = (text) => {
        return text
            .split('\n')
            .map((line, i) => {
                // Bold
                let formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                // Bullet points
                if (formatted.startsWith('- ') || formatted.startsWith('• ')) {
                    formatted = `<span class="inline-block w-1.5 h-1.5 rounded-full bg-current opacity-40 mr-2 mt-2 flex-shrink-0"></span><span>${formatted.slice(2)}</span>`;
                    return `<div class="flex items-start" key="${i}">${formatted}</div>`;
                }
                if (formatted.trim() === '') return '<div class="h-2" key="' + i + '"></div>';
                return `<div key="${i}">${formatted}</div>`;
            })
            .join('');
    };

    return (
        <>
            {/* Chat Bubble */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 z-[60] w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-white transition-all duration-300 hover:scale-110 group"
                style={{
                    backgroundColor: 'var(--brand-primary, #2C3FB8)',
                    boxShadow: '0 8px 32px -4px var(--brand-primary-20, rgba(44,63,184,0.2))',
                }}
            >
                {isOpen ? (
                    <X size={22} className="transition-transform duration-200" />
                ) : (
                    <>
                        <MessageCircle size={22} />
                        {/* Pulse ring */}
                        <span
                            className="absolute inset-0 rounded-full animate-ping opacity-20"
                            style={{ backgroundColor: 'var(--brand-primary, #2C3FB8)' }}
                        />
                    </>
                )}
            </button>

            {/* Chat Panel */}
            {isOpen && (
                <div
                    className="fixed bottom-24 right-6 z-[60] w-[380px] max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl border border-sbos-navy/10 flex flex-col overflow-hidden"
                    style={{
                        height: 'min(520px, calc(100vh - 8rem))',
                        animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                >
                    {/* Header */}
                    <div
                        className="px-4 py-3 flex items-center gap-3 border-b border-white/10 flex-shrink-0"
                        style={{
                            background: `linear-gradient(135deg, var(--brand-primary, #2C3FB8), var(--brand-accent, #3366FF))`,
                        }}
                    >
                        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
                            <Bot size={18} className="text-white" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-white">SBOS Assistant</p>
                            <p className="text-[10px] text-white/70 font-mono">Powered by Gemini • Has your data</p>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-white/60 hover:text-white transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-hide">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                {msg.role === 'assistant' && (
                                    <div
                                        className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5"
                                        style={{ backgroundColor: 'var(--brand-primary-10, rgba(44,63,184,0.1))' }}
                                    >
                                        <Sparkles size={12} style={{ color: 'var(--brand-primary, #2C3FB8)' }} />
                                    </div>
                                )}
                                <div
                                    className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed ${msg.role === 'user'
                                            ? 'text-white rounded-br-md'
                                            : 'bg-gray-50 text-sbos-navy rounded-bl-md'
                                        }`}
                                    style={msg.role === 'user' ? { backgroundColor: 'var(--brand-primary, #2C3FB8)' } : undefined}
                                    dangerouslySetInnerHTML={msg.role === 'assistant' ? { __html: formatMessage(msg.content) } : undefined}
                                >
                                    {msg.role === 'user' ? msg.content : undefined}
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex gap-2">
                                <div
                                    className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                                    style={{ backgroundColor: 'var(--brand-primary-10)' }}
                                >
                                    <Sparkles size={12} style={{ color: 'var(--brand-primary)' }} />
                                </div>
                                <div className="px-3.5 py-2.5 bg-gray-50 rounded-2xl rounded-bl-md">
                                    <div className="flex gap-1.5 items-center">
                                        <div className="w-1.5 h-1.5 rounded-full bg-sbos-slate/30 animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="w-1.5 h-1.5 rounded-full bg-sbos-slate/30 animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="w-1.5 h-1.5 rounded-full bg-sbos-slate/30 animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Starter Prompts (only show when no user messages yet) */}
                    {messages.filter(m => m.role === 'user').length === 0 && !isLoading && (
                        <div className="px-4 pb-2 flex flex-wrap gap-1.5 flex-shrink-0">
                            {STARTER_PROMPTS.map((prompt, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSend(prompt)}
                                    className="px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all duration-200 hover:scale-[1.02]"
                                    style={{
                                        color: 'var(--brand-primary, #2C3FB8)',
                                        borderColor: 'var(--brand-primary-15, rgba(44,63,184,0.15))',
                                        backgroundColor: 'var(--brand-primary-10, rgba(44,63,184,0.05))',
                                    }}
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input */}
                    <div className="px-3 py-3 border-t border-gray-100 flex-shrink-0">
                        <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 border border-gray-100 focus-within:border-gray-200 transition-colors">
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask about your business..."
                                className="flex-1 bg-transparent text-sm text-sbos-navy placeholder:text-sbos-slate/40 focus:outline-none"
                                disabled={isLoading}
                            />
                            <button
                                onClick={() => handleSend()}
                                disabled={!input.trim() || isLoading}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-white transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105"
                                style={{ backgroundColor: 'var(--brand-primary, #2C3FB8)' }}
                            >
                                {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Slide-up animation */}
            <style>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(16px) scale(0.96); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </>
    );
};

export default AIChatWidget;
