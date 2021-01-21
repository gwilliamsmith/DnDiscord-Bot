const Discord = require('discord.js');
const client = new Discord.Client();

//Config file
const config = require("./config.json")

const mongo = require('./mongo')

client.on('ready', async () => {
	console.log("online")

	await mongo().then(mongoose => {
		try{
			console.log("trying...")
		} finally {
			mongoose.connection.close()
			console.log("end")
		}
	})

})

// Provide token from config.json

client.login(config.token);//BOT_TOKEN is the Client Secret