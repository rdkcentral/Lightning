const shell = require('shelljs');
const ts = require('typescript');
const path = require('path');

// Make sure shelljs will exit with nonzero exit code if anything fails
shell.config.fatal = true;

// Make sure working directory is the root of the repository
shell.cd(path.join(__dirname, '..'));

// 1. Copy all the JavaScript source code (.js / .mjs) and
//    all the manually written type definition files (.d.ts / .d.mts)
console.log("Copying all JavaScript source code to ./dist...");
shell.find('./src/')
  .filter(file => {
    const ext = path.extname(file);
    return ['.js', '.mjs', '.d.mts', '.d.ts'].includes(ext) && !file.includes('.test.');
  })
  .forEach(file => {
    const distFile = path.join('./dist', file);
    shell.mkdir('-p', path.dirname(distFile));
    shell.cp(file, distFile);
  });

// 2. Compile all TypeScript source code (.ts / .mts) in the project
console.log("Compiling all TypeScript source code to ./dist...");

// Read the TypeScript configuration file
const configPath = path.join(process.cwd(), 'tsconfig.build.json');
const config = ts.readConfigFile(configPath, ts.sys.readFile).config;

// Parse the configuration file
const parsed = ts.parseJsonConfigFileContent(config, ts.sys, path.dirname(configPath));

// Create a program based on the configuration
const program = ts.createProgram(parsed.fileNames, parsed.options);

// Compile the program
const emitResult = program.emit();

// Get all diagnostics
const allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);

// Print all diagnostics
allDiagnostics.forEach(diagnostic => {
  if (diagnostic.file) {
    const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
    const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
    console.log(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
  } else {
    console.log(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
  }
});

// If there were errors, exit with a non-zero exit code
if (emitResult.emitSkipped) {
  process.exit(1);
}

console.log("Done!");