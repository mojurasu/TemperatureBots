// Telegram bots to convert temperature
// 2017
// phantom.person.1@gmail.com

const tuc = require('temp-units-conv');
const YAML = require('yamljs');
const format = require('string-format');
const TelegramBot = require('node-telegram-bot-api');

var config = YAML.load('config.yaml');

const NUMBER_REGEXP = /^-?\d*\.?\d*$/
const HELP_TEXT = `
Hello! I am temperature converter bot which works in inline mode.

Just start your message with {} in any chat.

Bot owner: @SitiSchu
Developed by: @SpacePhantom
`;
const ABSOLUTE_ZERO_C = -273.15;
const ABSOLUTE_ZERO_F = -459.67;

// functions
messagesHandler = (bot, bot_name) => {
    return (msg) => {
        const chatId = msg.chat.id;
        const text = msg.text;
        if (text == '/start') {
            bot.sendMessage(chatId, format(HELP_TEXT, bot_name));
        } else {
            bot.sendMessage(chatId, 'Sorry, but I work only in inline mode');
        }
    }
}

inlineHandler = (bot, title, converter, from, from_simple, to, absolute_zero) => {
    return (msg) => {
        var query = msg.query.trim();
        var error = false;

        if (query == '') {
            error = true;
        } else if (query.replace(from_simple, '').match(NUMBER_REGEXP)) {
            if (query >= absolute_zero) {
                var result_text = query + from + ' is ' + converter(query) + to;
            } else {
                error = true;
            }
        } else {
            var result = [];
            var words = query.split(' ');
            var numbersPresent = false;
            for (var i = 0; i < words.length; i++) {
                var word = words[i];
                if (word.replace(from_simple, '').match(NUMBER_REGEXP)) {
                    result.push(converter(word.replace(from_simple, '')) + to);
                    numbersPresent = true;
                } else {
                    result.push(word);
                }
            }
            if(!numbersPresent) {
                error = true;
            }
            var result_text = result.join(' ');
        }
        bot.answerInlineQuery(msg.id, error ? [] : [{
            type: 'article',
            id: from + to + query,
            title: title,
            input_message_content: {
                message_text: result_text
            }
        }]);
    }
}

// bots
const c2fbot = new TelegramBot(config.c2f_token, {polling: true});
const f2cbot = new TelegramBot(config.f2c_token, {polling: true});

// handlers
c2fbot.on('message', messagesHandler(c2fbot, config.c2f_username));
f2cbot.on('message', messagesHandler(f2cbot, config.f2c_username));
c2fbot.on('inline_query', inlineHandler(
    c2fbot,
    'Convert Celsius to Fahreheit',
    tuc.c2f,
    '°C',
    'C',
    '°F',
    ABSOLUTE_ZERO_C
));
f2cbot.on('inline_query', inlineHandler(
    f2cbot,
    'Convert Fahreheit to Celsius',
    tuc.f2c,
    '°F',
    'F',
    '°C',
    ABSOLUTE_ZERO_F
));
