const Discord = require('discord.js');
const client = new Discord.Client();

//Config file
const config = require('./config.json')
const command = require('./command')
const pm = require('./privateMessage')
const itemHandling = require('./itemHandling.js')

client.on('ready', async () => {
	console.log("online")

	itemHandling(client)
})

// Provide token from config.json
client.login(config.token);//BOT_TOKEN is the Client Secret