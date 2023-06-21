//命令行读取模块
const readline = require('readline-sync');
// 初始化进程表
const init_process_table = (table) => {
	table.process = [];
	table.size = 0;
};
// 添加进程
const add_process = (table, newProcess) => {
	table.process[table.size++] = newProcess;
	console.log('Add process success!\n');
};
// 删除进程
const del_process = (table, pid) => {
	for (let i = 0; i != table.size; ++i) {
		if (table.process[i].pid == pid) {
			table.process.splice(i, 1);
			--table.size;
			console.log('Delete process success!\n');
			return;
		}
	}
	console.log(`Process:${pid} does not exist...\n`);
};
// 展示当前的所有进程
const show_process = (table, pid) => {
	console.log(`-----------------进程${pid}---------------------\n`);
	console.table(table);
	console.log('--------------------------------------------\n');
};

// 初始化可用表
const init_available_table = (table, capacity) => {
	table.areas = [{}];
	table.capacity = capacity;
	// 一开始只有一个分区,且该分区与整个可用表一样大
	table.areas[0].aid = 0;
	table.areas[0].beginAddr = 0;
	table.areas[0].size = capacity;
	table.size = 1;
};
// 添加分区
const add_area = (table, newArea) => {
	// 已经有了分区
	if ((table.areas, table.capacity != 0)) {
		// 若当前分区数与内存总量相等,则不能再继续添加分区
		if (table.size == table.capacity) {
			console.log('Fail to add area...\n');
		}
		// 若当前分区数小于内存总量,则在表尾直接添加分区即可
		else {
			table.areas[table.size++] = newArea;
			console.log('Add area Success!\n');
		}
	}
	// 表空,说明是无效表
	else assert(table.areas);
};
// 删除分区
const del_area = (table, aid) => {
	for (let i = 0; i != table.size; ++i) {
		if (table.areas[i].aid == aid) {
			table.areas.splice(i, 1);
			--table.size;
			console.log('Delete area success!\n');
			return;
		}
	}
	console.log('Process does not exist\n');
};
// 展示可用表
const show_areas = (table) => {
	console.log('-------------可用表-----------------\n');
	console.table(table.areas);
	console.log('------------------------------------\n');
};

