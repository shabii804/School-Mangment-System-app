// ═══════════════════════════════════════════════════════════════
// AI ENGINE — Smart algorithms for school management
// Pure functions that take data and return intelligent outputs.
// ═══════════════════════════════════════════════════════════════

import type { Student, Teacher, Staff } from "./sms-data";

// ─── Types ───
export interface TimetableSlot {
  day: string;
  period: number;
  subject: string;
  teacher: string;
  room: string;
}

export interface ExamSlot {
  date: string;
  class: string;
  subject: string;
  time: string;
  room: string;
}

export interface DefaulterRisk {
  studentId: string;
  studentName: string;
  class: string;
  riskScore: number; // 0-100
  riskLevel: "Low" | "Medium" | "High" | "Critical";
  reasons: string[];
}

export interface SeatArrangement {
  room: string;
  rows: number;
  cols: number;
  seats: { row: number; col: number; rollNo: string; name: string; class: string }[];
}

export interface ResultInsight {
  classAvg: number;
  topPerformer: { name: string; pct: number } | null;
  weakSubject: { subject: string; avg: number } | null;
  strongSubject: { subject: string; avg: number } | null;
  passRate: number;
  gradeDistribution: Record<string, number>;
  recommendations: string[];
}

export interface AttendanceInsight {
  avgAttendance: number;
  bestDay: { day: string; pct: number } | null;
  worstDay: { day: string; pct: number } | null;
  chronicallyAbsent: { name: string; rate: number }[];
  trend: "improving" | "declining" | "stable";
  recommendations: string[];
}

export interface ReportComment {
  studentName: string;
  comment: string;
  tone: "excellent" | "good" | "average" | "needs-improvement";
}

// ═══════════════════════════════════════════════════════════════
// 1. AI TIMETABLE GENERATOR
// Distributes subjects evenly, assigns teachers, prevents double-booking
// ═══════════════════════════════════════════════════════════════
export function generateTimetable(opts: {
  subjects: string[];
  teachers: Teacher[];
  className: string;
  days?: string[];
  periodsPerDay?: number;
}): TimetableSlot[] {
  const days = opts.days || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const periodsPerDay = opts.periodsPerDay || 6;
  const { subjects, teachers, className } = opts;

  if (subjects.length === 0) return [];

  // Build subject → eligible teachers map
  const subjectTeachers: Record<string, string[]> = {};
  subjects.forEach(subj => {
    const eligible = teachers.filter(t => t.subjects.includes(subj));
    subjectTeachers[subj] = eligible.map(t => t.name);
  });

  // Track teacher bookings to prevent double-booking
  const teacherBookings: Record<string, Set<string>> = {};
  teachers.forEach(t => { teacherBookings[t.name] = new Set(); });

  const slots: TimetableSlot[] = [];
  const subjectCount: Record<string, number> = {};
  subjects.forEach(s => { subjectCount[s] = 0; });
  const usedToday: Record<string, Set<string>> = {};
  days.forEach(d => { usedToday[d] = new Set(); });

  const baseRoom = `Room ${className.split("-").pop() || "1"}`;

  for (const day of days) {
    for (let period = 1; period <= periodsPerDay; period++) {
      // Prefer subjects not yet used today, sorted by least-used overall
      const candidates = subjects
        .filter(s => !usedToday[day].has(s))
        .sort((a, b) => subjectCount[a] - subjectCount[b]);

      const subject = candidates[0] || subjects.sort((a, b) => subjectCount[a] - subjectCount[b])[0];

      // Find an available teacher
      let assignedTeacher = "—";
      const eligible = subjectTeachers[subject] || [];
      for (const tName of eligible) {
        if (!teacherBookings[tName]?.has(`${day}-${period}`)) {
          assignedTeacher = tName;
          teacherBookings[tName]?.add(`${day}-${period}`);
          break;
        }
      }
      if (assignedTeacher === "—" && eligible.length > 0) {
        assignedTeacher = `${eligible[0]} (busy)`;
      }

      slots.push({ day, period, subject, teacher: assignedTeacher, room: baseRoom });
      usedToday[day].add(subject);
      subjectCount[subject]++;
    }
  }

  return slots;
}

