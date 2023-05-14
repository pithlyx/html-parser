function formatString(str, key) {
	let depth = 0;
	let result = '';
	let waiting = false;

	for (let i = 0; i < str.length; i++) {
		const char = str[i];
		if (char === '[' && str[i + 1] !== ']') {
			depth++;
			result += '[\n' + '  '.repeat(depth);
		} else if (char === ']' && str[i - 1] !== '[') {
			waiting = true;
		} else if (waiting && char === ',') {
			depth--;
			result += ',\n' + '  '.repeat(depth);
			waiting = false;
		} else if (char === ',' && str.substring(i + 1).startsWith(key)) {
			result += ',\n' + '  '.repeat(depth);
		} else {
			result += char;
		}
	}
	return result;
}

const inputStr =
	"domBuilder('div',{class:'container'},[domBuilder('div',{id:'inputContainer'},[domBuilder('textarea',{id:'input',placeholder:'Entertext'},[]),domBuilder('button',{id:'submit',class:'btn'},[])]),domBuilder('div',{id:'outputContainer'},[domBuilder('textarea',{id:'output',placeholder:'Output'},[]),domBuilder('button',{id:'copy',class:'btn'},[])])])";
const childKey = 'dom';
console.log(formatString(inputStr, childKey));
