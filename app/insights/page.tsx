"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { useAuth, Task } from '@/lib/AuthContext';
import { ProtectedRoute } from '@/lib/ProtectedRoute';

const doesTaskRepeatOnDate = (task: Task, targetKey: string): boolean => {
  if (!task.repeat || !task.repeatOrigin) return false;
  const origin = new Date(task.repeatOrigin + 'T00:00:00');
  const target = new Date(targetKey + 'T00:00:00');
  if (target < origin) return false;
  const { count, unit } = task.repeat;
  if (unit === 'days') {
    const diff = Math.round((target.getTime() - origin.getTime()) / 86400000);
    return diff % count === 0;
  }
  if (unit === 'weeks') {
    const diff = Math.round((target.getTime() - origin.getTime()) / 86400000);
    return diff % (count * 7) === 0;
  }
  if (unit === 'months') {
    const yearDiff = target.getFullYear() - origin.getFullYear();
    const monthDiff = yearDiff * 12 + (target.getMonth() - origin.getMonth());
    return monthDiff % count === 0 && target.getDate() === origin.getDate();
  }
  if (unit === 'years') {
    const yearDiff = target.getFullYear() - origin.getFullYear();
    return yearDiff % count === 0 &&
      target.getMonth() === origin.getMonth() &&
      target.getDate() === origin.getDate();
  }
  return false;
};