// ═══════════════════════════════════════════════════════════════
// 2. AI EXAM SCHEDULER
// Creates an exam schedule avoiding conflicts (no student has 2 exams same day)
// ═══════════════════════════════════════════════════════════════
export function generateExamSchedule(opts: {
  classes: { name: string; subjects: string[] }[];
  startDate: string;
  examDays?: number;
  slotsPerDay?: number;
}): ExamSlot[] {
  const { classes, startDate } = opts;
  const examDays = opts.examDays || 10;
  const slotsPerDay = opts.slotsPerDay || 2;
  const times = ["09:00 AM", "11:30 AM"];
  const rooms = ["Exam Hall A", "Exam Hall B", "Exam Hall C", "Room 101", "Room 102"];

  if (classes.length === 0) return [];

  // Collect all (class, subject) pairs
  const pairs: { class: string; subject: string }[] = [];
  classes.forEach(c => c.subjects.forEach(s => pairs.push({ class: c.name, subject: s })));

  // Generate exam dates (skip Sundays)
  const dates: string[] = [];
  const start = new Date(startDate);
  let count = 0;
  while (dates.length < examDays && count < 30) {
    const d = new Date(start);
    d.setDate(start.getDate() + count);
    if (d.getDay() !== 0) { // not Sunday
      dates.push(d.toISOString().split("T")[0]);
    }
    count++;
  }

  // Track which class had an exam on which date (to avoid 2 exams same day for same class)
  const classExamDates: Record<string, Set<string>> = {};
  classes.forEach(c => { classExamDates[c.name] = new Set(); });

  const schedule: ExamSlot[] = [];
  let dateIdx = 0;
  let slotIdx = 0;
  let roomIdx = 0;

  for (const pair of pairs) {
    // Find next available slot where this class doesn't already have an exam that day
    let attempts = 0;
    while (attempts < dates.length * slotsPerDay) {
      const date = dates[dateIdx];
      if (!classExamDates[pair.class].has(date)) {
        // This class is free today — schedule it
        schedule.push({
          date,
          class: pair.class,
          subject: pair.subject,
          time: times[slotIdx] || "09:00 AM",
          room: rooms[roomIdx % rooms.length],
        });
        classExamDates[pair.class].add(date);
        slotIdx++;
        if (slotIdx >= slotsPerDay) {
          slotIdx = 0;
          dateIdx++;
        }
        roomIdx++;
        break;
      }
      // Try next slot
      slotIdx++;
      if (slotIdx >= slotsPerDay) {
        slotIdx = 0;
        dateIdx++;
      }
      if (dateIdx >= dates.length) {
        dateIdx = 0; // wrap
      }
      attempts++;
    }
  }

  return schedule.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
}

