import { createEvents } from 'ics';
import { writeFileSync } from 'fs';

// 计算复活节日期（使用高斯算法）
function calculateEaster(year) {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month - 1, day);
}

// 计算耶稣受难日（复活节前的星期五）
function calculateGoodFriday(year) {
    const easter = calculateEaster(year);
    const goodFriday = new Date(easter);
    goodFriday.setDate(easter.getDate() - 2); // 复活节前2天
    return goodFriday;
}

// 计算第N个星期X的日期
function getNthWeekday(year, month, weekday, n) {
    // weekday: 0=周日, 1=周一, ..., 6=周六
    // n: 第几个（1=第一个，-1=最后一个）
    const firstDay = new Date(year, month, 1);
    const firstWeekday = firstDay.getDay();
    let offset = (weekday - firstWeekday + 7) % 7;
    
    if (n > 0) {
        // 第N个
        return new Date(year, month, 1 + offset + (n - 1) * 7);
    } else {
        // 最后一个
        const lastDay = new Date(year, month + 1, 0);
        const lastWeekday = lastDay.getDay();
        let lastOffset = (lastWeekday - weekday + 7) % 7;
        return new Date(year, month, lastDay.getDate() - lastOffset);
    }
}

// 获取指定年份的美股休市日期
function getMarketHolidays(year) {
    const holidays = [];

    // 1. 新年 (1月1日)
    holidays.push({
        date: new Date(year, 0, 1),
        name: '新年 (New Year\'s Day)',
        description: '美股休市 - 新年'
    });

    // 2. 马丁·路德·金纪念日 (1月第三个星期一)
    const mlkDay = getNthWeekday(year, 0, 1, 3);
    holidays.push({
        date: mlkDay,
        name: '马丁·路德·金纪念日 (Martin Luther King Jr. Day)',
        description: '美股休市 - 马丁·路德·金纪念日'
    });

    // 3. 总统日 (2月第三个星期一)
    const presidentsDay = getNthWeekday(year, 1, 1, 3);
    holidays.push({
        date: presidentsDay,
        name: '总统日 (Presidents\' Day)',
        description: '美股休市 - 总统日'
    });

    // 4. 耶稣受难日 (Good Friday)
    const goodFriday = calculateGoodFriday(year);
    holidays.push({
        date: goodFriday,
        name: '耶稣受难日 (Good Friday)',
        description: '美股休市 - 耶稣受难日'
    });

    // 5. 阵亡将士纪念日 (5月最后一个星期一)
    const memorialDay = getNthWeekday(year, 4, 1, -1);
    holidays.push({
        date: memorialDay,
        name: '阵亡将士纪念日 (Memorial Day)',
        description: '美股休市 - 阵亡将士纪念日'
    });

    // 6. 六月节 (6月19日)
    holidays.push({
        date: new Date(year, 5, 19),
        name: '六月节 (Juneteenth)',
        description: '美股休市 - 六月节'
    });

    // 7. 独立日 (7月4日)
    holidays.push({
        date: new Date(year, 6, 4),
        name: '独立日 (Independence Day)',
        description: '美股休市 - 独立日'
    });

    // 8. 劳动节 (9月第一个星期一)
    const laborDay = getNthWeekday(year, 8, 1, 1);
    holidays.push({
        date: laborDay,
        name: '劳动节 (Labor Day)',
        description: '美股休市 - 劳动节'
    });

    // 9. 感恩节 (11月第四个星期四)
    const thanksgiving = getNthWeekday(year, 10, 4, 4);
    holidays.push({
        date: thanksgiving,
        name: '感恩节 (Thanksgiving)',
        description: '美股休市 - 感恩节'
    });

    // 10. 圣诞节 (12月25日)
    holidays.push({
        date: new Date(year, 11, 25),
        name: '圣诞节 (Christmas)',
        description: '美股休市 - 圣诞节'
    });

    return holidays;
}

// 生成美股休市日历 ICS 文件
function generateMarketHolidaysCalendar(startYear = new Date().getFullYear(), endYear = new Date().getFullYear() + 1) {
    try {
        console.log(`Generating market holidays calendar from ${startYear} to ${endYear}`);
        
        const events = [];
        
        // 获取所有年份的休市日期
        for (let year = startYear; year <= endYear; year++) {
            const holidays = getMarketHolidays(year);
            
            holidays.forEach(holiday => {
                const date = holiday.date;
                const start = [date.getFullYear(), date.getMonth() + 1, date.getDate()];
                
                events.push({
                    title: holiday.name,
                    description: holiday.description,
                    start: start,
                    startInputType: 'utc',
                    status: 'CONFIRMED',
                    busyStatus: 'FREE',
                    duration: { days: 1 }
                });
            });
        }

        const headerAttributes = {
            productId: 'US Market Holidays Calendar',
            calName: '美股休市日历 (US Market Holidays)',
            method: 'PUBLISH',
        };

        createEvents(events, headerAttributes, (error, value) => {
            if (error) {
                console.error('Error creating market holidays calendar:', error);
                return;
            }
            writeFileSync(`./docs/ics/marketHolidays.ics`, value);
            console.log(`Market holidays calendar .ics file has been saved to ./docs/ics/marketHolidays.ics`);
        });
    } catch (error) {
        console.error('Error generating market holidays ICS calendar:', error);
    }
}

export { generateMarketHolidaysCalendar, getMarketHolidays };

