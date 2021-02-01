const mongo = require('../../mongo')
const itemSchema = require('../../schemas/itemSchema')
const { prefix } = require('../../config.json')

module.exports = {
	name: 'deleteItem',
	description: 'Deletes an item from the server item list. Only DMs can use this.',
	minArgs: 1,
    maxArgs: 1,
    dbCommand: true,
    expectedArgs: ['[<name>]'],
    permissionRequired: true,
    requiredRoles: ['DM'],
	execute(message, args) {
		run(message, args)
    },
    help: true,
    helpString: `**${prefix}deleteItem** deletes an item from the server's item list. This command is limited to those with the 'DM' role.
It takes one argument: \n
[<item name>]: This is the name of the item to delete.`
}

async function run(message, args){
    const {member, channel, content, guild} = message

    await mongo().then(async (mongoose) => {
        var success = false
        try{
            const exists = await itemSchema.exists({name: args[0], server_id: message.guild.id})
            if (!exists){
                message.reply(` that item does not exist here`)
                return
            }
            const check = await itemSchema.deleteOne({name: args[0], server_id : message.guild.id})
            success = true
        } finally { 
            mongoose.connection.close()
            if(success){
                message.reply(` ${args[0]} deleted from server item list!`)
            }
        }
    })
}