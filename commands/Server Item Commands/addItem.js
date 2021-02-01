const mongo = require('../../mongo')
const itemSchema = require('../../schemas/itemSchema')
const { prefix } = require('../../config.json')

module.exports = {
	name: 'addItem',
    description: 'Adds an item to the server inventory.',
	minArgs: 2,
    maxArgs: 2,
    dbCommand: true,
    expectedArgs: ['[<item name>]', '[<description>]'],
    permissionRequired: true,
    requiredRoles: ['DM'],
	execute(message, args) {
		run(message, args)
    },
    help: true,
    helpString: `**${prefix}addItem** adds an item to the server's inventory.
It takes two arguments: \n 
[<item name>]: This is the name of the item to be added to the server's inventory.
[<description>]: This is the description of the item.`
}

async function run(message, args){
    await mongo().then(async (mongoose) => {
        var success = false
        try {
            await new itemSchema({
                name: args[0],
                server_id: message.guild.id,
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