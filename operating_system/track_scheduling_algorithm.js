//命令行读取模块
const readline = require('readline-sync');
//磁道的范围为0-200
const max = 200;
//电梯算法
const scan = (ptr, arr, direction, result) => {
	//创建数组备份
	const tmp = [...arr];
	//对数组排序
	tmp.sort((a, b) => a - b);
	for (let i = 0; i < tmp.length - 1; i++) {
		//寻找当前指针在数组的位置
		if (tmp[i] < ptr && tmp[i + 1] >= ptr) {
			//若一开始的方向为由小向大
			if (direction == 0) {
				//存入指针开始从小到大遍历项
				result.push(tmp.slice(i + 1));
				//存入指针开始从大到小遍历项
				result.push(tmp.slice(0, i + 1).reverse());
				//返回序列长度
				return max * 2 - ptr - tmp[0];
			} else {
				//存入指针开始从大到小遍历项
				result.push(tmp.slice(0, i + 1).reverse());
				//存入指针开始从小到大遍历项
				result.push(tmp.slice(i + 1));
				//返回序列长度
				return ptr - 0 + tmp[tmp.length - 1];
			}
		}
	}
};
//最短寻道时间优先法
const sstf = (ptr, arr, result) => {
	//创建数组备份
	let tmp = [...arr];
	//总磁道序列长度
	let count = 0;
	for (let i = 0; i < arr.length; i++) {
		//choice:当前寻找项，min：该次移动距离
		let choice = 0,
			min = max;
		//寻找离当前指针最近的磁道
		for (let j = 0; j < tmp.length; j++) {
			if (Math.abs(tmp[j] - ptr) < min) {
				min = Math.abs(tmp[j] - ptr);
				choice = j;
			}
		}
		//若找到
		if (min != max) {
			//总序列长度加上该此移动距离
			count += min;
			//存储访问路径
			result.push(tmp[choice]);
			//修改指针到当前访问位置
			ptr = tmp[choice];
			//在备份数组中删去当前被访问的项
			tmp = [...tmp.slice(0, choice), ...tmp.slice(choice + 1)];
			min = max;
		}
	}
	//返回序列长度
	return count;
};
//先来先服务算法
const fcfs = (ptr, arr) => {
	//总磁道序列长度
	let count = 0;
	for (let i = 0; i < arr.length; i++) {
		//总序列长度加上该此移动距离
		count += Math.abs(arr[i] - ptr);
		//移动指针
		ptr = arr[i];
	}
	//返回序列长度
	return count;
};
//主程序
console.log('请输入磁头位置');
const ptr = readline.question('') - 0;
let tmp = ptr;
const arr = [];
let result = [];
console.log('请输入访问序列，输入-1结束');
while (1) {
	let path = readline.question('') - 0;
	if (path == -1) {
		break;
	}
	arr.push(path);
}
while (1) {
	console.log('请选择使用算法，0-电梯算法，1-最短寻道时间优先法，2-先来先服务算法,3退出主程序');
	let select = readline.question('') - 0;
	switch (select) {
		case 0:
			console.log('请选择方向，0-由小到大，1-由大到小');
			let direction = readline.question('') - 0;
			console.log(`总磁道序列为${scan(tmp, arr, direction, result)}`);
			console.log(`访问路径为${result}`);
			result = [];
			tmp = ptr;
			break;
		case 1:
			console.log(`总磁道序列为${sstf(tmp, arr, result)}`);
			console.log(`访问路径为${result}`);
			result = [];
			tmp = ptr;
			break;
		case 2:
			console.log(`总磁道序列为${fcfs(tmp, arr, result)}`);
			console.log(`访问路径为${arr}`);
			tmp = ptr;
			result = [];
			break;
		case 3:
			console.log('再见!\n');
			process.exit(1);
		default:
			console.log('输入错误,重来.\n');
			break;
	}
}
