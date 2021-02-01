const mongo = require('../../mongo')
const itemSchema = require('../../schemas/itemSchema')
const { prefix } = require('../../config.json')

module.exports = {
	name: 'updateItem',
	description: 'Updates an item\'s description in the server item list. Only DMs can use this.',
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
    helpString: `**${prefix}updateItem** updates an item in the server's item list.
It takes two arguments: \n
[<item name>]: The name of the item to update.
[<description>]: The new description for the item.`
}

async function run(message, args){
    await mongo().then(async (mongoose) => {
        var success = false
        try{
            const check = await itemSchema.exists({name: args[0], server_id: message.guild.id})
            if(check){
                await itemSchema.findOneAndUpdate({
                    name: args[0],
                    server_id: message.guild.id
                },{
                    $set : {description: args[1]}
                },{
                    useFindAndModify : false
                })
                success = true
            }
            else {
                message.reply(` that item does not exist. You can use ${prefix}addItem to create a new item.`)
            }
        } finally {
            mongoose.connection.close()
            if(success){
                message.reply(' item updated!')
            }
        }
    })
}