"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { ProtectedRoute } from '@/lib/ProtectedRoute';

export function FocusPageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { allTasks } = useAuth();
    const taskId = searchParams.get('id');
    const dateParam = searchParams.get('date');
    
    const [now, setNow] = useState(new Date());
    const [task, setTask] = useState<any>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isMounted) return;
        
        if (taskId && dateParam && allTasks[dateParam]) {
            const dayTasks = allTasks[dateParam] || [];
            const foundTask = dayTasks.find((t: any) => t.id === taskId);
            setTask(foundTask);
        }
    }, [taskId, dateParam, isMounted, allTasks]);

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    if (!isMounted) {
        return <div style={{ color: 'white', padding: '100px' }}>Loading Focus Session...</div>;
    }

    if (!task) {
        return (
            <div style={{ color: 'white', padding: '100px', textAlign: 'center', fontFamily: "var(--font-cuprum), sans-serif" }}>
                <h1 style={{ letterSpacing: '2px' }}>TASK NOT FOUND</h1>
                <p style={{ opacity: 0.6 }}>The task you're looking for couldn't be loaded. It may have been deleted.</p>
                <button 
                    onClick={() => router.push('/')}
                    style={{
                        marginTop: '24px', background: 'none', border: '1px solid #fff',
                        color: '#fff', padding: '10px 20px', cursor: 'pointer',
                        fontFamily: 'var(--font-cuprum), sans-serif',
                        borderRadius: '12px'
                    }}
                >
                    RETURN TO CLOCK
                </button>
            </div>
        );
    }

    const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;   
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const startTime = task.start;
    const endTime = task.end;

    if (todayKey < dateParam!) {
        return (
            <div style={{ color: 'white', padding: '100px', textAlign: 'center', fontFamily: "var(--font-cuprum), sans-serif" }}>
                <h1 style={{ letterSpacing: '2px' }}>UPCOMING SESSION</h1>
                <p style={{ opacity: 0.6 }}>This task is scheduled for {dateParam}. See you then!</p>
                <button 
                    onClick={() => router.push('/')}
                    style={{
                        marginTop: '24px', background: 'none', border: '1px solid #fff',
                        color: '#fff', padding: '10px 20px', cursor: 'pointer',
                        fontFamily: 'var(--font-cuprum), sans-serif',
                        borderRadius: '12px'
                    }}
                >
                    RETURN TO CLOCK
                </button>
            </div>
        );
    }

    if (todayKey > dateParam!) {
        return (
            <div style={{ color: 'white', padding: '100px', textAlign: 'center', fontFamily: "var(--font-cuprum), sans-serif" }}>
                <h1 style={{ letterSpacing: '2px' }}>PAST SESSION</h1>
                <p style={{ opacity: 0.6 }}>This session happened on {dateParam}.</p>
                <button 
                    onClick={() => router.push('/')}
                    style={{
                        marginTop: '24px', background: 'none', border: '1px solid #fff',
                        color: '#fff', padding: '10px 20px', cursor: 'pointer',
                        fontFamily: 'var(--font-cuprum), sans-serif',
                        borderRadius: '12px'
                    }}
                >
                    RETURN TO CLOCK
                </button>
            </div>
        );
    }

    if (currentMinutes < startTime) {
        return (
            <div style={{ color: 'white', padding: '100px', textAlign: 'center', fontFamily: "var(--font-cuprum), sans-serif" }}>
                <h1 style={{ letterSpacing: '2px' }}>SESSION NOT STARTED</h1>
                <p style={{ opacity: 0.6 }}>It's the right day, but too early. Sit back and relax :D.</p>
                <button 
                    onClick={() => router.push('/')}
                    style={{
                        marginTop: '24px', background: 'none', border: '1px solid #fff',
                        color: '#fff', padding: '10px 20px', cursor: 'pointer',
                        fontFamily: 'var(--font-cuprum), sans-serif',
                        borderRadius: '12px'
                    }}
                >
                    RETURN TO CLOCK
                </button>
            </div>
        );
    }

    if (currentMinutes >= endTime) {
        return (
            <div style={{ color: 'white', padding: '100px', textAlign: 'center', fontFamily: "var(--font-cuprum), sans-serif" }}>
                <h1 style={{ letterSpacing: '2px', color: task.color }}>SESSION COMPLETE</h1>
                <p style={{ opacity: 0.6 }}>The task is over. You deserve to rest :D.</p>
                <button 
                    onClick={() => router.push('/')}
                    style={{
                        marginTop: '24px', background: 'none', border: '1px solid #fff',
                        color: '#fff', padding: '10px 20px', cursor: 'pointer',
                        fontFamily: 'var(--font-cuprum), sans-serif',
                        borderRadius: '12px'
                    }}
                >
                    RETURN TO CLOCK
                </button>
            </div>
        );
    }

    const totalDuration = endTime - startTime;
    const elapsed = currentMinutes - startTime;
    const progressPercent = Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);

    return (
        <div style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            backgroundColor: "#000", color: "white"
        }}>
            <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '12px', letterSpacing: '4px', color: task.color, marginBottom: '16px', textTransform: 'uppercase' }}>
                    CURRENT SESSION
                </p>
                <h1 style={{ 
                    fontSize: "64px", fontFamily: "var(--font-cuprum), sans-serif", 
                    letterSpacing: "2.5px", textTransform: "uppercase", margin: "0 0 40px 0"
                }}>
                    {task.name}
                </h1>
                
                <div style={{ width: '400px', height: '2px', backgroundColor: '#1a1a1a', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ 
                        width: `${progressPercent}%`, height: '100%', 
                        backgroundColor: task.color, boxShadow: `0 0 20px ${task.color}`,
                        transition: 'width 1s linear'
                    }} />
                </div>
                
                <p style={{ marginTop: '20px', fontSize: '12px', opacity: 0.5, letterSpacing: '1px' }}>
                    {Math.floor(progressPercent)}% COMPLETE
                </p>
            </div>
        </div>
    );
}

export default function FocusPage() {
    return (
        <ProtectedRoute>
            <FocusPageContent />
        </ProtectedRoute>
    );
}