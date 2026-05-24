"use client";

import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { useAuth, Task } from '@/lib/AuthContext';
import { ProtectedRoute } from '@/lib/ProtectedRoute';

export function InsightsPageContent() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const hoursInMonth = daysInMonth * 24;


    const { allTasks, categories } = useAuth();
    const searchParams = useSearchParams();

    const targetMonthStr = useMemo(() => {
        const d = new Date();
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        return searchParams.get('date')?.substring(0, 7) || `${yyyy}-${mm}`;
    }, [searchParams]);

    const monthlyTasks = useMemo(() => {
        let compiled: Task[] = [];
        Object.entries(allTasks).forEach(([dateKey, dayTasks]) => {
            if (dateKey.startsWith(targetMonthStr)) {
                dayTasks.forEach(task => {
                    if (!compiled.some(t => t.id === task.id)) {
                        compiled.push(task);
                    }
                });
            }
        });
        return compiled;
    }, [allTasks, targetMonthStr]);

    const metrics = useMemo(() => {
        let grandTotalHours = 0;
        let tasksCount = monthlyTasks.length
        const categoryMap: Record<string, { name: string; hours: number; count: number }> = {};

        categories.forEach(cat => {
            categoryMap[cat.id] = { name: cat.name, hours: 0, count: 0 };
        });
        if (!categoryMap['general']) {
            categoryMap['general'] = { name: 'General', hours: 0, count: 0 };
        }

        monthlyTasks.forEach(task => {
            const durationMinutes = task.end - task.start;
            const hours = durationMinutes > 0 ? durationMinutes / 60 : 0;
            grandTotalHours += hours;

            const targetCat = task.categoryId || 'general';
            if (categoryMap[targetCat]) {
                categoryMap[targetCat].hours += hours;
                categoryMap[targetCat].count += 1;
            } else {
                categoryMap['general'].hours += hours;
                categoryMap['general'].count += 1;
            }
        });

        let totalDegreeAccumulator = 0;
        const fallbackColors = ['#ec4899', '#38bdf8', '#f97316', '#a855f7', '#10b981', '#eab308'];
        const gradientSlices: string[] = [];
        const taskCountGradientSlices: string[] = [];

        const categorySlices = Object.entries(categoryMap)
            .filter(([_, data]) => data.hours > 0)
            .map(([id, data], index) => {
                const percentage = grandTotalHours > 0 ? data.hours / grandTotalHours : 0;
                const degrees = percentage * 360;
                const chosenColor = fallbackColors[index % fallbackColors.length];
                return { id, name: data.name, hours: data.hours, count: data.count, degrees, chosenColor };
            });

        categorySlices.forEach(slice => {
            const startDeg = totalDegreeAccumulator;
            totalDegreeAccumulator += slice.degrees;
            gradientSlices.push(`${slice.chosenColor} ${startDeg.toFixed(1)}deg ${totalDegreeAccumulator.toFixed(1)}deg`);
        });

        // Build task count pie chart
        let countTotalDegreeAccumulator = 0;
        const taskCountSlices = Object.entries(categoryMap)
            .filter(([_, data]) => data.count > 0)
            .map(([id, data], index) => {
                const percentage = tasksCount > 0 ? data.count / tasksCount : 0;
                const degrees = percentage * 360;
                const chosenColor = fallbackColors[index % fallbackColors.length];
                return { id, name: data.name, count: data.count, degrees, chosenColor };
            });

        taskCountSlices.forEach(slice => {
            const startDeg = countTotalDegreeAccumulator;
            countTotalDegreeAccumulator += slice.degrees;
            taskCountGradientSlices.push(`${slice.chosenColor} ${startDeg.toFixed(1)}deg ${countTotalDegreeAccumulator.toFixed(1)}deg`);
        });

        const backgroundStyle = gradientSlices.length > 0 
            ? `conic-gradient(${gradientSlices.join(', ')})` 
            : 'conic-gradient(#333 0deg 360deg)';

        const taskCountBackgroundStyle = taskCountGradientSlices.length > 0 
            ? `conic-gradient(${taskCountGradientSlices.join(', ')})` 
            : 'conic-gradient(#333 0deg 360deg)';

        return {
            totalHours: grandTotalHours.toFixed(1),
            slices: categorySlices,
            backgroundStyle,
            totalTasks: tasksCount,
            taskSlices: taskCountSlices,
            taskCountBackgroundStyle
        };
    }, [monthlyTasks, categories]);

    return (
        <div style={{ padding: "40px 24px", maxWidth: "1200px", margin: "0 auto" }}>
            <h1 style={{ fontSize: "48px", textAlign: "center", marginBottom: "40px", color: "#fff" }}>
                Your monthly insights are here! (BETA)
            </h1>
            
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
                gap: "24px"
            }}>
                <div style={{
                    backgroundColor: "#111", border: "1px solid #fff", borderRadius: "12px",
                    padding: "36px", width: "100%", height: "420px",
                    display: "flex", flexDirection: "column",
                    color: "white", fontFamily: "var(--font-cuprum), sans-serif",
                    overflow: "hidden", justifyContent: "center", alignItems: "center", gap: "20px",
                }}>
                    <h2 style={{ fontSize: "24px", margin: 0 }}>Scheduled hours by categories</h2>
                    
                    <div style={{
                        width: "200px",
                        height: "200px",
                        borderRadius: "50%",
                        backgroundImage: metrics.backgroundStyle,
                        transition: "background-image 0.3s ease"
                    }} />

                    <div style={{ 
                        width: "100%", maxHeight: "80px", overflowY: "auto", 
                        display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "10px", fontSize: "14px" 
                    }}>
                        {metrics.slices.length === 0 ? (
                            <span style={{ color: "#666" }}>No task categories scheduled</span>
                        ) : (
                            metrics.slices.map(slice => (
                                <div key={slice.id} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                    <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: slice.chosenColor }} />
                                    <span>{slice.name} ({slice.hours.toFixed(1)}h)</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div style={{
                    backgroundColor: "#111", border: "1px solid #fff", borderRadius: "12px",
                    padding: "36px", width: "100%", height: "420px",
                    display: "flex", flexDirection: "column",
                    color: "white", fontFamily: "var(--font-cuprum), sans-serif",
                    overflow: "hidden", justifyContent: "center", alignItems: "center", gap: "20px",
                }}>
                    <h2 style={{ fontSize: "24px", margin: 0 }}>Task count by category</h2>
                    
                    <div style={{
                        width: "200px",
                        height: "200px",
                        borderRadius: "50%",
                        backgroundImage: metrics.taskCountBackgroundStyle,
                        transition: "background-image 0.3s ease"
                    }} />

                    <div style={{ 
                        width: "100%", maxHeight: "80px", overflowY: "auto", 
                        display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "10px", fontSize: "14px" 
                    }}>
                        {metrics.taskSlices.length === 0 ? (
                            <span style={{ color: "#666" }}>No tasks scheduled</span>
                        ) : (
                            metrics.taskSlices.map(slice => (
                                <div key={slice.id} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                    <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: slice.chosenColor }} />
                                    <span>{slice.name} ({slice.count})</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div style={{
                    backgroundColor: "#111", border: "1px solid #fff", borderRadius: "12px",
                    padding: "36px", width: "100%", height: "420px",
                    display: "flex", flexDirection: "column",
                    color: "white", fontFamily: "var(--font-cuprum), sans-serif",
                    overflow: "hidden", justifyContent: "center", alignItems: "center", gap: "20px",
                }}>
                    <h2 style={{ fontSize: "24px", margin: 0 }}>Total hours scheduled</h2>
                    <h2 style={{ fontSize: "56px", fontWeight: "bold", margin: 0, color: "#fff" }}>
                        {metrics.totalHours}<span style={{ fontSize: "24px", color: "#666", fontWeight: "normal" }}> / {hoursInMonth}</span>
                    </h2>
                </div>
            </div>
        </div>
    );
}

export default function InsightsPage() {
    return (
        <ProtectedRoute>
            <InsightsPageContent />
        </ProtectedRoute>
    );
}