// ═══════════════════════════════════════════════════════════════
// 3. AI FEE DEFAULTER PREDICTOR
// Predicts which students are at risk of defaulting based on payment patterns
// ═══════════════════════════════════════════════════════════════
export function predictDefaulters(students: Student[], feeCollections: any[]): DefaulterRisk[] {
  const results: DefaulterRisk[] = [];

  for (const student of students) {
    if (student.status !== "Active") continue;
    const risk: DefaulterRisk = {
      studentId: student.id,
      studentName: student.name,
      class: `${student.class}-${student.section}`,
      riskScore: 0,
      riskLevel: "Low",
      reasons: [],
    };

    // Factor 1: Current outstanding amount (high weight)
    if (student.outstandingAmount > 0) {
      const monthlyFee = student.monthlyFee || 1;
      const monthsOwed = student.outstandingAmount / monthlyFee;
      if (monthsOwed >= 3) {
        risk.riskScore += 40;
        risk.reasons.push(`Owes ${monthsOwed.toFixed(1)} months of fees (Rs. ${student.outstandingAmount.toLocaleString()})`);
      } else if (monthsOwed >= 2) {
        risk.riskScore += 25;
        risk.reasons.push(`Owes ${monthsOwed.toFixed(1)} months (Rs. ${student.outstandingAmount.toLocaleString()})`);
      } else if (monthsOwed >= 1) {
        risk.riskScore += 15;
        risk.reasons.push(`1 month outstanding (Rs. ${student.outstandingAmount.toLocaleString()})`);
      }
    }

    // Factor 2: Payment history — count of fee collections in the last 12 months
    // (not calendar year — academic sessions span 2 calendar years)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    const twelveMonthsAgoStr = twelveMonthsAgo.toISOString().slice(0, 10);
    const studentCollections = feeCollections.filter(
      f => f.studentId === student.id && f.date >= twelveMonthsAgoStr
    );
    if (studentCollections.length === 0) {
      risk.riskScore += 20;
      risk.reasons.push("No fee payments in the last 12 months");
    } else if (studentCollections.length < 6) {
      // Fewer than 6 payments in 12 months = irregular
      risk.riskScore += 10;
      risk.reasons.push("Irregular payment pattern");
    }

    // Factor 3: Fee paid this month?
    if (!student.feePaidThisMonth && new Date().getDate() > 10) {
      risk.riskScore += 15;
      risk.reasons.push("Current month fee unpaid");
    }

    // Factor 4: Hosteller with outstanding (hostel fees are higher risk)
    if (student.isHosteller && student.outstandingAmount > 0) {
      risk.riskScore += 10;
      risk.reasons.push("Hosteller with outstanding dues");
    }

    // Determine risk level
    if (risk.riskScore >= 60) risk.riskLevel = "Critical";
    else if (risk.riskScore >= 40) risk.riskLevel = "High";
    else if (risk.riskScore >= 20) risk.riskLevel = "Medium";
    else risk.riskLevel = "Low";

    if (risk.riskScore > 0) results.push(risk);
  }

  return results.sort((a, b) => b.riskScore - a.riskScore);
}

// ═══════════════════════════════════════════════════════════════
// 4. AI EXAM SEAT ARRANGER
// Creates seating plan mixing students to prevent cheating
// ═══════════════════════════════════════════════════════════════
export function arrangeExamSeats(opts: {
  students: { id: string; name: string; rollNo: string; class: string }[];
  classes: string[];
  rooms?: { name: string; rows: number; cols: number }[];
}): SeatArrangement[] {
  const { students, classes } = opts;
  const rooms = opts.rooms || [
    { name: "Exam Hall A", rows: 5, cols: 6 },
    { name: "Exam Hall B", rows: 5, cols: 6 },
  ];

  if (students.length === 0) return [];

  // Shuffle students within each class, then interleave so no two same-class students sit adjacent
  const byClass: Record<string, typeof students> = {};
  classes.forEach(c => { byClass[c] = []; });
  students.forEach(s => {
    if (!byClass[s.class]) byClass[s.class] = [];
    byClass[s.class].push(s);
  });

  // Shuffle each class's students
  Object.keys(byClass).forEach(c => {
    byClass[c].sort(() => Math.random() - 0.5);
  });

  // Interleave: round-robin pick from each class
  const interleaved: typeof students = [];
  const queues = Object.values(byClass);
  let remaining = true;
  while (remaining) {
    remaining = false;
    for (const q of queues) {
      if (q.length > 0) {
        interleaved.push(q.shift()!);
        remaining = true;
      }
    }
  }

  // Assign to rooms
  const arrangements: SeatArrangement[] = [];
  let idx = 0;
  for (const room of rooms) {
    const seats: SeatArrangement["seats"] = [];
    for (let row = 0; row < room.rows && idx < interleaved.length; row++) {
      for (let col = 0; col < room.cols && idx < interleaved.length; col++) {
        const s = interleaved[idx];
        seats.push({ row: row + 1, col: col + 1, rollNo: s.rollNo, name: s.name, class: s.class });
        idx++;
      }
    }
    arrangements.push({ room: room.name, rows: room.rows, cols: room.cols, seats });
    if (idx >= interleaved.length) break;
  }

  return arrangements;
}

