const fs = require('fs');
//获取文件流
const input = fs.readFileSync('input.txt', 'utf8');
//关键字的存储哈希集合
const keyWord = new Map();
//每一个符号对应的类型的存储数组
const singleWord = new Map();
//所读的当前字符
let c = '';
//所读的字符数组及其字符指针
let token = [];
let ptr = -1;
//回退标志
let back = 0;
//存储识别到的数字
let number = -1;
//存储当前识别到的类型
let sym;
//行
let line = 1;
//新行
let isNowLine = true;
//错误数量
let error = 0;
//错误提示字符串
const prompts = [];
//进入语法单元的符号集
const beginSym = [];
//出语法单元的符号集
const endSym = [];
//match匹配结果
let matchResult;
//临时变量数
let tempNum = 0;
//错误处理
const MATCHED = 0;
const GETOUT = 1;
const TURNOVER = 2;
//四元式组
let code = [];
let progress = 0;

const init = () => {
	keyWord.set('and', 'andSym');
	keyWord.set('begin', 'begin');
	keyWord.set('call', 'call');
	keyWord.set('const', 'constSym');
	keyWord.set('do', 'doSym');
	keyWord.set('end', 'end');
	keyWord.set('if', 'ifSym');
	keyWord.set('procedure', 'procedure');
	keyWord.set('read', 'read');
	keyWord.set('then', 'then');
	keyWord.set('var', 'var');
	keyWord.set('while', 'whileSym');
	keyWord.set('write', 'write');
	keyWord.set('or', 'orSym');
	keyWord.set('not', 'notSym');
	keyWord.set('else', 'elseSym');
	keyWord.set('true', 'trueSym');
	keyWord.set('false', 'falseSym');
	singleWord.set('+', 'plus');
	singleWord.set('-', 'minus');
	singleWord.set('*', 'times');
	singleWord.set('/', 'division');
	singleWord.set('=', 'equal');
	singleWord.set('(', 'lb');
	singleWord.set(')', 'rb');
	singleWord.set(';', 'semicolon');
	singleWord.set(',', 'comma');
	singleWord.set('.', 'period');

	//存储错误集
	//0 program
	prompts.push('The program should begin with if.');
	beginSym.push(new Set(['ifSym']));
	endSym.push(new Set(['over']));

	//1 conditionalStatement
	prompts.push('The conditional statement should begin with if.');
	beginSym.push(new Set(['ifSym']));
	endSym.push(new Set(['period', 'semicolon', 'end', 'elseSym']));

	//2 condition
	prompts.push('The condition should not begin with this.');
	beginSym.push(new Set(['plus', 'minus', 'id', 'unsignedInteger', 'lb', 'notSym', 'trueSym', 'falseSym']));
	endSym.push(new Set(['then', 'rb']));

	//3 cItem
	prompts.push('cItem should not begin with this.');
	beginSym.push(new Set(['plus', 'minus', 'id', 'unsignedInteger', 'lb', 'notSym', 'trueSym', 'falseSym']));
	endSym.push(new Set(['then', 'orSym']));

	//4 cFactor
	prompts.push('cFactor should not begin with this.');
	beginSym.push(new Set(['plus', 'minus', 'id', 'unsignedInteger', 'lb', 'notSym', 'trueSym', 'falseSym']));
	endSym.push(new Set(['then', 'orSym', 'times', 'division']));

	//5 statement
	prompts.push('statement should not begin with this.');
	beginSym.push(new Set(['id', 'ifSym', 'begin']));
	endSym.push(new Set(['period', 'semicolon', 'end', 'elseSym']));

	//6 assignStatement
	prompts.push('assignStatement should begin with identifier.');
	beginSym.push(new Set(['id']));
	endSym.push(new Set(['period', 'semicolon', 'end', 'elseSym']));

	//7 expression
	prompts.push('expression should not begin with this.');
	beginSym.push(new Set(['plus', 'minus', 'id', 'unsignedInteger', 'lb']));
	endSym.push(new Set(['rb', 'equal', 'notEqual', 'lss', 'lsse', 'grt', 'grte', 'andSym', 'then', 'orSym']));

	//8  item
	prompts.push('item should not begin with this.');
	beginSym.push(new Set(['lb', 'id', 'unsignedInteger']));
	endSym.push(
		new Set(['plus', 'minus', 'rb', 'equal', 'notEqual', 'lss', 'lsse', 'grt', 'grte', 'andSym', 'then', 'orSym'])
	);

	//9 factor
	prompts.push('factor should not begin with this.');
	beginSym.push(new Set(['lb', 'id', 'unsignedInteger']));
	endSym.push(
		new Set([
			'times',
			'division',
			'plus',
			'minus',
			'rb',
			'equal',
			'notEqual',
			'lss',
			'lsse',
			'grt',
			'grte',
			'andSym',
			'then',
			'orSym'
		])
	);

	//10 compoundStatement
	prompts.push('compoundStatement should not begin with this.');
	beginSym.push(new Set(['plus', 'minus', 'id', 'unsignedInteger', 'lb', 'notSym']));
	endSym.push(new Set(['then']));

	//11
	prompts.push("The program should end with '.'.");
	beginSym.push(beginSym[0]);
	endSym.push(endSym[0]);

	//12
	prompts.push("'then' should be after condition.");
	beginSym.push(beginSym[1]);
	endSym.push(endSym[1]);

	//13
	prompts.push("'else' is expected here.");
	beginSym.push(beginSym[1]);
	endSym.push(endSym[1]);

	//14
	prompts.push("')' is expeted here.");
	beginSym.push(beginSym[4]);
	endSym.push(endSym[4]);

	//15
	prompts.push("'(' is expeted here.");
	beginSym.push(beginSym[4]);
	endSym.push(endSym[4]);

	//16
	prompts.push('Logical operator is expeted here.');
	beginSym.push(beginSym[4]);
	endSym.push(endSym[4]);

	//17
	prompts.push("':=' is expected here.");
	beginSym.push(beginSym[6]);
	endSym.push(endSym[6]);

	//18
	prompts.push("')' is expected here.");
	beginSym.push(beginSym[9]);
	endSym.push(endSym[9]);

	//19
	prompts.push("'end' is expected here.");
	beginSym.push(beginSym[10]);
	endSym.push(endSym[10]);

	//20
	prompts.push("'not' can not operate with this.");
	beginSym.push(new Set(['lb']));
	endSym.push(endSym[4]);
};

