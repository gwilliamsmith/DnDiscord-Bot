const mongo = require('../mongo')
const itemSchema = require('../schemas/itemSchema')

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
    const parts = args
    const {member, channel, content, guild} = message

    await mongo().then(async (mongoose) => {
        var success = false
        try {
            await new itemSchema({
                name: parts[1],
                server_id: guild.id,
                party: true,
                owner: message.author.id,
                description: parts[2]
            }).save()
            success = true
        } catch(e){
            if(e.code = 'E11000'){
                channel.send('<@' + message.author.id + '> An item with that name already exists. You can use !updateItem to change its description, or !viewItem to check its properties.')
            }
        } finally {
            mongoose.connection.close()
            if(success){
                channel.send('<@' + message.author.id + '>, item added!')
            }
        }
    })
}