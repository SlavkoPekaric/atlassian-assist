const chalk = require('chalk');

module.exports = class Display {
  
  /**
   * @description Display decorated title 
   * @param {string} text
   * @param {number} [sidePadding=3]
   * @returns {void}
   */
  static displayTitle(text, sidePadding = 3) {
    let output = '\n';
  
    // upper row
    for (let i = 0; i < text.length + (sidePadding*2); i++) {
      output += ' ';
    }
    output += '\n';
    
    // text row
    for (let i = 0; i < sidePadding; i++) { output += ' '; }
    output += text;
    for (let i = 0; i < sidePadding; i++) { output += ' '; }
    output += '\n';
    
    // bottom row
    for (let i = 0; i < text.length + (sidePadding*2); i++) {
      output += ' ';
    }
    output += '\n';
  
    return chalk.inverse.bold(output);
  }

}

