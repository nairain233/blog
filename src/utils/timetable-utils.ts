/**
 * 课程表数据解析工具
 * 解析来自 WakeUp 课程表导出的 JSON 数据
 */

import { siteConfig } from "@/config";
import defaultTimetableRaw from "@/data/timetable/大二上.jsonl?raw";

// 课程表元信息
export interface TimetableMeta {
	courseLen: number; // 课程时长（分钟）
	id: number;
	name: string;
	sameBreakLen: boolean;
	sameLen: boolean;
	theBreakLen: number; // 课间时长（分钟）
}

// 时间节点
export interface TimeNode {
	endTime: string; // "HH:mm"
	node: number; // 第几节
	startTime: string; // "HH:mm"
	timeTable: number;
}

// 课程表显示配置
export interface TimetableConfig {
	background: string;
	id: number;
	maxWeek: number; // 总周数
	nodes: number; // 每天节数
	showSat: boolean;
	showSun: boolean;
	showTime: boolean;
	startDate: string; // 开学日期 "YYYY-M-D"
	sundayFirst: boolean;
	tableName: string;
	[key: string]: unknown;
}

// 课程信息
export interface CourseInfo {
	color: string; // "#AARRGGBB" 格式
	courseName: string;
	credit: number;
	id: number;
	note: string;
	tableId: number;
}

// 课程安排（某门课在某天某节的具体安排）
export interface CourseSchedule {
	day: number; // 星期几 (1-7, 1=周一)
	endWeek: number; // 结束周
	id: number; // 对应 CourseInfo 的 id
	level: number;
	ownTime: boolean;
	room: string; // 教室
	startNode: number; // 开始节次
	startWeek: number; // 开始周
	step: number; // 持续节数
	tableId: number;
	teacher: string; // 教师
	type: number; // 0=每周, 1=单周, 2=双周
}

// 解析后的完整课程表数据
export interface TimetableData {
	meta: TimetableMeta;
	timeNodes: TimeNode[];
	config: TimetableConfig;
	courses: CourseInfo[];
	schedules: CourseSchedule[];
}

// 当前课程状态
export interface CurrentCourseStatus {
	status: "in_class" | "break" | "no_class" | "before_class" | "after_class";
	currentCourse?: ResolvedCourse | null;
	nextCourse?: ResolvedCourse | null;
	currentWeek: number;
	currentDay: number; // 1-7
	semesterEnded: boolean;
	semesterNotStarted: boolean;
}

// 解析后的课程（合并了 CourseInfo 和 CourseSchedule）
export interface ResolvedCourse {
	courseName: string;
	color: string; // 转换后的 CSS 颜色
	teacher: string;
	room: string;
	startNode: number;
	endNode: number; // startNode + step - 1
	step: number;
	startTime: string;
	endTime: string;
	startWeek: number;
	endWeek: number;
	day: number;
	type: number;
	credit: number;
}

function getTzOffsetMs(date: Date, timeZone?: string): number {
	if (!timeZone) return -date.getTimezoneOffset() * 60000;
	try {
		const tzDate = new Date(date.toLocaleString("en-US", { timeZone }));
		const localDate = new Date(date.toLocaleString("en-US"));
		return (
			tzDate.getTime() - localDate.getTime() + -date.getTimezoneOffset() * 60000
		);
	} catch {
		return -date.getTimezoneOffset() * 60000;
	}
}

function getTzDateParts(date: Date): {
	day: number;
	hours: number;
	minutes: number;
} {
	const tzDate = new Date(
		date.getTime() + getTzOffsetMs(date, siteConfig.timezone),
	);
	return {
		day: tzDate.getUTCDay(),
		hours: tzDate.getUTCHours(),
		minutes: tzDate.getUTCMinutes(),
	};
}

/**
 * 将 #AARRGGBB 颜色转换为 CSS rgba 格式
 */
export function convertColor(color: string): string {
	if (!color || color.length < 9) return color;
	// #AARRGGBB -> rgba(RR, GG, BB, AA)
	const a = Number.parseInt(color.substring(1, 3), 16);
	const r = Number.parseInt(color.substring(3, 5), 16);
	const g = Number.parseInt(color.substring(5, 7), 16);
	const b = Number.parseInt(color.substring(7, 9), 16);
	return `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(2)})`;
}

/**
 * 将 #AARRGGBB 颜色转换为 #RRGGBB（忽略 alpha）
 */
export function convertColorHex(color: string): string {
	if (!color || color.length < 9) return color;
	return `#${color.substring(3)}`;
}

/**
 * 解析课程表 JSON 文件
 * 文件格式：每行一个 JSON 对象/数组
 */
export function parseTimetableData(
	filePath = "src/data/timetable/大二上.jsonl",
): TimetableData {
	const raw = defaultTimetableRaw;
	if (filePath !== "src/data/timetable/大二上.jsonl") {
		throw new Error(`Unsupported timetable file: ${filePath}`);
	}
	const lines = raw.split("\n").filter((l) => l.trim());

	const meta: TimetableMeta = JSON.parse(lines[0]);
	const timeNodes: TimeNode[] = JSON.parse(lines[1]);
	const config: TimetableConfig = JSON.parse(lines[2]);
	const courses: CourseInfo[] = JSON.parse(lines[3]);
	const schedules: CourseSchedule[] = JSON.parse(lines[4]);

	return { meta, timeNodes, config, courses, schedules };
}

/**
 * 计算当前是第几周
 */
