const H0 = '⌧';
const LAMDA = 'λ'; 
const SUCCESS = 'DONE';
const ADD = 'add';
const REMOVE = 'remove';

const stack = () => {
  let arr = [];
  let push = (value) => {
    if(typeof value == 'string' && value.length > 1)
      arr = arr.concat(value.split(''));
    else arr.push(value);
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
  return {push, pop, current, array};
}

let {push, pop, current, array} = stack();
push(H0);

let transitions = stack();
let storeFeed = stack();

let createGraph = () => {
  return {
    [H0]:{
      [LAMDA] : LAMDA,
    },
    state: {
      storeAlphabet: new Set(),
      inputAlphabet: new Set(H0),
    }
  }
}

let graph = createGraph();

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

  let write = (tape, stack, expr) => {
    if(graph[tape] === undefined) graph[tape] = {};
    if(graph[tape][stack] === undefined)
      graph[tape][stack] = expr;
    else if(Array.isArray(graph[tape][stack])) graph[tape][stack].push(expr);
    else graph[tape][stack] = [graph[tape][stack], expr];
  }

  let fill = () => {
    for(let letter of graph.state.inputAlphabet){
      write(letter, letter, LAMDA);
    }
  }

  let rows = str.split('\n');
  for(let row of rows){
    let {symbol, transitions} = parse(row);
    graph.state.storeAlphabet.add(symbol);
    transitions.forEach(string => {
      string.split('').forEach(item => {
        if(/[A-Z]/.test(item)) 
          graph.state.storeAlphabet.add(item);
        else
          graph.state.inputAlphabet.add(item);
      });
      write(symbol, LAMDA, string);
    });
  }
  
  fill();
}

let runLine = (str) => {
  let row = [...str];
  if(row.length == 0) throw new Error(SUCCESS);
  let symbol = row.shift();
  // console.log(symbol)
  if(graph.state.storeAlphabet.has(symbol)){
    let obj = graph[symbol][LAMDA];
    console.log(symbol, obj)
    
    if(typeof obj === 'object'){
      for(let state of obj){
        console.log('state: ', state)
        push(state);
        transitions.push({
          symbol,
          transition: state,
          action: ADD,
        });
        storeFeed.push([...array()]);
        runLine(row);
        for(let key in state) pop();
        transitions.pop();
        storeFeed.pop()
      }
    }else{
      console.log('state: ', state)
      transitions.push({
        symbol,
        transition: obj,
        action: ADD,
      });
      push(obj);
      storeFeed.push([...array()]);
      runLine(row);
      for(let key in state) pop();
      transitions.pop();
      storeFeed.pop();
    }
  }else if(graph.state.inputAlphabet.has(symbol)){
    let curr = current();
    console.log(symbol, curr)
    if(curr == symbol){
      transitions.push({
        symbol,
        transition: curr,
        action: REMOVE,
      });
      pop();
      storeFeed.push([...array()]);
      runLine(row);
      push(curr);
      transitions.pop();
      storeFeed.pop();
    }else if(curr == H0){
      throw new Error(`Стек пуст, однако требуестя символ:${symbol}`);
    }else{
      row.unshift(symbol);
      return;
    }
  }else throw new Error(`Символ не содержится в алфавите: ${symbol}`);
}

let showInfo = (error) => {
  let out = 'Множество входных символов P:\n';
  out += [...graph.state.inputAlphabet] + '\n';
  out += 'Множество символов магазина Z:\n';
  out += '' + [...graph.state.storeAlphabet] + ',' + [...graph.state.inputAlphabet]  + '\n\n';

  out += (error.message == SUCCESS) ? 
    'Цепочка символов допустима!\n' :
    'Цепочка символов недопустима!\n';

  out += 'Список команд:\n';
  for(let transition of transitions.array()){
    out += `Символ ленты: ${transition.symbol}`;
    out += (transition.action == ADD) ? 
      ` В стек добавлен: ${transition.transition}\n` :
      ` Из стека удален: ${transition.transition}\n`
  }

  out += '\nСписок состояний стека:\n';
  for(let row of storeFeed.array()){
    out += row.join(',') + '\n';
  }

  alert(out);
}

document.getElementById('button_graph').onclick = () => {
  let str = document.querySelector('#graph').value;
  graph = createGraph();
  read(str);
}

document.getElementById('button_string').onclick = () => {
  if(Object.keys(graph).length == 2) return;

  transitions = stack();
  storeFeed = stack();
  let str = document.getElementById('string').value.split('');
  try{
    runLine(str);
    throw new Error(`Строка не может быть обработана автоматом`);
  }catch(e){
    console.log(e.message);
    showInfo(e);
  }
}
// Пример
// E>mT|!|T|b
// T>P
// P>R|S
// R>C-C
// C>a|b|c|0|>
// S>C|CS

// C0SEC0!ECab
