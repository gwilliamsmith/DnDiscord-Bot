const mongo = require('../mongo')
const itemSchema = require('../schemas/itemSchema')
const { prefix } = require('../config.json')

module.exports = {
	name: 'viewItem',
	description: 'Shows an item in server inventory',
	minArgs: 1,
    maxArgs: 1,
    dbCommand: true,
    expectedArgs: ['[<item name>]'],
	execute(message, args) {
		run(message, args)
    },
    help: true,
	helpString: `**${prefix}viewItem** posts the item's information.
It takes one argument: \n
[<item name>]: The item to view.`
}

async function run(message, args){
    await mongo().then(async (mongoose) => {
        try{
            const check = await itemSchema.exists({name: args[0], server_id: message.guild.id})
            if(!check){
                message.reply(` that item does not exist here.`)
                return
            }
            const data = await itemSchema.find({name: args[0], server_id: message.guild.id})
            message.channel.send('**' + args[0] + '**' + '\n> ' + data[0]['description'])
        } finally {
            mongoose.connection.close()
        }
    })
}