const scan = () => {
	token = [];
	while (progress <= input.length) {
		//置空缓冲区
		ptr = -1;
		if (!isNowLine) {
			line++;
			isNowLine = true;
		}
		//无回退
		if (back != 1) {
			c = input[progress++];
			if (progress >= input.length) {
				sym = 'over';
				return;
			}
		} else {
			back = 0;
		}

		//读走所有空白符
		while (c == ' ' || c == '\n' || c == '\t') {
			if (c == '\n') {
				line++;
			}
			c = input[progress++];
		}

		if ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z')) {
			++ptr;
			token[ptr] = c;
			//扫描得字母或数字
			c = input[progress++];
			while ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c > '0' && c < '9')) {
				++ptr;
				token[ptr] = c;
				c = input[progress++];
				if (progress >= input.length) break;
			}
			//扫描到非字母非数字
			if (c == ' ' || c == '\n' || c == '\t') {
				if (c == '\n') {
					isNowLine = false;
				}
			} else {
				back = 1;
			}
			token[++ptr] = '';
			//搜索是否有关键字匹配
			if (keyWord.has(token.join(''))) {
				sym = keyWord.get(token.join(''));
				return;
			} else {
				sym = 'id';
				return;
			}
		}
		//无符号整型
		else if (c >= '0' && c <= '9') {
			number = c - 0;
			token[++ptr] = c;
			c = input[progress++];
			while (c >= '0' && c <= '9') {
				number *= 10;
				number += c - 0;
				token[++ptr] = c;
				c = input[progress++];
			}
			token[++ptr] = '';
			sym = 'unsignedInteger';
			if (c == ' ' || c == '\n' || c == '\t') {
				if (c == '\n') {
					isNowLine = false;
				}
				return;
			} else {
				back = 1;
			}
		}
		// >= >
		else if (c == '>') {
			token[++ptr] = c;
			c = input[progress++];
			if (c == '=') {
				token[++ptr] = c;
				token[++ptr] = '';
				sym = 'grte';
			} else if (c == ' ' || c == '\n' || c == '\t') {
				sym = grt;
				if (c == '\n') {
					isNowLine = false;
				}
			} else {
				sym = 'grt';
				back = 1;
			}
			return;
		}
		//< <= <>
		else if (c == '<') {
			token[++ptr] = c;
			c = input[progress++];
			if (c == '=') {
				token[++ptr] = c;
				token[++ptr] = '';
				sym = 'lsse';
			} else if (c == '>') {
				token[++ptr] = c;
				token[++ptr] = '';
				sym = 'notEqual';
			} else if (c == ' ' || c == '\n' || c == '\t') {
				sym = 'lss';
				if (c == '\n') {
					isNowLine = false;
				}
			} else {
				back = 1;
				sym = 'lss';
			}
			return;
		}
		//:=
		else if (c == ':') {
			token[++ptr] = c;
			c = input[progress++];
			if (c == '=') {
				token[++ptr] = c;
				token[++ptr] = '';
				sym = 'assign';
			}
			//冒号没有跟=
			else if (c == ' ' || c == '\n' || c == '\t') {
				sym = 'errorlet';
				//报告词法错误
				console.log(`Lexical error:${token.join('')} at Line ${line}`);
				error++;
				if (c == '\n') {
					isNowLine = false;
				}
				continue;
			} else {
				sym = 'errorlet';
				//报告词法错误
				console.log(`Lexical error:${token.join('')} at Line ${line}`);
				error++;
				back = 1;
				//从头开始略过该错误单词
				continue;
			}
			return;
		} else if (
			c == '(' ||
			c == ')' ||
			c == ',' ||
			c == ';' ||
			c == '.' ||
			c == '+' ||
			c == '-' ||
			c == '*' ||
			c == '/' ||
			c == '=' ||
			c == '#'
		) {
			token[++ptr] = c;
			token[++ptr] = '';
			sym = singleWord.get(c);
			return;
		} else {
			//这里要记录
			token[++ptr] = c;
			token[++ptr] = '';
			sym = 'errorlet';
			//报告词法错误
			console.log(`Lexical error:${token.join('')} at Line ${line}`);
			error++;
			//从头开始略过该错误单词
			continue;
		}
	}
	return;
};

