const mongo = require('../mongo')
const itemSchema = require('../schemas/itemSchema')
const { prefix } = require('../config.json')

module.exports = {
	name: 'viewItem',
	description: 'Shows an item in server inventory',
	minArgs: 1,
    maxArgs: 1,
    dbCommand: true,
    expectedArgs: ['[<name>]'],
	execute(message, args) {
		run(message, args)
	},
}

async function run(message, args){
    const {member, channel, content, guild} = message

    await mongo().then(async (mongoose) => {
        try{
            const check = await itemSchema.exists({name: args[0], server_id: guild.id})
            if(!check){
                channel.send(`<@${message.author.id}>, that item does not exist here.`)
            }
            else {
                const data = await itemSchema.find({name: args[0], server_id: guild.id})
                channel.send('**' + args[0] + '**' + '\n> ' + data[0]['description'])
            }
        } finally {
            mongoose.connection.close()
        }
    })
}