const readline = require('readline-sync');

// 输入
console.log('请输入年');
const year = parseInt(readline.question(''));
console.log('请输入月');
const month = parseInt(readline.question('')) - 1;
console.log('请输入日');
const day = parseInt(readline.question(''));

// 月份
const day_month = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

// 判断是否为闰年改变二月日期
if ((year % 4 == 0 && year % 100 != 0) || year % 400 == 0) {
	day_month[1] = 29;
} else {
	day_month[1] = 28;
}

// 判断日期是否合法
if (year < 1900 || year > 2050) {
	console.log('年份不符合要求！');
	process.exit(1);
}
if (month < 0 || month > 11) {
	console.log('月份不符合要求！');
	process.exit(1);
}
if (!(day >= 1 && day <= day_month[month])) {
	console.log('日期不符合要求 ！');
	process.exit(1);
}

//输出
let dd = new Date(year, month, day);
console.log(`输入日期为${dd.toLocaleDateString().replace(/\//g, '-')}`);
dd.setDate(dd.getDate() + 2);
console.log(`隔日为${dd.toLocaleDateString().replace(/\//g, '-')}`);