// ═══════════════════════════════════════════════════════════════
// 5. AI RESULT ANALYZER
// Analyzes marks to generate insights and recommendations
// ═══════════════════════════════════════════════════════════════
export function analyzeResults(opts: {
  marks: { studentName: string; subject: string; obtained: number; total: number }[];
  className: string;
}): ResultInsight {
  const { marks, className } = opts;
  if (marks.length === 0) {
    return {
      classAvg: 0,
      topPerformer: null,
      weakSubject: null,
      strongSubject: null,
      passRate: 0,
      gradeDistribution: {},
      recommendations: ["No marks data available. Enter marks to see insights."],
    };
  }

  // Compute per-student percentages
  const studentTotals: Record<string, { obtained: number; total: number }> = {};
  marks.forEach(m => {
    if (!studentTotals[m.studentName]) studentTotals[m.studentName] = { obtained: 0, total: 0 };
    studentTotals[m.studentName].obtained += m.obtained;
    studentTotals[m.studentName].total += m.total;
  });

  const studentPcts = Object.entries(studentTotals).map(([name, t]) => ({
    name,
    pct: t.total > 0 ? (t.obtained / t.total) * 100 : 0,
  }));

  const classAvg = studentPcts.reduce((s, p) => s + p.pct, 0) / studentPcts.length;
  const topPerformer = studentPcts.sort((a, b) => b.pct - a.pct)[0];

  // Per-subject averages
  const subjectAvgs: Record<string, { total: number; count: number }> = {};
  marks.forEach(m => {
    if (!subjectAvgs[m.subject]) subjectAvgs[m.subject] = { total: 0, count: 0 };
    subjectAvgs[m.subject].total += (m.obtained / m.total) * 100;
    subjectAvgs[m.subject].count++;
  });
  const subjectAvgList = Object.entries(subjectAvgs).map(([subject, s]) => ({
    subject,
    avg: s.count > 0 ? s.total / s.count : 0,
  })).sort((a, b) => a.avg - b.avg);

  const weakSubject = subjectAvgList[0] || null;
  const strongSubject = subjectAvgList[subjectAvgList.length - 1] || null;

  // Pass rate (>= 40%)
  const passRate = (studentPcts.filter(p => p.pct >= 40).length / studentPcts.length) * 100;

  // Grade distribution
  const gradeDistribution: Record<string, number> = { "A+": 0, A: 0, B: 0, C: 0, D: 0, F: 0 };
  studentPcts.forEach(p => {
    if (p.pct >= 90) gradeDistribution["A+"]++;
    else if (p.pct >= 80) gradeDistribution["A"]++;
    else if (p.pct >= 70) gradeDistribution["B"]++;
    else if (p.pct >= 60) gradeDistribution["C"]++;
    else if (p.pct >= 50) gradeDistribution["D"]++;
    else gradeDistribution["F"]++;
  });

  // AI Recommendations
  const recommendations: string[] = [];
  if (classAvg >= 75) {
    recommendations.push(`✅ Class ${className} is performing well with ${classAvg.toFixed(1)}% average. Maintain current teaching methods.`);
  } else if (classAvg >= 50) {
    recommendations.push(`⚠️ Class ${className} average is ${classAvg.toFixed(1)}%. Consider extra support sessions.`);
  } else {
    recommendations.push(`🚨 Class ${className} average is only ${classAvg.toFixed(1)}%. Urgent intervention needed.`);
  }

  if (weakSubject) {
    recommendations.push(`📚 Weakest subject: ${weakSubject.subject} (${weakSubject.avg.toFixed(1)}% avg). Schedule remedial classes.`);
  }
  if (strongSubject) {
    recommendations.push(`🌟 Strongest subject: ${strongSubject.subject} (${strongSubject.avg.toFixed(1)}% avg). Recognize the subject teacher.`);
  }
  if (passRate < 60) {
    recommendations.push(`📉 Pass rate is ${passRate.toFixed(0)}%. Review curriculum difficulty or teaching approach.`);
  } else if (passRate >= 90) {
    recommendations.push(`📈 Excellent pass rate of ${passRate.toFixed(0)}%. Consider advanced topics for top performers.`);
  }
  if (gradeDistribution.F > 0) {
    recommendations.push(`⚠️ ${gradeDistribution.F} student(s) failed. Schedule parent-teacher meetings immediately.`);
  }
  if (topPerformer) {
    recommendations.push(`🏆 Top performer: ${topPerformer.name} (${topPerformer.pct.toFixed(1)}%). Consider for scholarship/award.`);
  }

  return { classAvg, topPerformer, weakSubject, strongSubject, passRate, gradeDistribution, recommendations };
}