// 释放空间
const finish_process = (table, pro, pid) => {
	//遍历该进程所有
	for (let process of pro.section) {
		// 上、下合并的标记
		let flag = 0;
		// 发生上、下合并时的分区下标
		let upper = 0,
			lower = 0;
		// 检查上下合并
		for (let i = 0; i != table.size; ++i) {
			// 上合并
			if (table.areas[i].beginAddr - 0 + (table.areas[i].size - 0) == process.beginAddr) {
				// 上合并之前若判断flag!=0,说明将发生上下合并
				if (flag) {
					table.areas[i].size += table.areas[lower].size - 0;
					//删除下合并对应的分区
					del_area(table, table.areas[lower].aid);
					break;
				}
				table.areas[i].size = table.areas[i].size + process.size;
				++flag;
				upper = i;
			}
			// 下合并
			else if (process.beginAddr + (process.size - 0) == table.areas[i].beginAddr) {
				// 下合并之前若判断flag!=0,说明将发生上下合并
				if (flag) {
					table.areas[upper].size += table.areas[i].size - 0;
					//删除下合并对应的分区
					del_area(table, table.areas[i].aid);
					break;
				}
				table.areas[i].size = table.areas[i].size + process.size;
				// 选中的可用表空闲区的起始地址也要偏移
				table.areas[i].beginAddr = process.beginAddr;
				++flag;
				lower = i;
			}
		}
		// 若没有发生合并情况,则新创建一个空闲分区,并加入可用表
		if (!flag) {
			let temp = {};
			temp.aid = table.size;
			temp.beginAddr = process.beginAddr;
			temp.size = process.size;
			//在可用表中添加新分区
			add_area(table, temp);
		}
	}
	//在进程表中删除该进程
	del_process(processTable, pid);
	console.log('Release memories success!\n');
};
// 希尔排序(最先适应法)
const shell_sort_in_addr = (arr, size) => {
	for (let gap = Math.floor(size / 2); gap > 0; gap = Math.floor(gap / 2)) {
		for (let i = gap; i != size; ++i) {
			let j = i;
			let temp = arr[j];
			while (j - gap >= 0 && temp?.beginAddr < arr[j - gap]?.beginAddr) {
				// 移动
				arr[j] = arr[j - gap];
				j -= gap;
			}
			arr[j] = temp;
		}
	}
};
// 希尔排序(最佳适应法)
const shell_sort_in_size_best = (arr, size) => {
	for (let gap = Math.floor(size / 2); gap > 0; gap = Math.floor(gap / 2)) {
		for (let i = gap; i != size; ++i) {
			let j = i;
			let temp = arr[j];
			while (j - gap >= 0 && temp.size < arr[j - gap].size) {
				// 移动
				arr[j] = arr[j - gap];
				j -= gap;
			}
			arr[j] = temp;
		}
	}
};
// 希尔排序(最差适应法)
const shell_sort_in_size_worst = (arr, size) => {
	for (let gap = Math.floor(size / 2); gap > 0; gap = Math.floor(gap / 2)) {
		for (let i = gap; i != size; ++i) {
			let j = i;
			let temp = arr[j];
			while (j - gap >= 0 && temp.size > arr[j - gap].size) {
				// 移动
				arr[j] = arr[j - gap];
				j -= gap;
			}
			arr[j] = temp;
		}
	}
};
// 最先适应法
const first_fit_method = (table, process) => {
	if (process.flag == 'y') {
		console.log(' allocate failed\n');
		return;
	}
	shell_sort_in_addr(table.areas, table.size);
	for (let i = 0; i != table.size; ++i) {
		if (table.areas[i].size >= process.size) {
			// 设置进程在内存中的起始地址
			process.beginAddr = table.areas[i].beginAddr;
			// 进程状态置为allocated
			process.flag = 'y';
			// 起始地址偏移
			table.areas[i].beginAddr += process.size;
			// 空闲大小要减小
			table.areas[i].size -= process.size;
			// 若分配后空闲区用光了,就从可用表删除它
			if (table.areas[i].size == 0) {
				del_area(table, table.areas[i].aid);
			}
			console.log(`Allocated success!\n`);
			return;
		}
	}
	console.log(`Fail to allocate memory for process\n`);
};
// 最佳适应法
const best_fit_method = (table, process) => {
	// 检查该进程是否已分配
	if (process.flag == 'y') {
		console.log('该进程已分配空间,无法再分配!\n');
		return;
	}
	shell_sort_in_size_best(table.areas, table.size);
	for (let i = 0; i != table.size; ++i) {
		if (table.areas[i].size >= process.size) {
			// 设置进程在内存中的起始地址
			process.beginAddr = table.areas[i].beginAddr;
			// 进程状态置为allocated
			process.flag = 'y';
			// 起始地址偏移
			table.areas[i].beginAddr += process.size;
			// 空闲大小要减小
			table.areas[i].size -= process.size;
			// 若分配后空闲区用光了,就从可用表删除它
			if (table.areas[i].size == 0) {
				del_area(table, table.areas[i].aid);
			}
			console.log(`Allocated success!\n`);
			return;
		}
	}
	console.log(`Fail to allocate memory for process`);
};
// 最差适应法
const worst_fit_method = (table, process) => {
	// 检查该进程是否已分配
	if (process.flag == 'y') {
		console.log('该进程已分配空间,无法再分配!\n');
		return;
	}
	shell_sort_in_size_worst(table.areas, table.size);
	for (let i = 0; i != table.size; ++i) {
		if (table.areas[i].size >= process.size) {
			// 设置进程在内存中的起始地址
			process.beginAddr = table.areas[i].beginAddr;
			// 进程状态置为allocated
			process.flag = 'y';
			// 起始地址偏移
			table.areas[i].beginAddr += process.size;
			// 空闲大小要减小
			table.areas[i].size -= process.size;
			// 若分配后空闲区用光了,就从可用表删除它
			if (table.areas[i].size == 0) {
				del_area(table, table.areas[i].aid);
			}
			console.log(`Allocated success!\n`);
			return;
		}
		// 最差适应法若第一次就分配失败,则后续不可能成功
		else {
			break;
		}
	}
	console.log('Fail to allocate memory for process\n');
};

//进程表
let processTable = {};
// 初始化进程表
init_process_table(processTable);

//可用表
let availableTable = {};
console.log('请输入空间总大小:');
const totalSize = readline.question('') - 0;

// 初始化可用表
init_available_table(availableTable, totalSize);

