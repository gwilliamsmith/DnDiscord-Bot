const Discord = require('discord.js');

const client = new Discord.Client();

const config = require("./config.json")

 

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

 

// Provide token from config.json

client.login(config.token);//BOT_TOKEN is the Client Secret