// ═══════════════════════════════════════════════════════════════
// 6. AI ATTENDANCE INSIGHTS
// Analyzes attendance records for patterns
// ═══════════════════════════════════════════════════════════════
export function analyzeAttendance(opts: {
  records: { studentId: string; date: string; status: string }[];
  students: Student[];
}): AttendanceInsight {
  const { records, students } = opts;
  if (records.length === 0) {
    return {
      avgAttendance: 0,
      bestDay: null,
      worstDay: null,
      chronicallyAbsent: [],
      trend: "stable",
      recommendations: ["No attendance records yet. Start marking attendance to see insights."],
    };
  }

  // Overall average
  const presentCount = records.filter(r => r.status === "Present" || r.status === "Late").length;
  const avgAttendance = (presentCount / records.length) * 100;

  // Per-day-of-week analysis
  const dayStats: Record<string, { present: number; total: number }> = {};
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  records.forEach(r => {
    const day = dayNames[new Date(r.date).getDay()];
    if (!dayStats[day]) dayStats[day] = { present: 0, total: 0 };
    dayStats[day].total++;
    if (r.status === "Present" || r.status === "Late") dayStats[day].present++;
  });

  const dayList = Object.entries(dayStats).map(([day, s]) => ({
    day,
    pct: s.total > 0 ? (s.present / s.total) * 100 : 0,
  })).sort((a, b) => b.pct - a.pct);

  const bestDay = dayList[0] || null;
  const worstDay = dayList[dayList.length - 1] || null;

  // Chronically absent students (< 75% attendance)
  const studentStats: Record<string, { present: number; total: number }> = {};
  records.forEach(r => {
    if (!studentStats[r.studentId]) studentStats[r.studentId] = { present: 0, total: 0 };
    studentStats[r.studentId].total++;
    if (r.status === "Present" || r.status === "Late") studentStats[r.studentId].present++;
  });

  const chronicallyAbsent = Object.entries(studentStats)
    .map(([id, s]) => {
      const student = students.find(st => st.id === id);
      const rate = s.total > 0 ? (s.present / s.total) * 100 : 0;
      return { name: student?.name || id, rate };
    })
    .filter(s => s.rate < 75)
    .sort((a, b) => a.rate - b.rate);

  // Trend: compare last 7 days vs previous 7 days
  const sortedDates = [...new Set(records.map(r => r.date))].sort();
  const last7 = sortedDates.slice(-7);
  const prev7 = sortedDates.slice(-14, -7);
  const last7Pct = last7.length > 0
    ? (records.filter(r => last7.includes(r.date) && (r.status === "Present" || r.status === "Late")).length /
       records.filter(r => last7.includes(r.date)).length) * 100
    : 0;
  const prev7Pct = prev7.length > 0
    ? (records.filter(r => prev7.includes(r.date) && (r.status === "Present" || r.status === "Late")).length /
       records.filter(r => prev7.includes(r.date)).length) * 100
    : 0;
  const trend: AttendanceInsight["trend"] =
    last7Pct > prev7Pct + 5 ? "improving" :
    last7Pct < prev7Pct - 5 ? "declining" : "stable";

  // Recommendations
  const recommendations: string[] = [];
  if (avgAttendance >= 90) {
    recommendations.push(`✅ Excellent overall attendance (${avgAttendance.toFixed(1)}%). Keep it up!`);
  } else if (avgAttendance >= 75) {
    recommendations.push(`⚠️ Attendance is ${avgAttendance.toFixed(1)}%. Target 90%+ for better academic outcomes.`);
  } else {
    recommendations.push(`🚨 Low attendance (${avgAttendance.toFixed(1)}%). Take immediate action.`);
  }

  if (worstDay && bestDay && worstDay.pct < bestDay.pct - 15) {
    recommendations.push(`📅 Lowest attendance on ${worstDay.day} (${worstDay.pct.toFixed(0)}%). Consider surprise quizzes on this day.`);
  }
  if (chronicallyAbsent.length > 0) {
    recommendations.push(`👥 ${chronicallyAbsent.length} student(s) below 75% attendance. Schedule parent meetings.`);
  }
  if (trend === "improving") {
    recommendations.push(`📈 Trend is improving (last 7 days better than previous 7).`);
  } else if (trend === "declining") {
    recommendations.push(`📉 Trend is declining. Investigate recent causes.`);
  }

  return { avgAttendance, bestDay, worstDay, chronicallyAbsent, trend, recommendations };
}

