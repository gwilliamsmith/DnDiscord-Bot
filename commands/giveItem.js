const mongo = require('../mongo')
const itemSchema = require('../schemas/itemSchema')
const inventorySchema = require('../schemas/inventorySchema')
const { prefix } = require('../config.json')

module.exports = {
	name: 'giveItem',
	description: 'Adds an item to a player or party inventory',
	minArgs: 2,
    maxArgs: 3,
    dbCommand: true,
    expectedArgs: ['[<name>]', '[<recipient>]', '[<quantity>](optional)'],
    permissionRequired: true,
    requiredRoles: ['DM'],
	execute(message, args) {
		run(message, args)
	},
}

async function run(message, args){
    await mongo().then(async (mongoose) => {
        try{
            var change = 1
            var target = args[1]
            //First check to see if the item exists for the server
            const check = await itemSchema.exists({name: args[0], server_id: message.guild.id})
            if(!check){
                message.reply(` that item does not exist here.`)
                return
            }

            //Check to see if a quantity was given to the command
            if (args.length === 3){
                if (isNaN(parseInt(args[2]))){
                    message.reply(` you must enter a number for quantity`)
                    return
                }
                change = parseInt(args[2])
            }
            //If a user is mentioned, grab their id to use as the owner field
            if(message.mentions.members.first()){
                target = message.mentions.members.first().id
            }
            console.log(target + ' ' + change)
            await inventorySchema.findOneAndUpdate({
                itemName : args[0],
                server_id : message.guild.id,
                owner : target
            },{
                $inc : {quantity : +change}
            },{
                upsert : true
            })
        } finally {
            mongoose.connection.close()
        }
    })
}