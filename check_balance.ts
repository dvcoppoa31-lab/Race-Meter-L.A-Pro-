import fs from 'fs';
const content = fs.readFileSync('src/App.tsx', 'utf8');
let stack = [];
for (let i = 0; i < content.length; i++) {
    if (content[i] === '(') {
        stack.push(i);
    } else if (content[i] === ')') {
        if (stack.length > 0) {
            stack.pop();
        } else {
            console.log(`Unmatched closing parenthesis at char ${i}`);
        }
    }
}
if (stack.length > 0) {
    console.log(`Unmatched opening parenthesis at char ${stack[stack.length - 1]}`);
    let line = 1;
    for(let i = 0; i < stack[stack.length - 1]; i++) {
        if (content[i] === '\n') line++;
    }
    console.log(`Unmatched opening parenthesis at line ${line}`);
}