// ═══════════════════════════════════════════════════════════════
// 7. AI REPORT CARD COMMENT GENERATOR
// Generates personalized teacher comments based on marks
// ═══════════════════════════════════════════════════════════════
export function generateReportComments(opts: {
  marks: { studentName: string; subject: string; obtained: number; total: number }[];
}): ReportComment[] {
  const { marks } = opts;
  if (marks.length === 0) return [];

  // Group by student
  const byStudent: Record<string, { obtained: number; total: number; subjects: { subject: string; pct: number }[] }> = {};
  marks.forEach(m => {
    if (!byStudent[m.studentName]) byStudent[m.studentName] = { obtained: 0, total: 0, subjects: [] };
    byStudent[m.studentName].obtained += m.obtained;
    byStudent[m.studentName].total += m.total;
    byStudent[m.studentName].subjects.push({ subject: m.subject, pct: (m.obtained / m.total) * 100 });
  });

  return Object.entries(byStudent).map(([name, data]) => {
    const pct = data.total > 0 ? (data.obtained / data.total) * 100 : 0;
    const weakSubject = data.subjects.sort((a, b) => a.pct - b.pct)[0];
    const strongSubject = data.subjects.sort((a, b) => b.pct - a.pct)[0];

    let tone: ReportComment["tone"];
    let comment: string;

    if (pct >= 90) {
      tone = "excellent";
      comment = `${name} has demonstrated outstanding academic performance with an overall score of ${pct.toFixed(1)}%. Exceptional work in ${strongSubject.subject} (${strongSubject.pct.toFixed(0)}%). ${name} consistently produces high-quality work and shows great dedication to studies. Highly recommended for academic awards.`;
    } else if (pct >= 75) {
      tone = "good";
      comment = `${name} has shown good academic progress with ${pct.toFixed(1)}% overall. Strong performance in ${strongSubject.subject} (${strongSubject.pct.toFixed(0)}%). To improve further, ${name} should focus more on ${weakSubject.subject} where the score was ${weakSubject.pct.toFixed(0)}%. Keep up the good work!`;
    } else if (pct >= 50) {
      tone = "average";
      comment = `${name} has achieved ${pct.toFixed(1)}% overall — an average performance. While ${strongSubject.subject} (${strongSubject.pct.toFixed(0)}%) shows potential, ${weakSubject.subject} (${weakSubject.pct.toFixed(0)}%) needs significant improvement. ${name} is encouraged to attend extra help sessions and develop better study habits. Regular attendance and active participation will help.`;
    } else {
      tone = "needs-improvement";
      comment = `${name} is currently performing below expectations with ${pct.toFixed(1)}% overall. Urgent attention is needed, especially in ${weakSubject.subject} (${weakSubject.pct.toFixed(0)}%). A parent-teacher meeting is strongly recommended to discuss a support plan. ${name} has potential but needs to develop better study discipline and seek additional academic support.`;
    }

    return { studentName: name, comment, tone };
  });
}

