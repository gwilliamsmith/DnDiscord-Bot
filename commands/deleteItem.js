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
        var success
        try{
            const check = await itemSchema.deleteOne({name: args[0], server_id : guild.id})
            success = true
        } finally { 
            mongoose.connection.close()
            if(success){
                channel.send(`<@${message.author.id}>, item deleted!`)
            }
        }
    })
}