export function getCurrentWeek(startDate: string, now: Date): number {
	// startDate 格式: "YYYY-M-D"
	const parts = startDate.split("-");
	const startYear = Number.parseInt(parts[0], 10);
	const startMonth = Number.parseInt(parts[1], 10) - 1;
	const startDay = Number.parseInt(parts[2], 10);

	// 使用时区 offset 计算，避免服务端时区（如 UTC）导致周次偏移
	const tempDate = new Date(
		Date.UTC(startYear, startMonth, startDay, 0, 0, 0, 0),
	);
	const startMs =
		tempDate.getTime() - getTzOffsetMs(tempDate, siteConfig.timezone);

	const diffMs = now.getTime() - startMs;
	const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
	const week = Math.floor(diffDays / 7) + 1;
	return week;
}

/**
 * 获取当前星期几 (1=周一, 7=周日)
 */
export function getCurrentDay(now: Date): number {
	const { day } = getTzDateParts(now);
	const jsDay = day; // 0=周日
	return jsDay === 0 ? 7 : jsDay;
}

/**
 * 获取某天某周的所有课程（已解析合并）
 */
export function getCoursesForDayAndWeek(
	data: TimetableData,
	day: number,
	week: number,
): ResolvedCourse[] {
	const validTimeNodes = data.timeNodes.filter(
		(n) => n.node <= data.config.nodes,
	);

	return data.schedules
		.filter((s) => {
			if (s.day !== day) return false;
			if (week < s.startWeek || week > s.endWeek) return false;
			// type: 0=每周, 1=单周, 2=双周
			if (s.type === 1 && week % 2 === 0) return false;
			if (s.type === 2 && week % 2 === 1) return false;
			return true;
		})
		.map((s) => {
			const course = data.courses.find((c) => c.id === s.id);
			const startTimeNode = validTimeNodes.find((n) => n.node === s.startNode);
			const endTimeNode = validTimeNodes.find(
				(n) => n.node === s.startNode + s.step - 1,
			);

			return {
				courseName: course?.courseName || "未知课程",
				color: course ? convertColorHex(course.color) : "#888",
				teacher: s.teacher,
				room: s.room,
				startNode: s.startNode,
				endNode: s.startNode + s.step - 1,
				step: s.step,
				startTime: startTimeNode?.startTime || "",
				endTime: endTimeNode?.endTime || "",
				startWeek: s.startWeek,
				endWeek: s.endWeek,
				day: s.day,
				type: s.type,
				credit: course?.credit || 0,
			};
		})
		.sort((a, b) => a.startNode - b.startNode);
}

/**
 * 获取一周所有课程
 */
export function getCoursesForWeek(
	data: TimetableData,
	week: number,
): ResolvedCourse[][] {
	const days = data.config.showSun ? 7 : data.config.showSat ? 6 : 5;
	const result: ResolvedCourse[][] = [];
	for (let d = 1; d <= days; d++) {
		result.push(getCoursesForDayAndWeek(data, d, week));
	}
	return result;
}

/**
 * 计算当前课程状态（用于侧边栏显示）
 * 注意：此函数用于服务端渲染初始状态，客户端会实时更新
 */
export function getCurrentCourseStatus(
	data: TimetableData,
	now: Date,
): CurrentCourseStatus {
	const week = getCurrentWeek(data.config.startDate, now);
	const day = getCurrentDay(now);
	const { hours, minutes } = getTzDateParts(now);
	const currentTimeStr = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;

	// 学期未开始或已结束
	if (week < 1) {
		return {
			status: "no_class",
			currentWeek: week,
			currentDay: day,
			semesterEnded: false,
			semesterNotStarted: true,
		};
	}
	if (week > data.config.maxWeek) {
		return {
			status: "no_class",
			currentWeek: week,
			currentDay: day,
			semesterEnded: true,
			semesterNotStarted: false,
		};
	}

	const todayCourses = getCoursesForDayAndWeek(data, day, week);

	if (todayCourses.length === 0) {
		return {
			status: "no_class",
			currentWeek: week,
			currentDay: day,
			semesterEnded: false,
			semesterNotStarted: false,
		};
	}

	// 查找当前正在上的课和下一节课
	let currentCourse: ResolvedCourse | null = null;
	let nextCourse: ResolvedCourse | null = null;

	for (const course of todayCourses) {
		if (currentTimeStr >= course.startTime && currentTimeStr < course.endTime) {
			currentCourse = course;
		} else if (currentTimeStr < course.startTime && !nextCourse) {
			nextCourse = course;
		}
	}

	if (currentCourse) {
		// 正在上课，找下一节
		const nextIdx = todayCourses.indexOf(currentCourse) + 1;
		if (nextIdx < todayCourses.length) {
			nextCourse = todayCourses[nextIdx];
		}
		return {
			status: "in_class",
			currentCourse,
			nextCourse,
			currentWeek: week,
			currentDay: day,
			semesterEnded: false,
			semesterNotStarted: false,
		};
	}

	if (nextCourse) {
		// 课间或还没开始
		const firstCourse = todayCourses[0];
		if (currentTimeStr < firstCourse.startTime) {
			return {
				status: "before_class",
				nextCourse,
				currentWeek: week,
				currentDay: day,
				semesterEnded: false,
				semesterNotStarted: false,
			};
		}
		return {
			status: "break",
			nextCourse,
			currentWeek: week,
			currentDay: day,
			semesterEnded: false,
			semesterNotStarted: false,
		};
	}

	// 今天的课都上完了
	return {
		status: "after_class",
		currentWeek: week,
		currentDay: day,
		semesterEnded: false,
		semesterNotStarted: false,
	};
}
