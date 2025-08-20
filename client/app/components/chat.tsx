'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import * as React from 'react'
import { Download, User, Bot } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

interface IMessage {
    role: 'assistant' | 'user';
    content?: string;
    documents?: any[];
}

const ChatComponent: React.FC = () => {
    const [message, setMessage] = React.useState<string>('');
    const [messages, setMessages] = React.useState<IMessage[]>([]);
    const messagesEndRef = React.useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    React.useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendChatMessage = async () => {
        if (!message.trim()) return;

        const currentMessage = message;
        // Clear input immediately
        setMessage('');

        // Add user message
        setMessages(prev => [...prev, { role: 'user', content: currentMessage }]);

        try {
            const res = await fetch(`http://localhost:8000/chat?message=${encodeURIComponent(currentMessage)}`);
            const data = await res.json();

            // Add assistant message
            setMessages(prev => [
                ...prev,
                { role: 'assistant', content: data.message, documents: data.docs }
            ]);
        } catch (err) {
            setMessages(prev => [
                ...prev,
                { role: 'assistant', content: 'Error contacting server.' }
            ]);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendChatMessage();
        }
    };

    const handleDownload = (sourcePath: string) => {
        // Open PDF in new tab instead of downloading
        const fileName = sourcePath.split('/').pop() || 'document.pdf';
        const url = `http://localhost:8000/uploads/${fileName}`;
        window.open(url, '_blank');
    };

    // Function to get unique documents
    const getUniqueDocuments = (documents: any[]) => {
        if (!documents || documents.length === 0) return [];
        
        const uniqueDocs = new Map();
        documents.forEach(doc => {
            const sourcePath = doc.metadata?.source;
            if (sourcePath && !uniqueDocs.has(sourcePath)) {
                uniqueDocs.set(sourcePath, doc);
            }
        });
        
        return Array.from(uniqueDocs.values());
    };

    return (
        <div className='flex flex-col h-screen bg-gray-50'>
            {/* Chat Messages */}
            <div className='flex-1 overflow-y-auto p-4 space-y-4'>
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex max-w-[70%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            {/* Icon */}
                            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                msg.role === 'user' 
                                    ? 'bg-blue-500 text-white ml-2' 
                                    : 'bg-green-500 text-white mr-2'
                            }`}>
                                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                            </div>
                            
                            {/* Message Box */}
                            <div className={`rounded-lg px-4 py-3 ${
                                msg.role === 'user' 
                                    ? 'bg-blue-500 text-white' 
                                    : 'bg-white text-gray-800 border border-gray-200'
                            }`}>
                                <div className={`text-sm leading-relaxed ${
                                    msg.role === 'user' ? '' : 'prose prose-sm max-w-none'
                                }`}>
                                    {msg.role === 'user' ? (
                                        <span>{msg.content}</span>
                                    ) : (
                                        <ReactMarkdown
                                            components={{
                                                h1: ({children}) => <h1 className="text-lg font-bold mb-2 text-gray-900">{children}</h1>,
                                                h2: ({children}) => <h2 className="text-base font-bold mb-2 text-gray-900">{children}</h2>,
                                                h3: ({children}) => <h3 className="text-sm font-bold mb-2 text-gray-900">{children}</h3>,
                                                h4: ({children}) => <h4 className="text-sm font-semibold mb-1 text-gray-800">{children}</h4>,
                                                p: ({children}) => <p className="mb-2">{children}</p>,
                                                ul: ({children}) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                                                ol: ({children}) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                                                li: ({children}) => <li className="text-sm">{children}</li>,
                                                strong: ({children}) => <strong className="font-semibold">{children}</strong>,
                                                em: ({children}) => <em className="italic">{children}</em>,
                                                code: ({children}) => <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono">{children}</code>,
                                                pre: ({children}) => <pre className="bg-gray-100 p-2 rounded text-xs font-mono overflow-x-auto mb-2">{children}</pre>,
                                            }}
                                        >
                                            {msg.content || ''}
                                        </ReactMarkdown>
                                    )}
                                </div>
                                
                                {/* Download section for assistant messages with documents */}
                                {msg.role === 'assistant' && msg.documents && msg.documents.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-gray-200">
                                        <div className="text-xs text-gray-500 mb-2 font-medium">Source Documents:</div>
                                        {getUniqueDocuments(msg.documents).map((doc, docIdx) => (
                                            <div key={docIdx} className="flex items-center justify-between bg-gray-50 rounded p-2 mb-1">
                                                <span className="text-xs text-gray-600 truncate flex-1">
                                                    {doc.metadata?.source?.split('/').pop() || 'Document'}
                                                </span>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleDownload(doc.metadata?.source)}
                                                    className="ml-2 h-6 px-2 flex-shrink-0"
                                                >
                                                    <Download size={12} />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                {/* Invisible div for auto-scroll */}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Section */}
            <div className='border-t bg-white p-4'>
                <div className='flex gap-2'>
                    <Input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder='Type your message here'
                        onKeyPress={handleKeyPress}
                        className="flex-1"
                    />
                    <Button onClick={handleSendChatMessage} disabled={!message.trim()}>
                        Send
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ChatComponent