/**
 * Unified Logger
 * 统一的日志工具
 */

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

class Logger {
  constructor(context = 'App') {
    this.context = context;
    this.startTime = Date.now();
  }

  info(message) {
    console.log(`${colors.blue}ℹ${colors.reset} [${this.context}] ${message}`);
  }

  success(message) {
    console.log(`${colors.green}✓${colors.reset} ${message}`);
  }

  warning(message) {
    console.log(`${colors.yellow}⚠${colors.reset} ${message}`);
  }

  error(message, error = null) {
    console.error(`${colors.red}✗${colors.reset} ${message}`);
    if (error && error.stack) {
      console.error(colors.gray + error.stack + colors.reset);
    }
  }

  progress(current, total, item = '') {
    const percentage = Math.round((current / total) * 100);
    const bar = '█'.repeat(Math.floor(percentage / 5)) + '░'.repeat(20 - Math.floor(percentage / 5));
    process.stdout.write(`\r${colors.cyan}[${current}/${total}]${colors.reset} ${bar} ${percentage}% ${item}`);
    if (current === total) {
      console.log(); // New line
    }
  }

  section(title) {
    console.log(`\n${colors.bright}${colors.cyan}${'═'.repeat(40)}${colors.reset}`);
    console.log(`${colors.bright}${colors.cyan}${title}${colors.reset}`);
    console.log(`${colors.cyan}${'═'.repeat(40)}${colors.reset}\n`);
  }

  stats(data) {
    console.log(`\n${colors.bright}📊 Statistics:${colors.reset}`);
    Object.entries(data).forEach(([key, value]) => {
      console.log(`   ${colors.gray}•${colors.reset} ${key}: ${colors.bright}${value}${colors.reset}`);
    });
    console.log();
  }

  elapsed() {
    const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(2);
    console.log(`\n${colors.gray}⏱  Elapsed: ${elapsed}s${colors.reset}`);
  }
}

module.exports = { Logger };