const errorHandler = (errorNum) => {
	error++;
	//处理错误返回对应处理结果
	console.log(`Line ${line} word:${token.join('')}`);
	console.log(prompts[errorNum]);
	//从流中读取字符
	scan();
	console.log(token.join(''), sym);
	if (token.length != 0) console.log(token.join(''), sym);
	while (true) {
		if (beginSym[errorNum].has(sym)) {
			return TURNOVER;
		} else if (endSym[errorNum].has(sym) || sym == 'over') {
			return GETOUT;
		} else {
			scan();
			console.log(token.join(''), sym);

			continue;
		}
	}
};

const match1 = (s, errorNum) => {
	if (sym != s) {
		matchResult = errorHandler(errorNum);
	} else {
		scan();
		console.log(token.join(''), sym);
		matchResult = MATCHED;
	}
};

const match = (v, errorNum) => {
	for (let i of v) {
		if (i == sym) {
			scan();
			console.log(token.join(''), sym);
			matchResult = MATCHED;
			return;
		}
	}
	matchResult = errorHandler(errorNum);
	return;
};

//<program> ::= <condS>.
const program = () => {
	while (true) {
		if (sym == 'ifSym') {
			let cdSNL = conditionalStatement();
			match1('period', 11);
			if (matchResult == MATCHED) {
			} else if (matchResult == TURNOVER) {
				continue;
			} else {
				return;
			}
			backPatch(cdSNL);
			return;
		} else {
			if (errorHandler(0) == GETOUT) {
				return;
			}
		}
	}
};
//<condS> ::= if<cond>then<sta>
const conditionalStatement = () => {
	while (true) {
		let cdSNL = {};
		if (sym == 'ifSym') {
			scan();
			console.log(token.join(''), sym);
			let cond = condition();
			match1('then', 12);
			if (matchResult == MATCHED) {
			} else if (matchResult == TURNOVER) {
				continue;
			} else {
				return cdSNL;
			}
			backPatch(cond.trueList);
			let sta1 = statement();
			cdSNL = merge(sta1.nextList, cond.falseList);
			return cdSNL;
		} else {
			if (errorHandler(1) == GETOUT) {
				return cdSNL;
			}
		}
	}
};
//<cond> ::= <cItem>{or<cItem>}
const condition = () => {
	while (true) {
		let cond = { trueList: [], falseList: [] };
		if (
			sym == 'plus' ||
			sym == 'minus' ||
			sym == 'id' ||
			sym == 'unsignedInteger' ||
			sym == 'lb' ||
			sym == 'notSym' ||
			sym == 'trueSym' ||
			sym == 'falseSym'
		) {
			let cI1 = cItem();
			cond = cI1;
			while (sym == 'orSym') {
				scan();
				console.log(token.join(''), sym);

				backPatch(cond.falseList);
				let cI2 = cItem();
				cond.trueList = merge(cond.trueList, cI2.trueList);
				cond.falseList = cI2.falseList;
			}
			return cond;
		} else {
			if (errorHandler(2) == GETOUT) {
				return cond;
			}
		}
	}
};
//<cItem> ::= <cFactor>{and<cFactor>}
const cItem = () => {
	while (true) {
		let cI = { trueList: [], falseList: [] };
		if (
			sym == 'plus' ||
			sym == 'minus' ||
			sym == 'id' ||
			sym == 'unsignedInteger' ||
			sym == 'lb' ||
			sym == 'notSym' ||
			sym == 'trueSym' ||
			sym == 'falseSym'
		) {
			let cF1 = cFactor().first;
			cI = cF1;
			while (sym == 'andSym') {
				scan();
				console.log(token.join(''), sym);
				backPatch(cI.trueList);
				let cF2 = cFactor().first;
				cI.falseList = merge(cI.falseList, cF2.falseList);
				cI.trueList = cF2.trueList;
			}
			return cI;
		} else {
			if (errorHandler(3) == GETOUT) {
				return cI;
			}
		}
	}
};
//<cFactor> ::= <exp>(=|<>|<|<=|>|>=)<exp>|'('<cond>')'|not<cFactor>
const cFactor = () => {
	while (true) {
		let cF = { first: { trueList: [], falseList: [] }, second: true };
		if (sym == 'lb') {
			scan();
			console.log(token.join(''), sym);
			let cond = condition();
			match1('rb', 14);
			if (matchResult == MATCHED) {
			} else if (matchResult == TURNOVER) {
				continue;
			} else {
				return cF;
			}
			cF.first = cond;
			cF.second = true;
			return cF;
		} else if (sym == 'notSym') {
			scan();
			console.log(token.join(''), sym);
			let cF1 = cFactor();
			while (true) {
				if (cF1.second == true) {
					cF.first.falseList = cF1.first.trueList;
					cF.first.trueList = cF1.first.falseList;
					return cF;
				} else {
					if (errorHandler(20) == GETOUT) {
						return cF;
					}
				}
			}
		} else if (sym == 'plus' || sym == 'minus' || sym == 'id' || sym == 'unsignedInteger' || sym == 'lb') {
			let e1Name = expression();
			let v = ['equal', 'notEqual', 'lss', 'lsse', 'grt', 'grte'];
			let cFOp = token.join('');
			match(v, 16);
			if (matchResult == MATCHED) {
			} else if (matchResult == TURNOVER) {
				continue;
			} else {
				return cF;
			}
			let e2Name = expression();
			let nextMarkNum = code.length;
			cF.first.trueList = [nextMarkNum];
			let p = {};
			p.op = 'j' + cFOp;
			p.arg1 = e1Name;
			p.arg2 = e2Name;
			p.markNum = -1;
			code.push(p);
			nextMarkNum = code.length;
			cF.first.falseList = [nextMarkNum];
			p = {};
			p.op = 'j';
			p.arg1 = '_';
			p.arg2 = '_';
			p.markNum = -1;
			code.push(p);
			cF.second = false;
			return cF;
		} else if (sym == 'trueSym') {
			scan();
			console.log(token.join(''), sym);
			let nextMarkNum = code.length;
			cF.first.trueList = [nextMarkNum];
			let p = {};
			p.op = 'j';
			p.arg1 = '_';
			p.arg2 = '_';
			p.markNum = -1;
			code.push(p);
			cF.second = true;
			return cF;
		} else if (sym == 'falseSym') {
			scan();
			console.log(token.join(''), sym);
			let nextMarkNum = code.length;
			cF.first.falseList = [nextMarkNum];
			let p = {};
			p.op = 'j';
			p.arg1 = '_';
			p.arg2 = '_';
			p.markNum = -1;
			code.push(p);
			cF.second = true;
			return cF;
		} else {
			if (errorHandler(4) == GETOUT) {
				return cF;
			}
		}
	}
};
//<sta> ::= <as>|<condS>|<compS>
const statement = () => {
	while (true) {
		let sta = {};
		if (sym == 'id') {
			assignStatement();
			let nextMarkNum = code.length;
			sta.nextList = [nextMarkNum];
			let p = {};
			p.op = 'j';
			p.arg1 = '_';
			p.arg2 = '_';
			p.markNum = -1;
			code.push(p);
			sta.type = 'as';
			return sta;
		} else if (sym == 'ifSym') {
			sta.nextList = conditionalStatement();
			sta.type = 'condS';
			return sta;
		} else if (sym == 'begin') {
			sta = compoundStatement();
			return sta;
		} else {
			if (errorHandler(5) == GETOUT) {
				return sta;
			}
		}
	}
};
//<as> ::= <id>:=<exp>
const assignStatement = () => {
	while (true) {
		if (sym == 'id') {
			let idName = token.join('');
			scan();
			console.log(token.join(''), sym);
			match1('assign', 17);
			if (matchResult == MATCHED) {
			} else if (matchResult == TURNOVER) {
				continue;
			} else {
				return;
			}
			let eName = expression();
			let q = {};
			q.op = ':=';
			q.arg1 = eName;
			q.arg2 = '_';
			q.resultArg = idName;
			q.markNum = -1;
			code.push(q);
			return;
		} else {
			if (errorHandler(6) == GETOUT) {
				return;
			}
		}
	}
};
//<exp> ::= [+|-]<item>{(+|-)<item>}
const expression = () => {
	while (true) {
		let i1Sign = '';
		if (sym == 'plus' || sym == 'minus') {
			i1Sign = token.join('');
			scan();
			console.log(token.join(''), sym);
		}
		if (sym == 'id' || sym == 'unsignedInteger' || sym == 'lb') {
			let i1Name = item();
			let eOldName = '';
			let eName = '';
			let q = {};
			if (i1Sign != '') {
				eOldName = i1Name;
				eName = createName();
				q.op = i1Sign;
				q.arg1 = i1Name;
				q.arg2 = '_';
				q.resultArg = eName;
				q.markNum = -1;
				code.push(q);
			} else {
				eName = i1Name;
			}
			while (sym == 'plus' || sym == 'minus') {
				let i2Op = token.join('');
				scan();
				console.log(token.join(''), sym);
				let q = {};
				let i2Name = item();
				eOldName = eName;
				eName = createName();
				q.op = i2Op;
				q.arg1 = eOldName;
				q.arg2 = i2Name;
				q.resultArg = eName;
				q.markNum = -1;
				code.push(q);
			}
			return eName;
		} else {
			if (errorHandler(7) == GETOUT) {
				return '';
			}
		}
	}
};
//<item> ::= <factor>{(*|/)<factor>}
const item = () => {
	while (true) {
		if (sym == 'id' || sym == 'unsignedInteger' || sym == 'lb') {
			let iName = factor();
			while (sym == 'times' || sym == 'division') {
				let f2Op = token.join('');
				scan();
				console.log(token.join(''), sym);
				let f2Name = factor();
				let iOldName = iName;
				iName = createName();
				let q = {};
				q.op = f2Op;
				q.arg1 = iOldName;
				q.arg2 = f2Name;
				q.resultArg = iName;
				q.markNum = -1;
				code.push(q);
			}
			return iName;
		} else {
			if (errorHandler(8) == GETOUT) {
				return '';
			}
		}
	}
};
//<factor> ::= <id>|<int>|'('<exp>')'
const factor = () => {
	while (true) {
		let fName;
		if (sym == 'id') {
			fName = token.join('');
			scan();
			console.log(token.join(''), sym);
			return fName;
		} else if (sym == 'unsignedInteger') {
			fName = token.join('');
			scan();
			console.log(token.join(''), sym);
			return fName;
		} else if (sym == 'lb') {
			scan();
			console.log(token.join(''), sym);
			fName = expression();
			match('rb', 18);
			if (matchResult == MATCHED) {
			} else if (matchResult == TURNOVER) {
				continue;
			} else {
				return fName;
			}

			return fName;
		} else {
			if (errorHandler(9) == GETOUT) {
				return '';
			}
		}
	}
};
//<compS> ::= begin<sta>{;<sta>}end
const compoundStatement = () => {
	while (true) {
		let compS;
		if (sym == 'begin') {
			scan();
			console.log(token.join(''), sym);
			compS = statement();
			while (sym == 'semicolon') {
				scan();
				console.log(token.join(''), sym);
				if (compS.type == 'as') {
					code.splice(0, code.length - 1);
				} else {
					backPatch(compS.nextList);
				}
				let sta2 = statement();
				compS.nextList = sta2.nextList;
				compS.type = sta2.type;
			}

			match('end', 19);
			if (matchResult == MATCHED) {
			} else if (matchResult == TURNOVER) {
				continue;
			} else {
				return compS;
			}
			return compS;
		} else {
			if (errorHandler(10) == GETOUT) {
				return compS;
			}
		}
	}
};

