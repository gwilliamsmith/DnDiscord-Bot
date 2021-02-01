const mongo = require('../mongo')
const { prefix } = require('../config.json')
const { MessageAttachment } = require('discord.js')
const { description } = require('./User Item Commands/checkInventory')


module.exports = {
	name: 'commands',
	description: 'Shows a list of bot commands.',
	minArgs: 0,
    maxArgs: 0,
	execute(message, client) {
		run(message, client)
    },
}

function run(message, commands){
    var out = ``
    commands.forEach( command => {out += `\`${prefix}${command.name}:\` ${command.description}\n`})
    message.channel.send(out, {split : true})
}