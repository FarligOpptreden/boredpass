import { CliColors } from './_all';
import moment from 'moment';

class Konsole {
  constructor() {
    this.dateFormat = 'YYYY-MM-DD HH:mm:ss:SSS';
    this.scope = 'handlr';
  }

  configure(args) {
    if (args && args.dateFormat)
      this.dateFormat = args.dateFormat;
    if (args && args.scope)
      this.scope = args.scope;
  }

  empty() {
    console.log('');
  }

  log(message, scope) {
    if (typeof message !== 'string') 
      message = JSON.stringify(message);

    console.log(`${CliColors.Reset}${CliColors.FgGreen}[${scope || this.scope}${CliColors.Reset}${CliColors.FgGreen}] ${CliColors.FgYellow}${moment().format(this.dateFormat)}:${CliColors.Reset} ${message}`);
  }

  error(message, scope) {
    if (typeof message !== 'string') 
      message = JSON.stringify(message);

    console.log(`${CliColors.Error}[${scope || this.scope}] ${moment().format(this.dateFormat)}: ${message}${CliColors.Reset}`);
  }
}

export const konsole = new Konsole();