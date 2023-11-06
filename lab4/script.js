const H0 = '⌧';
const SUCCESS = 'DONE';

const stack = () => {
  let arr = [];
  let push = (value) => {
    arr.push(value);
    return value;
  }
  let pop = () => {
    return arr.pop();
  }
  let current = () => {
    return arr.at(-1);
  }
  let array = () => {
    return arr;
  }
  let clear = () => {
    let out = pop();
    while(out !== undefined) out = pop();
  }
  return {push, pop, current, array, clear};
}

let {push, pop, current, array, clear} = stack();

let createGraph = () => {
  return {
    state: {
      storeAlphabet: new Set(),
      variables: new Set(),
      functions: new Set(),
    }
  }
}

let graph = createGraph();

let pushExprToStack = (expr) => {
  const regex = /\*[A-Za-z0-9]+\*|./g;
  const results = expr.match(regex).reverse();
  for(let item of results) push(item);
  return results;
}

let read = (str) => {
  let deleteSpaces = (str) => {
    let letters = str.split('');
    return letters.filter((item) => item !== ' ').join('');
  }

  let parse = (str) => {
    let row = deleteSpaces(str);
    let arrow = row.indexOf('>');
    let transitions = row.slice(arrow + 1).split('|');

    let symbol = row.slice(0, arrow);
    return {symbol, transitions};
  }

  let write = (tape, expr) => {
    if(graph[tape] === undefined) graph[tape] = expr;
    else if(Array.isArray(graph[tape])) graph[tape].push(expr);
    else graph[tape] = [graph[tape], expr];
  }

  let rows = str.split('\n');
  for(let row of rows){
    let {symbol, transitions} = parse(row);
    graph.state.storeAlphabet.add(symbol);
    for(let trans of transitions)
      write(symbol, trans);
  }
}

let takeWord = (string, regex) => {
  let result = true;
  let word = string.match(regex);
  string = string.replace(regex, '');
  if(word === null) result = false;
  else word = word[0];
 	
  return [word, string, result];
}

let takeWordFofSignQuestion = (string) => {
  return takeWord(string, /^[\s\t\n]+/);
}

let takeWordFofSignAmpersand = (str) => {
  let [word, string, result] = takeWord(str, /^[\s\t\n]+/);
  if(!result) return ['', string, true]
  else return [word, string, result];
}

let takeSymbol = (str) => takeWord(str, /^./);

let takeSubstring = (str) => takeWord(str, /^[A-z][A-z0-9]+|^[A-z]/);

let takeNumber = (str) => takeWord(str, /^\.[0-9]+|^[0-9]+\.[0-9]+|^[0-9]+\.|^[0-9]+/);

let isTemplate = (str) => {
  return /^\*[A-z0-9]+\*/.test(str);
}

let runLine = (str) => {  
  let curr = current();
  // if(curr == H0) throw Error(SUCCESS);
  if(str === '') throw new Error(SUCCESS);

  let hasInStoreAlpabet = graph.state.storeAlphabet.has(curr); 
  if(hasInStoreAlpabet){
    let transitions = graph[curr];
    if(typeof transitions == 'object'){
      for(let transition of transitions){
        console.log(curr, transitions, transition)
        pop();
        let trans = pushExprToStack(transition);
        runLine(str);
        for(let key of trans) pop();
        push(curr);
      }
    }else{
      console.log(curr, transitions)
      pop();
      let trans = pushExprToStack(transitions);
      runLine(str);
      for(let key of trans) pop();
      push(curr);
    }
  }else{
    let word, string, result;
    switch(curr){
      case '&':
        [word, string, result] = takeWordFofSignAmpersand(str);
        console.log(curr, word)
        if(!result){
          str = word + string;
          return;
        }

        pop();
        runLine(string);
        push(curr);
        str = word + string;
        break;
      case '?':
        [word, string, result] = takeWordFofSignQuestion(str);
        console.log(curr, word)
        
        pop();
        runLine(string);
        push(curr);
        str = word + string;
        break;
      default:
        if(!isTemplate(curr)){
          [word, string, result] = takeSymbol(str);
          console.log(curr, word);

          if(word == curr){
            pop();
            runLine(string);
            push()
          }
          str = word + string;
        }
        break;
    }
    if(isTemplate(curr)){
      
      switch(curr){
        case '*ivname*':
          [word, string, result] = takeSubstring(str);
          console.log(curr, word)
          
          if(!result) return;

          graph.state.variables.add(word);
          pop();
          runLine(string);          
          push(curr);
          graph.state.variables.delete(word);
          break;
        case '*vname*':
          [word, string, result] = takeSubstring(str);
          console.log(curr, word)

          if(!result) return;
          if(!graph.state.variables.has(word)) return;

          pop();
          runLine(string);
          push(curr);
          break;
        case '*number*':
          [word, string, result] = takeNumber(str);
          console.log(curr, word, string)
          if(!result) return;
          pop();
          runLine(string);
          push(curr);
          break;
        case '*ifname*':
          [word, string, result] = takeSubstring(str);
          console.log(curr, word);

          if(!result) return;

          graph.state.functions.add(word);
          pop();
          runLine(string);          
          push(curr);
          graph.state.functions.delete(word);
          break;
        case '*fname*':
          [word, string, result] = takeSubstring(str);
          console.log(curr, word)

          if(!result) return;
          if(!graph.state.functions.has(word)) return;

          pop();
          runLine(string);
          push(curr);
          break;
      }
    }
  }
}

document.getElementById('button_graph').onclick = () => {
  let str = document.querySelector('#graph').value;
  graph = createGraph();
  read(str);
}

document.getElementById('button_string').onclick = () => {
  if(Object.keys(graph).length == 1) return;

  clear();
  push(H0);
  push('*E*');
  

  let str = document.getElementById('string').value;
  try{
    runLine(str);
    throw new Error(`Строка не может быть обработана автоматом`);
  }catch(e){
    console.log(e);
  }
}

