import { Config, run } from '../runner';
import { expect } from 'chai';
import { emptyEnv } from '../compiler';
import 'mocha';

const importObject = {
  imports: {
    // we typically define print to mean logging to the console. To make testing
    // the compiler easier, we define print so it logs to a string object.
    //  We can then examine output to see what would have been printed in the
    //  console.
    print: (arg : any) => {
      importObject.output += arg;
      importObject.output += "\n";
      return arg;
    },
    abs: Math.abs,
    min: Math.min,
    max: Math.max,
    pow: Math.pow
  },

  output: ""
};

// Clear the output before every test
beforeEach(function () {
  importObject.output = "";
});
  
// We write end-to-end tests here to make sure the compiler works as expected.
// You should write enough end-to-end tests until you are confident the compiler
// runs as expected. 
describe('run', () => {
  const config : Config = { importObject, env: emptyEnv };

  function assert(name: string, source: string, result: number) {
    it(name, async() => {
      const [result, env] = await run(source, config);
      expect(result).to.equal(result);
    })  
  }

  function assertError(name: string, source: string) {
    it(name, async() => {
      try{
        const [result, env] = await run(source, config);
      } catch (err) {
        expect(err).to.be.an('Error');
      }
    })  
  }

  assert('add', "2 + 3", 2 + 3);

  assert('add3', "2 + 3 + 4", 2 + 3 + 4);

  assert('addoverflow', "4294967295 + 1",0);

  assert('sub', "1 - 2", 1 - 2);

  assert('subunderflow', "0 - 4294967295 - 1", 0);

  assert('mul', "2 * 3 * 4", 2 * 3 * 4);

  assert('multhenplus', "2 + 3 * 4", 2 + 3 * 4);

  assert('abs', "abs(0 - 5)", Math.abs(0 - 5));

  assert('min', 'min(2, 3)', Math.min(2,3));

  assert('max', 'max(2, 3)', Math.max(2,3));

  assert('pow', 'pow(2, 3)', Math.pow(2,3));

  assert('pownegative', 'pow(2, 0 - 1)', 0);

  assert('simpledef', 'def f(x): return x + 1\nf(5)', 6);

  assert('multi-arg', 'def f(x, y, z): return x - y - z\nf(9, 3, 1)', 5);

  assert('multi-arg-again', 'def f(x, y, z): return x * y - z\nf(9, 3, 1)', 26);

  assert('multi-arg-update', `
def f(x, y, z):
  x = y * x
  return x - z
f(9, 3, 1)`, 26);

  assert('multi-arg-local-var', `
def f(x, y, z):
  m = y * x
  return m - z
f(9, 3, 1)`, 26);

  assertError('localnotglobal', `
def f():
  return 0
  
f()`);

});