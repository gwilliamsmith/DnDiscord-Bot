const mongo = require('../mongo')
const itemSchema = require('../schemas/itemSchema')
const { prefix } = require('../config.json')

module.exports = {
	name: 'updateItem',
	description: 'Updates an item to in server inventory',
	minArgs: 2,
    maxArgs: 2,
    dbCommand: true,
    expectedArgs: ['[<name>]', '[<description>]'],
    permissionRequired: true,
    requiredRoles: ['DM'],
	execute(message, args) {
		run(message, args)
	},
}

async function run(message, args){
    const {member, channel, content, guild} = message

    await mongo().then(async (mongoose) => {
        var success = false
        try{
            const check = await itemSchema.exists({name: args[0], server_id: guild.id})
            if(check){
                await itemSchema.findOneAndUpdate({
                    name: args[0],
                    server_id: guild.id
                },{
                    $set : {description: args[1]}
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