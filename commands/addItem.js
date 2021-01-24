const mongo = require('../mongo')
const itemSchema = require('../schemas/itemSchema')
const { prefix } = require('../config.json')

module.exports = {
	name: 'addItem',
	description: 'Adds an item to the server inventory',
	minArgs: 2,
    maxArgs: 2,
    dbCommand: true,
    expectedArgs: ['[<name>]', '[<description>]'],
    requiredRole: 'DM',
	execute(message, args) {
		run(message, args)
	},
}

async function run(message, args){
    const {member, channel, content, guild} = message

    await mongo().then(async (mongoose) => {
        var success = false
        try {
            await new itemSchema({
                name: args[0],
                server_id: guild.id,
                party: true,
                owner: message.author.id,
                description: args[1]
            }).save()
            success = true
        } catch(e){
            if(e.code = 'E11000'){
                message.reply(` an item with that name already exists. You can use ${prefix}updateItem to change its description, or ${prefix}viewItem to check its properties.`)
            }
        } finally {
            mongoose.connection.close()
            if(success){
                message.reply(` item added!`)
            }
        }
    })
}