const createName = () => {
	return 'T' + tempNum++;
};

const backPatch = (list) => {
	for (let i of list) {
		code[i].markNum = code.length;
	}
};

const output = () => {
	let i = 0;
	for (let s of code) {
		if (s.markNum == -1) {
			if (s.arg2 == '_' && s.op != ':=') {
				console.log(`(${i})${s.resultArg} := ${s.op}  ${s.arg1}`);
			} else if (s.arg2 == '_' && s.op == ':=') {
				console.log(`(${i})${s.resultArg} := ${s.arg1}`);
			} else {
				console.log(`(${i})${s.resultArg} :=  ${s.arg1}  ${s.op}  ${s.arg2}`);
			}
		} else {
			if (s.op[0] == 'j' && s.op.length > 1) {
				console.log(`(${i})if  ${s.arg1} ${s.op.substr(1)} ${s.arg2} goto (${s.markNum})`);
			} else {
				console.log(`(${i})goto (${s.markNum})`);
			}
		}
		i++;
	}
	//显示最后一个空三地址码，方便跳转操作
	console.log(`(${i})`);
};
const merge = (l1, l2) => {
	l1 = [...l1, ...l2];
	return l1;
};
//主程序
//初始化
init();
//读首单词
scan();
console.log(token.join(''), sym);
program();
if (error == 0) {
	console.log('Syntax analysis has successed.');
	output();
} else {
	console.log(`The number of errors: ${error}\n"Syntax analysis has failed.`);
}