// ═══════════════════════════════════════════════════════════════
// 8. AI SMART NOTIFICATIONS
// Generates contextual notifications based on system state
// ═══════════════════════════════════════════════════════════════
export function generateSmartNotifications(opts: {
  students: Student[];
  teachers: Teacher[];
  staff: Staff[];
  feeCollections: any[];
  attendanceRecords: any[];
}): { title: string; description: string; type: string; priority: "high" | "medium" | "low" }[] {
  const { students, teachers, staff, feeCollections, attendanceRecords } = opts;
  const notifications: { title: string; description: string; type: string; priority: "high" | "medium" | "low" }[] = [];

  // Fee defaulters alert
  const defaulters = students.filter(s => s.outstandingAmount > 0 && s.status === "Active");
  if (defaulters.length > 0) {
    const totalOutstanding = defaulters.reduce((s, d) => s + d.outstandingAmount, 0);
    notifications.push({
      title: `${defaulters.length} students have outstanding fees`,
      description: `Total Rs. ${totalOutstanding.toLocaleString()} pending. Send reminders?`,
      type: "fee",
      priority: totalOutstanding > 100000 ? "high" : "medium",
    });
  }

  // Unpaid this month
  const unpaidThisMonth = students.filter(s => !s.feePaidThisMonth && s.status === "Active");
  if (unpaidThisMonth.length > 0 && new Date().getDate() > 10) {
    notifications.push({
      title: `${unpaidThisMonth.length} students haven't paid this month`,
      description: `Current month fee is pending for ${unpaidThisMonth.length} students.`,
      type: "fee",
      priority: "medium",
    });
  }

  // Low attendance alert
  if (attendanceRecords.length > 0) {
    const todayStr = new Date().toISOString().split("T")[0];
    const todayRecords = attendanceRecords.filter(r => r.date === todayStr);
    if (todayRecords.length > 0) {
      const absentToday = todayRecords.filter(r => r.status === "Absent").length;
      if (absentToday > 0) {
        notifications.push({
          title: `${absentToday} students absent today`,
          description: `Out of ${todayRecords.length} marked, ${absentToday} are absent.`,
          type: "attendance",
          priority: absentToday > 5 ? "high" : "medium",
        });
      }
    }
  }

  // Birthdays today
  const today = new Date().toISOString().slice(5, 10); // MM-DD
  const birthdayStudents = students.filter(s => s.dob && s.dob.slice(5, 10) === today);
  if (birthdayStudents.length > 0) {
    notifications.push({
      title: `${birthdayStudents.length} birthday(s) today`,
      description: birthdayStudents.map(s => s.name).join(", "),
      type: "birthday",
      priority: "low",
    });
  }

  // Teachers without class assignment
  const teachersWithoutClasses = teachers.filter(t => t.classes.length === 0);
  if (teachersWithoutClasses.length > 0) {
    notifications.push({
      title: `${teachersWithoutClasses.length} teacher(s) without class assignment`,
      description: `Assign classes to: ${teachersWithoutClasses.map(t => t.name).join(", ")}`,
      type: "system",
      priority: "low",
    });
  }

  // High outstanding single student
  const criticalDefaulters = defaulters.filter(d => d.outstandingAmount > d.monthlyFee * 3);
  if (criticalDefaulters.length > 0) {
    notifications.push({
      title: `${criticalDefaulters.length} student(s) with critical outstanding`,
      description: `Owe more than 3 months of fees: ${criticalDefaulters.map(d => d.name).slice(0, 3).join(", ")}${criticalDefaulters.length > 3 ? "..." : ""}`,
      type: "fee",
      priority: "high",
    });
  }

  return notifications.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.priority] - order[b.priority];
  });
}