export function InsightsPageContent() {
    const { allTasks, categories } = useAuth();
    const searchParams = useSearchParams();
    const router = useRouter();

    const targetMonthStr = useMemo(() => {
        const d = new Date();
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        return searchParams.get('date')?.substring(0, 7) || `${yyyy}-${mm}`;
    }, [searchParams]);

    const [currentYear, currentMonth] = useMemo(() => {
        return targetMonthStr.split('-').map(Number);
    }, [targetMonthStr]);

    const hoursInMonth = useMemo(() => {
        const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
        return daysInMonth * 24;
    }, [currentYear, currentMonth]);

    const formattedMonthLabel = useMemo(() => {
        const dateObj = new Date(currentYear, currentMonth - 1, 1);
        return dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }, [currentYear, currentMonth]);

    const handleNavigateMonth = (direction: 'prev' | 'next') => {
        let newMonth = direction === 'next' ? currentMonth + 1 : currentMonth - 1;
        let newYear = currentYear;

        if (newMonth > 12) {
            newMonth = 1;
            newYear += 1;
        } else if (newMonth < 1) {
            newMonth = 12;
            newYear -= 1;
        }

        const paddedMonth = String(newMonth).padStart(2, '0');
        router.push(`/insights?date=${newYear}-${paddedMonth}`);
    };

    const monthlyTasks = useMemo(() => {
        let compiled: Task[] = [];
        const daysInTargetMonth = new Date(currentYear, currentMonth, 0).getDate();

        const daysOfThisMonth: string[] = [];
        for (let day = 1; day <= daysInTargetMonth; day++) {
            const formattedDay = String(day).padStart(2, '0');
            daysOfThisMonth.push(`${currentYear}-${String(currentMonth).padStart(2, '0')}-${formattedDay}`);
        }

        const uniqueDatabaseTasks: Task[] = [];
        Object.values(allTasks).flat().forEach(task => {
            if (!uniqueDatabaseTasks.some(t => t.id === task.id)) {
                uniqueDatabaseTasks.push(task);
            }
        });

        daysOfThisMonth.forEach((currentDayKey) => {
            const ownTasks = allTasks[currentDayKey] ?? [];
            const repeatingTasks = uniqueDatabaseTasks.filter(task => {
                const isFromAnotherDay = task.repeatOrigin !== currentDayKey;
                return isFromAnotherDay && doesTaskRepeatOnDate(task, currentDayKey);
            });

            const ownIds = new Set(ownTasks.map(t => t.id));
            const dailyCombinedTasks = [
                ...ownTasks,
                ...repeatingTasks.filter(t => !ownIds.has(t.id))
            ];

            dailyCombinedTasks.forEach(task => {
                compiled.push({ ...task });
            });
        });

        return compiled;
    }, [allTasks, currentYear, currentMonth]);

    const metrics = useMemo(() => {
        let grandTotalHours = 0;
        let tasksCount = monthlyTasks.length;
        const categoryMap: Record<string, { name: string; hours: number; count: number }> = {};

        categories.forEach(cat => {
            categoryMap[cat.id] = { name: cat.name, hours: 0, count: 0 };
        });
        if (!categoryMap['general']) {
            categoryMap['general'] = { name: 'General', hours: 0, count: 0 };
        }

        const timeBlocks = {
            Morning: { label: "Morning", range: "06:00 – 12:00", hours: 0, icon: "🌅" },
            Afternoon: { label: "Afternoon", range: "12:00 – 18:00", hours: 0, icon: "☀️" },
            Evening: { label: "Evening", range: "18:00 – 00:00", hours: 0, icon: "🌆" },
            Night: { label: "Night", range: "00:00 – 06:00", hours: 0, icon: "🌙" },
        };

        monthlyTasks.forEach(task => {
            const durationMinutes = task.end - task.start;
            const hours = durationMinutes > 0 ? durationMinutes / 60 : 0;

            if (task.start >= 360 && task.start < 720) {
                timeBlocks.Morning.hours += hours;
            } else if (task.start >= 720 && task.start < 1080) {
                timeBlocks.Afternoon.hours += hours;
            } else if (task.start >= 1080 && task.start < 1440) {
                timeBlocks.Evening.hours += hours;
            } else {
                timeBlocks.Night.hours += hours;
            }

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

        let peakBlock = timeBlocks.Morning;
            Object.values(timeBlocks).forEach(block => {
                if (block.hours > peakBlock.hours) {
                    peakBlock = block;
                }
            });
        const peakPercentage = grandTotalHours > 0 
            ? Math.round((peakBlock.hours / grandTotalHours) * 100) 
            : 0;

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

        const scheduledPercentage = Number(((grandTotalHours / hoursInMonth) * 100).toFixed(2));
        
        let percentageMessage = "";
        if (scheduledPercentage <= 0) {
            percentageMessage = "You haven't scheduled anything this month. Go to the Dashboard and add your first task!";
        } else if (scheduledPercentage <= 10) {
            percentageMessage = "Great start — you've begun planning your month. Keep building momentum!";
        } else if (scheduledPercentage <= 25) {
            percentageMessage = "You're getting into rhythm. A solid foundation is forming for this month.";
        } else if (scheduledPercentage <= 40) {
            percentageMessage = "Nice progress — you're actively structuring your time now.";
        } else if (scheduledPercentage <= 55) {
            percentageMessage = "Halfway there. Your month is becoming well-organized and intentional.";
        } else if (scheduledPercentage <= 70) {
            percentageMessage = "Strong planning. You're taking real control of your time.";
        } else if (scheduledPercentage <= 85) {
            percentageMessage = "Excellent consistency — your schedule is highly structured.";
        } else if (scheduledPercentage < 100) {
            percentageMessage = "Almost fully planned. Just a few gaps left to optimize.";
        } else {
            percentageMessage = "Fully scheduled — outstanding discipline. Now focus on execution.";
        }

        return {
            totalHours: grandTotalHours.toFixed(1),
            slices: categorySlices,
            backgroundStyle,
            totalTasks: tasksCount,
            taskSlices: taskCountSlices,
            taskCountBackgroundStyle,
            scheduledPercentage,
            percentageMessage,
            peakBlock,
            peakPercentage
        };
    }, [monthlyTasks, categories, hoursInMonth]);

    const navBtnStyle: React.CSSProperties = {
      background: "none",
      border: "1px solid #fff",
      color: "#fff",
      padding: "8px 16px",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "13px",
      fontFamily: "var(--font-geist-sans), sans-serif",
      letterSpacing: "0.5px",
    };

    return (
        <div style={{
            backgroundColor: "#0B0F1A",
            color: "white",
            fontFamily: "var(--font-geist-sans), sans-serif",
            overflowX: "hidden",
            width: "100%"
        }}>
            <div style={{ padding: "40px 24px", maxWidth: "1200px", margin: "0 auto" }}>

                <div style={{ textAlign: "center", marginBottom: "40px" }}>
                    <h1 style={{ fontSize: "48px", fontWeight: "600", margin: "0 0 16px 0", color: "#fff", letterSpacing: "-1px" }}>
                        Your monthly insights are here!
                    </h1>

                    <div style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "24px",
                    }}>
                        <span style={{ fontSize: "16px", fontWeight: "600", color: "#fff", minWidth: "140px", textAlign: "left" }}>
                            {formattedMonthLabel}
                        </span>
                        
                        <div style={{ display: "flex", gap: "6px" }}>
                            <button 
                                onClick={() => handleNavigateMonth('prev')}
                                style={navBtnStyle}
                            >
                                Prev
                            </button>
                            <button 
                                onClick={() => handleNavigateMonth('next')}
                                style={navBtnStyle}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>

                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
                    gap: "24px"
                }}>
                    <div style={{
                        backgroundColor: "#111", border: "1px solid #fff", borderRadius: "12px",
                        padding: "36px", width: "100%", height: "420px",
                        display: "flex", flexDirection: "column",
                        color: "white", fontFamily: "var(--font-geist-sans), sans-serif",
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
                        color: "white", fontFamily: "var(--font-geist-sans), sans-serif",
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
                        color: "white", fontFamily: "var(--font-geist-sans), sans-serif",
                        overflow: "hidden", justifyContent: "center", alignItems: "center", gap: "20px",
                        textAlign: "center"
                    }}>
                        <h2 style={{ fontSize: "24px", margin: 0 }}>Total hours scheduled</h2>
                        <h2 style={{ fontSize: "56px", fontWeight: "bold", margin: 0, color: "#fff" }}>
                            {metrics.totalHours}<span style={{ fontSize: "24px", color: "#666", fontWeight: "normal" }}> / {hoursInMonth}</span>
                        </h2>
                        <div style={{ padding: "0 10px" }}>
                            <p style={{ fontSize: "20px", fontWeight: "600", color: "#fff", margin: "0 0 8px 0" }}>
                                {metrics.scheduledPercentage}% Scheduled
                            </p>
                            <p style={{ fontSize: "14px", color: "#aaa", lineHeight: "1.5", margin: 0 }}>
                                {metrics.percentageMessage}
                            </p>
                        </div>
                    </div>

                    <div style={{
                        backgroundColor: "#111", border: "1px solid #fff", borderRadius: "12px",
                        padding: "36px", width: "100%", height: "420px",
                        display: "flex", flexDirection: "column",
                        color: "white", fontFamily: "var(--font-geist-sans), sans-serif",
                        overflow: "hidden", justifyContent: "center", alignItems: "center", gap: "20px",
                        textAlign: "center"
                    }}>
                        <h2 style={{ fontSize: "24px", margin: 0 }}>Peak Focus Window</h2>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <span style={{ fontSize: "64px", marginBottom: "10px" }}>{metrics.peakBlock.icon}</span>
                            <h3 style={{ fontSize: "36px", fontWeight: "bold", margin: 0, color: "#fff" }}>
                                {metrics.peakBlock.label}
                            </h3>
                            <span style={{ fontSize: "16px", color: "#666", marginTop: "4px", letterSpacing: "1px" }}>
                                {metrics.peakBlock.range}
                            </span>
                        </div>
                        <div style={{ padding: "0 10px" }}>
                            {metrics.totalTasks === 0 ? (
                                <p style={{ fontSize: "14px", color: "#aaa", margin: 0 }}>
                                    No tasks tracked yet. Add items to your calendar to discover your peak routines!
                                </p>
                            ) : (
                                <p style={{ fontSize: "14px", color: "#aaa", lineHeight: "1.5", margin: 0 }}>
                                    You are most productive during the <strong style={{ color: "#fff" }}>{metrics.peakBlock.label.toLowerCase()}</strong> hours, 
                                    accounting for <strong style={{ color: "#fff" }}>{metrics.peakPercentage}%</strong> of your total scheduled hours ({metrics.peakBlock.hours.toFixed(1)}h).
                                </p>
                            )}
                        </div>
                    </div>

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