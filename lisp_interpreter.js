var Symbol = String;
function Env(dat){
  var env = {}, outer = dat.outer || {};
  function find(variable){
    if(env.hasOwnProperty(variable))
      return env;
    else
      return outer.find(variable);
  }

  if(0 !== dat.pars.length){
    for(var i = 0; i < dat.pars.length; i += 1){
      env[dat.pars[i]] = dat.args[i];
    }
  }
  env.find = find;
  return env;
}

function addGlobal(env){
  var functions = ['abs', 'acos', 'asin', 'atan', 'atan2', 'ceil', 'cos', 'exp', 'floor', 'log', 'max', 'min', 'pow', 'random', 'round', 'sin', 'sqrt', 'tan'];
  for (var i = 0; i < functions.length; i += 1) {
        env[functions[i]] = Math[functions[i]];
  }
  env['+'] = function(x,y) {return x + y;}
  env['-'] = function (x, y) {return x - y;}
  env['*'] = function (x, y) {return x * y;}
  env['/'] = function (x, y) {return x / y;}
  env['>'] = function (x, y) {return x > y;}
  env['<'] = function (x, y) {return x < y;}
  env['>='] = function (x, y) {return x >= y;}
  env['<='] = function (x, y) {return x <= y;}
  env['=='] = function (x, y) {return x == y;}
  env['equal?'] = function (x, y) {return x == y;}
  env['eq?'] = function (x, y) {return x == y;}
  env['not'] = function (x) {return !x;}
  env['length'] = function (x) { return x.length; }
  env['cons'] = function (x, y) {return [x].concat(y); }
  env['car'] = function (x) { return x[0]}
  env['cdr'] = function (x) { return x.slice(1)}
  env['append'] = function (x, y) { return x.concat(y); }
  env['list'] = function () { return Array.prototype.slice.call(args); };
  env['list?'] = function (x) { return (x instanceof Array);}
  env['null?'] = function (x) { return (!x || x.length == 0); }
  env['symbol?'] = function (x) { return (x instanceof String); }
  return env;
}
var globalEnv = addGlobal(Env({pars: [], args: []}));

function eval(x,env){
  env = env || globalEnv;
  if (typeof x == 'string')
    return env.find(x)[x];
  else if (typeof x == 'number')
    return x;
  else if (x[0] == 'quote')
    return x[1];
  else if (x[0] == 'if') {
    var test = x[1];
    var conseq = x[2];
    var alt = x[3];
    if (eval(test, env))
      return eval(conseq, env);
    else
      return eval(alt, env);
  }
  else if (x[0] === 'set!')
    env.find(x[1])[x[1]] = eval(x[2], env);
  else if (x[0] === 'define')
    env[x[1]] = eval(x[2], env);
  else if (x[0] === 'lambda') {
    var vars = x[1];
    var exp = x[2];
    return function () {
      return eval(exp, Env({pars: vars, args: arguments, outer: env }));
    };
  }
  else if (x[0] === 'begin') {
    var val;
    for (var i = 1; i < x.length; i += 1)
      val = eval(x[i], env);
    return val;
  }
  else {
    var exps = [];
    for (i = 0; i < x.length; i += 1)
      exps[i] = eval(x[i], env);
    var proc = exps.shift();
    return proc.apply(env, exps);
  }
}

function parser(s){
  return readFrom(tokenize(s));
}
function tokenize(s){
    return s.replace(/\(/g,' ( ').replace(/\)/g,' ) ').trim().replace(/\s+/g,' ').split(' ')
}

function readFrom(tokens){
  if(tokens.length == 0)
    console.log("Unexpected EOF while reading");
  var token = tokens.shift();
  if('(' == token){
    var L = [];
    while(tokens[0] != ')'){
      L.push(readFrom(tokens));
    }
    tokens.shift();
    return L;
  } 
  else if(')' == token)
    console.log("unexpected");
  else
    return atom(token);
}

function atom(token){
  if (Number(token)){
    return +token;
  }
  else{
    return token;
  }
}

function repl(){
  var stdin = process.stdin
  var stdout = process.stdout;
  stdin.resume();
  stdout.write("lisp>> ");
  stdin.on('data',function(data){
  data = (data + "").trim();
  var result = eval(parser(data));
  if (result != undefined)
    stdout.write(result+'\nlisp>> ');
  else
    stdout.write('lisp>> ');});
}
repl();