//主程序
let select = 0;
console.log('请输入选择的算法，0-最先适应法,1-最佳适应法，2-最差适应法:');
let algorithm = readline.question('') - 0;
while (1) {
	console.log('请输入你的选择:\n');
	console.log('1.创建进程.\n');
	console.log('2.分配空间.\n');
	console.log('3.释放空间.\n');
	console.log('4.查看内存分布情况.\n');
	console.log('0.退出.\n');
	select = readline.question('') - 0;
	switch (select) {
		// 创建进程
		case 1:
			{
				let c;
				do {
					console.log('请输入进程的进程个数:');
					const num = readline.question('') - 0;
					for (let i = 0; i < num; i++) {
						let process = {};
						console.log(`请输入进程号`);
						let pid = readline.question('') - 0;
						process.pid = pid;
						console.log(`请输入进程${pid}所含有的代码段数`);
						let sectionNum = readline.question('') - 0;
						process.sectionNum = sectionNum;
						console.log('请输入每个段的大小:');
						process.section = [];
						for (let j = 0; j < sectionNum; j++) {
							let size = readline.question('') - 0;
							process.section.push({
								flag: 'n',
								size
							});
						}
						add_process(processTable, process);
					}
					console.log('是否还要继续输入?(输入 y/Y or n/N)');
					c = readline.question('');
				} while (c == 'y' || c == 'Y');
			}
			break;
		// 分配空间
		case 2:
			{
				let c;
				let flag = 0;
				do {
					console.log('请输入要分配的进程进程号：');
					let pid = readline.question('') - 0;
					if (algorithm == '0') {
						for (let i = 0; i != processTable.size; ++i) {
							if (processTable.process[i].pid == pid) {
								flag = 1;
								console.log(`请输入想要分配的是进程${pid}第几段(1-${processTable.process[i].sectionNum})`);
								let sectionNum = readline.question('') - 0;
								if (sectionNum > processTable.process[i].sectionNum) {
									console.log('该段代码不存在');
									break;
								}
								if (processTable.process[i].section[sectionNum - 1].flag == 'y') {
									console.log('该段代码已分配空间');
									break;
								} else {
									first_fit_method(availableTable, processTable.process[i].section[sectionNum - 1]);
								}
							}
						}
					} else if (algorithm == '1') {
						for (let i = 0; i != processTable.size; ++i) {
							if (processTable.process[i].pid == pid) {
								flag = 1;
								console.log(`请输入想要分配的是进程${pid}第几段(1-${processTable.process[i].sectionNum})`);
								let sectionNum = readline.question('') - 0;
								if (sectionNum > processTable.process[i].sectionNum) {
									console.log('该段代码不存在');
									break;
								}
								if (processTable.process[i].section[sectionNum - 1].flag == 'y') {
									console.log('该段代码已分配空间');
									break;
								} else {
									best_fit_method(availableTable, processTable.process[i].section[sectionNum - 1]);
									break;
								}
							}
						}
					} else {
						for (let i = 0; i != processTable.size; ++i) {
							if (processTable.process[i].pid == pid) {
								flag = 1;
								console.log(`请输入想要分配的是进程${pid}第几段(1-${processTable.process[i].sectionNum})`);
								let sectionNum = readline.question('') - 0;
								if (sectionNum > processTable.process[i].sectionNum) {
									console.log('该段代码不存在');
									break;
								}
								if (processTable.process[i].section[sectionNum - 1].flag == 'y') {
									console.log('该段代码已分配空间');
									break;
								} else {
									worst_fit_method(availableTable, processTable.process[i].section[sectionNum - 1]);
									break;
								}
							}
						}
					}
					if (flag == 0) {
						console.log('该进程不存在');
					}
					console.log('是否还要继续输入?(输入 y/Y or n/N)');
					c = readline.question('');
				} while (c == 'y' || c == 'Y');
			}
			break;
		// 释放空间
		case 3:
			{
				let pid = 0;
				let c;
				do {
					let flag = 0;
					console.log('请输入你想结束的进程号:');
					pid = readline.question('');
					let temp;
					let flag1 = 0;
					// 查找该进程
					for (let i = 0; i != processTable.size; i++) {
						// 找到该进程
						if (processTable.process[i].pid == pid) {
							// 判断一下该进程是否被分配空间,若没有,则直接从进程表删除即可
							for (let j = 0; j < processTable.process[i].sectionNum; j++) {
								if (processTable.process[i].section[j].flag == 'y') {
									flag1 = 1;
									break;
								}
							}
							if (flag1 == 0) {
								del_process(processTable, pid);
								flag = 1;
								break;
							} else {
								// 若被分配了空间,则释放空间,并从进程表删除
								temp = processTable.process[i];
								finish_process(availableTable, temp, pid);
								flag = 1;
								break;
							}
						}
					}
					if (!flag) {
						console.log('进程号不存在!\n');
					}
					console.log('是否继续释放? y/Y or n/N');
					c = readline.question('');
				} while (c == 'y' || c == 'Y');
			}
			break;
		// 查看内存分布情况
		case 4:
			{
				show_areas(availableTable);
				let c;
				let flag = 0;
				do {
					console.log('请输入想要查看的进程进程号');
					let pid = readline.question('') - 0;
					for (let i = 0; i != processTable.size; i++) {
						if (processTable.process[i].pid == pid) {
							flag = 1;
							show_process(processTable.process[i].section, pid);
							break;
						}
					}
					if (flag == 0) {
						console.log('该进程不存在');
					}
					console.log('是否继续查看进程表? y/Y or n/N');
					c = readline.question('');
				} while (c == 'y' || c == 'Y');
			}
			break;
		case 0:
			{
				console.log('再见!\n');
				process.exit(1);
			}
			break;
		default:
			{
				console.log('输入错误,重来.\n');
			}
			break;
	}
}
