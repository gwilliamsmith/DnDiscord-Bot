const mongo = require('../../mongo')
const itemSchema = require('../../schemas/itemSchema')
const inventorySchema = require('../../schemas/inventorySchema')
const { prefix } = require('../../config.json')
const { Mongoose } = require('mongoose')

module.exports = {
	name: 'takeItem',
	description: 'Takes an item from a player or party inventory, and removes the entry if they no longer have any. DMs can take items from anyone.',
	minArgs: 1,
    maxArgs: 3,
    dbCommand: true,
    expectedArgs: ['[<item name>]', '(optional) [ <target> OR <quantity> ]', '(optional) [<quantity>]'],
	execute(message, args) {
		run(message, args)
    },
    help: true,
    helpString: `**${prefix}takeItem** takes an item from a player's or party's inventory. It removes the item if they no longer have any. DMs can take items from any player
It takes a minimum of one and a maximum of three arguments: \n
[<item name>]: The name of the item to take.
(optional) [ <target> OR <quantity> ]: target can be the party's name, or DMs can tag other players. This can also be the quantity of an item to take from yourself. Defaults to 1.
(optional) [<quantity>]: An optional amount of the object to take. Defaults to 1.`
}

async function run(message, args){
    await mongo().then(async (mongoose) => {
        try{
            var change = 1
            var target = message.author.id
            var name = message.author.username
            //First check to see if the item exists for the server
            const check = await itemSchema.exists({name: args[0], server_id: message.guild.id})
            if(!check){
                message.reply(` that item does not exist here.`)
                return
            }


            //Check to see if two or more args have been passed - if yes that means a user or party has been specified at args[1]
            if(args.length >= 2){
                //If a user is mentioned, check to see if the author is a DM. If yes, set target to the tagged user. If not, complain
                if(message.mentions.members.first()){
                    if(message.member.roles.cache.find(r => r.name === 'DM')){
                        target = message.mentions.members.first().id
                        name = message.mentions.members.first().user.username
                    } else {
                        message.reply(` you must have the DM role to take from other player inventories`)
                        return
                    }
                }
                //If a user isn't mentioned, and the author is trying to affect an inventory, it'll be the party inventory.
                // This can get unset later if there are only 2 args - that means they're passing a quantity and want to affect their own inventory 
                else{
                    target = 'party'
                    name = 'party'
                }
            }   

            //Now check to see if the player or party has the item. If not, complain and exit out
            const checkTarget = await inventorySchema.exists({itemName : args[0], server_id: message.guild.id})
            if(!checkTarget){
                message.reply(` ${target} does not have any ${args[0]}`)
                return
            }

            //If only two args were given, check to see if args[1] is a number
            //  If it's a number, This also sets target and name back to the author's information - they're affecting their own inventory
            if(args.length === 2){
                if(!isNaN(parseInt(args[1]))){
                    change = parseInt(args[1])
                    console.log('change: ' + change)
                    target = message.author.id
                    name = message.author.username
                }
            }

            //Check to see if a quantity was given to the command
            if (args.length === 3){
                if (isNaN(parseInt(args[2]))){
                    message.reply(` you must enter a number for quantity`)
                    return
                }
                change = parseInt(args[2])
            }
            const query = { itemName : args[0], server_id : message.guild.id, owner : target}
            console.log(target + ' ' + change)

            //Update the target's inventory, then if their quantity for that item is 0, delete it
            const doc = await inventorySchema.findOneAndUpdate(
                query,{
                $inc : {quantity : -change}
            },{
                new : true,
                useFindAndModify : false
            })
            if(doc.quantity <= 0){
                await inventorySchema.findOneAndDelete({itemName : doc.itemName, server_id : doc.server_id, owner : doc.owner})
            }
            message.reply(` ${change} ${args[0]} taken from ${name}`)
        } finally {
            mongoose.connection.close()
        }
    })
}