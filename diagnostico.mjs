/**
 * Diagnóstico do ambiente.
 * Rode com:  node diagnostico.mjs
 * Não instala nem altera nada — só verifica e explica.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { createServer } from 'node:net';

const ok = (m) => console.log('  [ OK ]   ' + m);
const bad = (m) => console.log('  [ERRO]   ' + m);
const warn = (m) => console.log('  [AVISO]  ' + m);
const info = (m) => console.log('           ' + m);

const problemas = [];

console.log('\n============================================');
console.log('  DIAGNOSTICO - Site Thiago Bostock');
console.log('============================================\n');

// 1. Sistema
console.log('1. SISTEMA');
console.log('   Plataforma: ' + process.platform + ' (' + process.arch + ')');
console.log('   Pasta atual: ' + process.cwd());
console.log('');

// 2. Node
console.log('2. NODE.JS');
const major = Number(process.versions.node.split('.')[0]);
if (major >= 18) {
  ok('Node ' + process.versions.node);
} else {
  bad('Node ' + process.versions.node + ' e MUITO ANTIGO');
  info('O Next.js 14 exige Node 18 ou superior.');
  info('Baixe a versao LTS em https://nodejs.org');
  problemas.push('Node antigo (' + process.versions.node + '). Instale a versao LTS.');
}

// 3. npm
console.log('\n3. NPM');
try {
  const v = execSync('npm --version', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  ok('npm ' + v);
} catch {
  bad('npm nao encontrado no PATH');
  problemas.push('npm nao encontrado. Reinstale o Node.js pelo instalador oficial.');
}

// 4. Pasta correta
console.log('\n4. PASTA DO PROJETO');
if (existsSync('package.json')) {
  ok('package.json encontrado');
  try {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
    if (pkg.name === 'thiago-bostock-imoveis') {
      ok('E o projeto certo: ' + pkg.name);
    } else {
      warn('package.json de outro projeto: ' + pkg.name);
    }
  } catch {
    bad('package.json existe mas esta corrompido');
    problemas.push('package.json invalido. Descompacte o zip de novo.');
  }
} else {
  bad('package.json NAO encontrado nesta pasta');
  info('Voce esta na pasta errada. Conteudo daqui:');
  try {
    readdirSync('.').slice(0, 12).forEach((f) => info('   - ' + f));
  } catch {}
  info('Use "cd" para entrar na pasta que contem o package.json.');
  problemas.push('Pasta errada: nao ha package.json aqui.');
}

// 5. Arquivos essenciais
console.log('\n5. ARQUIVOS DO PROJETO');
const essenciais = [
  'app/layout.tsx',
  'app/page.tsx',
  'app/theme.css',
  'lib/site.ts',
  'lib/imoveis.ts',
  'data/imoveis.json',
];
let faltando = 0;
for (const f of essenciais) {
  if (existsSync(f)) {
    ok(f);
  } else {
    bad(f + ' faltando');
    faltando++;
  }
}
if (faltando > 0) {
  problemas.push(faltando + ' arquivo(s) essencial(is) faltando. Descompacte o zip novamente.');
}

// 6. JSON dos imoveis
console.log('\n6. DADOS DOS IMOVEIS');
if (existsSync('data/imoveis.json')) {
  try {
    const arr = JSON.parse(readFileSync('data/imoveis.json', 'utf8'));
    ok(arr.length + ' imovel(is) no JSON, sintaxe valida');
    const semSlug = arr.filter((i) => !i.slug);
    if (semSlug.length) {
      bad(semSlug.length + ' imovel(is) sem "slug"');
      problemas.push('Imovel sem slug em data/imoveis.json');
    }
    const slugs = arr.map((i) => i.slug);
    const dup = slugs.filter((s, i) => slugs.indexOf(s) !== i);
    if (dup.length) {
      bad('Slugs repetidos: ' + [...new Set(dup)].join(', '));
      problemas.push('Slugs duplicados em data/imoveis.json');
    }
  } catch (e) {
    bad('JSON INVALIDO: ' + e.message);
    info('Normalmente e virgula a mais ou a menos. Cole o arquivo em');
    info('https://jsonlint.com para achar a linha exata.');
    problemas.push('data/imoveis.json com erro de sintaxe.');
  }
}

// 7. Dependencias
console.log('\n7. DEPENDENCIAS');
if (existsSync('node_modules')) {
  ok('node_modules existe');
  const precisa = ['next', 'react', 'react-dom'];
  let ausentes = 0;
  for (const p of precisa) {
    if (existsSync('node_modules/' + p)) {
      ok('  ' + p);
    } else {
      bad('  ' + p + ' faltando');
      ausentes++;
    }
  }
  if (ausentes) {
    problemas.push('Dependencias incompletas. Apague node_modules e rode "npm install".');
  }
} else {
  bad('node_modules NAO existe');
  info('Rode:  npm install');
  problemas.push('Dependencias nao instaladas. Rode "npm install".');
}

// 8. Porta 3000
console.log('\n8. PORTA 3000');
await new Promise((resolve) => {
  const s = createServer();
  s.once('error', (e) => {
    if (e.code === 'EADDRINUSE') {
      bad('Porta 3000 JA ESTA EM USO');
      info('Outro programa ocupa a porta (talvez um "npm run dev" antigo).');
      info('Solucao rapida:  npm run dev -- -p 3001');
      info('Depois acesse http://localhost:3001');
      problemas.push('Porta 3000 ocupada. Use outra porta com: npm run dev -- -p 3001');
    } else {
      warn('Nao foi possivel testar a porta: ' + e.code);
    }
    resolve();
  });
  s.once('listening', () => {
    ok('Porta 3000 livre');
    s.close(resolve);
  });
  s.listen(3000, '127.0.0.1');
});

// 9. Caminho problematico (Windows)
console.log('\n9. CAMINHO DA PASTA');
const cwd = process.cwd();
if (/[^\x20-\x7E]/.test(cwd)) {
  warn('O caminho tem acentos ou caracteres especiais:');
  info(cwd);
  info('Isso as vezes quebra o Node no Windows.');
  info('Se der erro estranho, mova o projeto para C:\\projetos\\site');
} else {
  ok('Caminho sem acentos');
}
if (process.platform === 'win32' && /OneDrive/i.test(cwd)) {
  warn('O projeto esta dentro do OneDrive');
  info('A sincronizacao pode travar arquivos e causar erro no npm install.');
  info('Recomendo mover para C:\\projetos\\site');
}

// Resumo
console.log('\n============================================');
if (problemas.length === 0) {
  console.log('  TUDO CERTO!');
  console.log('============================================');
  console.log('\n  Rode agora:   npm run dev');
  console.log('  Depois abra:  http://localhost:3000\n');
} else {
  console.log('  ' + problemas.length + ' PROBLEMA(S) ENCONTRADO(S)');
  console.log('============================================\n');
  problemas.forEach((p, i) => console.log('  ' + (i + 1) + '. ' + p));
  console.log('\n  Resolva na ordem acima e rode de novo:');
  console.log('  node diagnostico.mjs\n');
}
