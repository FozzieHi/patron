import Result from './Result.js';
import CommandError from '../enums/CommandError.js';

class ExceptionResult extends Result {
  static fromError(command, error) {
    return new ExceptionResult({ success: false, command: command, commandError: CommandError.Exception, errorReason: error.message, error: error });
  }
}

export default ExceptionResult;
