let textarea = document.querySelector('#graph');
let placeholder = document.querySelector('#placeholder');
let canvas = document.querySelector('canvas');
let button = document.querySelector('#generate');

let graph = {
  options: {
    isDeterministic: true,
    mustBeDeterministic: {},
  },
};
let alpabet = new Set();

let read = (graph, alpabet, string) => {
  
  let rows = string.split('\n');
  for(let row of rows){
    let start = row.indexOf(',');
    let end = row.lastIndexOf('=');
    let q1 = row.slice(0, start);
    let c = row.slice(start + 1, end);
    let q2 = row.slice(end + 1);

    alpabet.add(c);

    if(graph[q1] === undefined) graph[q1] = {};
    if(graph[q2] === undefined) graph[q2] = {};
    if(graph[q1][c] === undefined) graph[q1][c] = q2;
    else{
      if(Array.isArray(graph[q1][c])) graph[q1][c].push(q2);
      else graph[q1][c] = [graph[q1][c], q2];
      graph.options.isDeterministic = false;
      graph.options.mustBeDeterministic[q1] = c;
    }
  }
}

let determine = (graph, alpabet) => {
  let join = (arr) => arr.join('');

  if(graph.isDeterministic) return true;
  for(let key in graph.options.mustBeDeterministic){
    let transition = graph.options.mustBeDeterministic[key];
    let state = graph[key][transition];
    for(let q of state){
      for(let letter of alpabet){
        if(graph[join(state)] === undefined) graph[join(state)] = {};

        if(graph[q][letter] !== undefined)
          graph[join(state)][letter] = graph[q][letter];
      }
    }
    graph[key][transition] = join(state);
  }
}

let generateGraphDescription = (graph) => {
  let out = '';
  for(let key in graph){
    if(key === 'options') continue;
    for(let letter in graph[key]){
      out += `${key},${letter}=${graph[key][letter]}\n`;
    }
  }
  return out;
}

let showInfo = (graph) => {
  let out = '';
  out += graph.options.isDeterministic ? 'Граф детерминирован\n' : 'Граф недетерминирован\n';
  out += 'Алфавит:\n';
  for(let letter of alpabet) out += `\'${letter}\' `;
  out += '\n'
  out += 'Состояния:\n';
  for(let key in graph){
    if(key !== 'options') out += `\'${key}\' `;
  }
  alert(out);
}

button.onclick = function(event){
  graph = {
    options: {
      isDeterministic: true,
      mustBeDeterministic: {},
    },
  };
  placeholder.value = '';

  read(graph, alpabet, textarea.value);

  if(!graph.options.isDeterministic){
    determine(graph, alpabet);
    let string = generateGraphDescription(graph);
    placeholder.value = string;
  }

  showInfo(graph)
}
// q0,1=q2
// q0,1=q3
// q0,2=q4
// q2,1=q5
// q3,2=q5
// q4,1=q3
// q4,2=q2
// q4,2=q5