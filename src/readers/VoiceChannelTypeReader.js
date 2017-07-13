import TypeReader from '../structures/TypeReader.js';
import TypeReaderResult from '../results/TypeReaderResult.js';
import TypeReaderUtil from '../utility/TypeReaderUtil.js';
import regexes from '../constants/regexes.js';
import config from '../constants/config.json';

class VoiceTypeReader extends TypeReader {
  constructor() {
    super({ type: 'voicechannel' });
  }

  async read(command, message, arg, input) {
    if (regexes.id.test(input)) {
      const channel = message.guild.channels.get(input);

      if (channel !== undefined && channel.type === 'voice') {
        return TypeReaderResult.fromSuccess(channel);
      }
    }

    const lowerInput = input.toLowerCase();

    const matches = message.guild.channels.filterArray((v) => v.name.toLowerCase().includes(lowerInput) && v.type === 'voice');

    if (matches.length > config.maxMatches) {
      return TypeReaderResult.fromError(command, 'Multiple matches found, please be more specific.');
    } else if (matches.length > 1) {
      return TypeReaderResult.fromError(command, 'Multiple matches found: ' + TypeReaderUtil.formatNameables(matches) + '.');
    } else if (matches.length === 1) {
      return TypeReaderResult.fromSuccess(matches[0]);
    }

    return TypeReaderResult.fromError(command, 'Voice channel not found.');
  }
}

export default new VoiceTypeReader();
