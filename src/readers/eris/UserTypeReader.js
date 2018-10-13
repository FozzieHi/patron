const TypeReader = require('../../structures/TypeReader.js');
const TypeReaderCategory = require('../../enums/TypeReaderCategory.js');
const TypeReaderResult = require('../../results/TypeReaderResult.js');
const TypeReaderUtil = require('../../utility/TypeReaderUtil.js');
const Constants = require('../../utility/Constants.js');
const warningEmitted = [false, false];

class UserTypeReader extends TypeReader {
  constructor() {
    super({ type: 'user' });

    this.category = TypeReaderCategory.Library;
  }

  async read(command, message, argument, args, input) {
    if (message._client.options.getAllUsers === false && warningEmitted[0] === false) {
      process.emitWarning('The user type reader is unreliable when getAllUsers is set to false.');
      warningEmitted[0] = true;
    }

    if (warningEmitted[1] === false && (message._client.options.firstShardID !== 0 || message._client.options.lastShardID !== message._client.options.maxShards - 1)) {
      process.emitWarning('The user type reader is unreliable when shards are split between multiple clients.');
      warningEmitted[1] = true;
    }

    if (Constants.regexes.userMention.test(input) || Constants.regexes.id.test(input)) {
      let user;

      if (message._client.options.restMode) {
        try {
          user = await message._client.getRESTUser(input.match(Constants.regexes.findId)[0]);
        } catch (err) {
        }
      } else {
        user = message._client.users.get(input.match(Constants.regexes.findId)[0]);
      }

      if (user != null) {
        return TypeReaderResult.fromSuccess(user);
      }

      return TypeReaderResult.fromError(command, Constants.errors.userNotFound);
    }

    const lowerInput = input.toLowerCase();

    if (Constants.regexes.usernameAndDiscrim.test(input)) {
      const user = message._client.users.find((v) => v.tag.toLowerCase() === lowerInput);

      if (user != null) {
        return TypeReaderResult.fromSuccess(user);
      }

      return TypeReaderResult.fromError(command, Constants.errors.userNotFound);
    }

    let matches = [];

    if (message.channel.guild != null) {
      const memberMatches = message.channel.guild.members.filter((v) => v.nickname != null && v.nickname.toLowerCase().includes(lowerInput));

      for (let i = 0; i < memberMatches.length; i++) {
        matches.push(memberMatches[i].user);
      }
    }

    matches = matches.concat(message._client.users.filter((v) => v.username.toLowerCase().includes(lowerInput)));

    return TypeReaderUtil.handleMatches(command, matches, 'userNotFound', 'tag');
  }
}

module.exports = new UserTypeReader();
