const mongo = require('../mongo')
const itemSchema = require('../schemas/itemSchema')
const { prefix } = require('../config.json')

module.exports = {
	name: 'deleteItem',
	description: 'Deletes an item from the server inventory',
	minArgs: 1,
    maxArgs: 1,
    dbCommand: true,
    expectedArgs: ['[<name>]'],
    requiredRole: 'DM',
	execute(message, args) {
		run(message, args)
	},
}

async function run(message, args){
    const {member, channel, content, guild} = message

    await mongo().then(async (mongoose) => {
        var success = false
        try{
            const exists = await itemSchema.exists({name: args[0], server_id: guild.id})
            if (!exists){
                message.reply(` that item does not exist here`)
            } return
            const check = await itemSchema.deleteOne({name: args[0], server_id : guild.id})
            success = true
        } finally { 
            mongoose.connection.close()
            if(success){
                message.reply(`<@${message.author.id}>, item deleted!`)
            }
        }
    })
}