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
    const originDate = searchParams.get('originDate');
    
    const [now, setNow] = useState(new Date());
    const [task, setTask] = useState<any>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isMounted) return;
        const targetLookupDate = originDate || dateParam;
        
        if (taskId && targetLookupDate && allTasks[targetLookupDate]) {
            const dayTasks = allTasks[targetLookupDate] || [];
            const foundTask = dayTasks.find((t: any) => t.id === taskId);
            setTask(foundTask);
        }
    }, [taskId, dateParam, originDate, isMounted, allTasks]);

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    if (!isMounted) {
        return <div style={{ color: 'white', padding: '100px', backgroundColor: '#0B0F1A', minHeight: '100vh', width: '100%' }}>Loading Focus Session...</div>;
    }

    if (!task) {
        return (
            <div style={{ color: 'white', padding: '100px', textAlign: 'center', fontFamily: "var(--font-geist-sans), sans-serif", backgroundColor: '#0B0F1A', minHeight: '100vh', width: '100%' }}>
                <h1 style={{ letterSpacing: '2px' }}>TASK NOT FOUND</h1>
                <p style={{ opacity: 0.6 }}>The task you're looking for couldn't be loaded. It may have been deleted.</p>
                <button 
                    onClick={() => router.push('/')}
                    style={{
                        marginTop: '24px', background: 'none', border: '1px solid #fff',
                        color: '#fff', padding: '10px 20px', cursor: 'pointer',
                        fontFamily: 'var(--font-geist-sans), sans-serif',
                        borderRadius: '12px'
                    }}
                >
                    RETURN TO CLOCK
                </button>
            </div>
        );
    }

    const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;   
    
    const startTime = task.start;
    const endTime = task.end;

    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const taskStartMs = dayStart + (startTime * 60 * 1000);
    const taskEndMs = dayStart + (endTime * 60 * 1000);
    const nowMs = now.getTime();

    const totalDurationSeconds = Math.max(Math.floor((taskEndMs - taskStartMs) / 1000), 1);
    const totalSecondsLeft = Math.max(Math.floor((taskEndMs - nowMs) / 1000), 0);
    const totalSecondsElapsed = Math.max(Math.floor((nowMs - taskStartMs) / 1000), 0);

    const currentMinutes = now.getHours() * 60 + now.getMinutes() + (now.getSeconds() / 60);

    if (todayKey < dateParam!) {
        return (
            <div style={{ color: 'white', padding: '100px', textAlign: 'center', fontFamily: "var(--font-geist-sans), sans-serif", backgroundColor: '#0B0F1A', minHeight: '100vh', width: '100%' }}>
                <h1 style={{ letterSpacing: '2px' }}>UPCOMING SESSION</h1>
                <p style={{ opacity: 0.6 }}>This task is scheduled for {dateParam}. See you then!</p>
                <button 
                    onClick={() => router.push('/')}
                    style={{
                        marginTop: '24px', background: 'none', border: '1px solid #fff',
                        color: '#fff', padding: '10px 20px', cursor: 'pointer',
                        fontFamily: 'var(--font-geist-sans), sans-serif',
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
            <div style={{ color: 'white', padding: '100px', textAlign: 'center', fontFamily: "var(--font-geist-sans), sans-serif", backgroundColor: '#0B0F1A', minHeight: '100vh', width: '100%' }}>
                <h1 style={{ letterSpacing: '2px' }}>PAST SESSION</h1>
                <p style={{ opacity: 0.6 }}>This session happened on {dateParam}.</p>
                <button 
                    onClick={() => router.push('/')}
                    style={{
                        marginTop: '24px', background: 'none', border: '1px solid #fff',
                        color: '#fff', padding: '10px 20px', cursor: 'pointer',
                        fontFamily: 'var(--font-geist-sans), sans-serif',
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
            <div style={{ color: 'white', padding: '100px', textAlign: 'center', fontFamily: "var(--font-geist-sans), sans-serif", backgroundColor: '#0B0F1A', minHeight: '100vh', width: '100%' }}>
                <h1 style={{ letterSpacing: '2px' }}>SESSION NOT STARTED</h1>
                <p style={{ opacity: 0.6 }}>It's the right day, but too early. Sit back and relax :D.</p>
                <button 
                    onClick={() => router.push('/')}
                    style={{
                        marginTop: '24px', background: 'none', border: '1px solid #fff',
                        color: '#fff', padding: '10px 20px', cursor: 'pointer',
                        fontFamily: 'var(--font-geist-sans), sans-serif',
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
            <div style={{ color: 'white', padding: '100px', textAlign: 'center', fontFamily: "var(--font-geist-sans), sans-serif", backgroundColor: '#0B0F1A', minHeight: '100vh', width: '100%' }}>
                <h1 style={{ letterSpacing: '2px', color: task.color }}>SESSION COMPLETE</h1>
                <p style={{ opacity: 0.6 }}>The task is over. You deserve to rest :D.</p>
                <button 
                    onClick={() => router.push('/')}
                    style={{
                        marginTop: '24px', background: 'none', border: '1px solid #fff',
                        color: '#fff', padding: '10px 20px', cursor: 'pointer',
                        fontFamily: 'var(--font-geist-sans), sans-serif',
                        borderRadius: '12px'
                    }}
                >
                    RETURN TO CLOCK
                </button>
            </div>
        );
    }

    const progressPercent = Math.min((totalSecondsElapsed / totalDurationSeconds) * 100, 100);

    const radius = 140;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (totalSecondsElapsed / totalDurationSeconds) * circumference;

    const formatTimeLeft = (totalSecs: number) => {
        if (totalSecs <= 0) return "00:00";
        const mins = Math.floor(totalSecs / 60);
        const secs = totalSecs % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            backgroundColor: "#0B0F1A", color: "white", minHeight: '100vh', width: '100%'
        }}>
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <p style={{ fontSize: '12px', letterSpacing: '4px', color: task.color, marginBottom: '16px', textTransform: 'uppercase' }}>
                    CURRENT SESSION
                </p>
                <h1 style={{ 
                    fontSize: "48px", fontFamily: "var(--font-geist-sans), sans-serif", 
                    letterSpacing: "2.5px", textTransform: "uppercase", margin: "0 0 40px 0"
                }}>
                    {task.name}
                </h1>

                <div style={{ position: 'relative', width: '320px', height: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                        <circle
                            cx="160"
                            cy="160"
                            r={radius}
                            fill="transparent"
                            stroke="#1a1a1a"
                            strokeWidth="8"
                        />
                        <circle
                            cx="160"
                            cy="160"
                            r={radius}
                            fill="transparent"
                            stroke={task.color}
                            strokeWidth="8"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            style={{
                                transition: 'stroke-dashoffset 0.2s ease-out',
                            }}
                        />
                    </svg>
                    <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <span style={{ fontSize: '48px', fontWeight: 'bold', fontVariantNumeric: 'tabular-nums' }}>
                            {formatTimeLeft(totalSecondsLeft)}
                        </span>
                        <span style={{ fontSize: '11px', opacity: 0.5, letterSpacing: '1px', marginTop: '4px' }}>
                            {Math.floor(progressPercent)}% COMPLETE
                        </span>
                    </div>
                </div>
                
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