const Discord = require('discord.js')
const client = new Discord.Client()

const fs = require('fs')

//Config file
const config = require('./config.json')
const prefix = config.prefix

client.commands = new Discord.Collection()

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))

//Look through command folder for commands
for (const file of commandFiles) {
	const command = require(`./commands/${file}`)
	console.log(`loading ${prefix}${command.name}`)
	client.commands.set(command.name, command)
}

client.on('ready', async () => {
	console.log("online")
	//itemHandling(client)
})


client.on('message', message => {
	if (!message.content.startsWith(prefix) || message.author.bot) return

	var args = message.content.slice(prefix.length).trim().split(/ +/)
	const commandName = args.shift()

	if (!client.commands.has(commandName)){
		return
	}

	const command = client.commands.get(commandName)

	if(command.dbCommand){
		args = formatDBParams(args)
	}

	if(args.length > command.minArgs || args.length < command.maxArgs){
		message.reply(`${prefix}${command.name} does not have the correct number of arguments. ${prefix}${command.name} expects the following arguments: \n ${command.expectedArgs}`)
		return
	}

	try {
		command.execute(message, args)
	} catch (error) {
		console.error(error)
		message.reply('there was an error trying to execute that command!')
	}
})

function formatDBParams(args){
	var join = args.join(' ')
	var parts = join.split('[')
	parts.shift()
	for (i=0; i<parts.length; i++){
		parts[i] = parts[i].trim().replace(']','')
	}
	return parts
}

// Provide token from config.json
client.login(config.token)//BOT_TOKEN is the Client Secret