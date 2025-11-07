import { generateMarketHolidaysCalendar } from './marketHolidays.js';

// 获取当前年份和下一年的休市日历
const currentYear = new Date().getFullYear();
const nextYear = currentYear + 1;

// 生成休市日历
generateMarketHolidaysCalendar(currentYear, nextYear);

