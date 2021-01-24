const mongo = require('../mongo')
const itemSchema = require('../schemas/itemSchema')

module.exports = {
	name: 'updateItem',
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

    const parts = args
    const {member, channel, content, guild} = message

    await mongo().then(async (mongoose) => {
        var success = false
        try{
            const check = await itemSchema.exists({name: parts[1], server_id: guild.id})
            if(check){
                await itemSchema.findOneAndUpdate({
                    name: parts[1],
                    server_id: guild.id
                },{
                    $set : {description: parts[2]}
                })
                success = true
            }
            else {
                channel.send('<@' + message.author.id + '>, that item does not exist. You can use !addItem to create a new item.')
            }
        } finally {
            mongoose.connection.close()
            if(success){
                channel.send('<@' + message.author.id + '>, item updated!')
            }
        }
    })
}