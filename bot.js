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

	//Check to see if the message is in the command list
	if (!client.commands.has(commandName)){
		return
	}

	const command = client.commands.get(commandName)

	//Re-join args to check if -help is there. if it is, message the command's help string and return
	var reargs = args.join(' ')
	if(reargs.startsWith('help') && command.help){
		message.reply(command.helpString)
		return
	}

	//Check to see if the command args require special formatting
	if(command.dbCommand){
		args = formatDBParams(args)
	}

	//Check to see if the command requires permission - if true, then check to see if the user has the correct permission
	if(command.permissionRequired){
		var allowed = false
		for(var i=0;i<command.requiredRoles.length;i++){
			const role = command.requiredRoles[i]
			if(message.member.roles.cache.some(r => r.name === role)){
				allowed = true
				break
			}
		}
		if(!allowed){
			message.reply(` you don't have the required permissions to use ${prefix}${command.name}`)
			return
		}
	}

	//Check to make sure the correct number of args are passed to the command
	if(args.length < command.minArgs || args.length > command.maxArgs){
		message.reply(`**${prefix}${command.name}** does not have the correct number of arguments. **${prefix}${command.name}** expects the following arguments: \n ${command.expectedArgs}`)
		return
	}

	//Run the command
	try {
		command.execute(message, args)
	} catch (error) {
		console.error(error)
		message.reply('there was an error trying to execute that command!')
	}
})

//Formatting function for commands that talk to mongoDB
function formatDBParams(args){
	var join = args.join(' ')
	var parts = join.split('[')
	parts.shift()
	for (i=0; i<parts.length; i++){
		parts[i] = parts[i].trim().replace(']','').trim()
	}
	return parts
}

// Provide token from config.json
client.login(config.token)//BOT_TOKEN is the Client Secret