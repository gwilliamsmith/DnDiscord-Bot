const Discord = require('discord.js');

const client = new Discord.Client();

 

client.on('ready', () => {

    console.log('I am ready!');
    console.log('hello world');

});

 

client.on('message', message => {

    if (message.content === 'ping') {

       message.reply('pong');

       }
    if (message.content === "test"){
    	message.reply("tested");
    }

});

 

// THIS  MUST  BE  THIS  WAY

client.login(process.env.BOT_TOKEN);//BOT_TOKEN is the Client Secret