const mongo = require('../../mongo')
const itemSchema = require('../../schemas/itemSchema')
const inventorySchema = require('../../schemas/inventorySchema')
const { prefix } = require('../../config.json')


module.exports = {
	name: 'checkInventory',
	description: 'Checks the author\'s or party inventory for the given item, and shows its description and the quantity if it is there. DMs can show any player inventory.',
	minArgs: 1,
    maxArgs: 2,
    expectedArgs: ['[item name]' , '(optional) [<party name OR tagged user>]'],
    dbCommand: true,
	execute(message, args) {
		run(message, args)
    },
    help: true,
    helpString: `**${prefix}checkInventory** checks the author's or party's inventory for a given item. A DM can check the inventory of other players in the server
It takes a minimum of one, and a maximum of two arguments: \n
[<item name>]: This is the name of the item to look for.
(optional) [<party name OR tagged user>]: An optional argument. Players can enter their party name to check the party's inventory, and DM's can tag another player to check their inventory.`
}

async function run(message, args){
    await mongo().then(async (mongoose) => {
        try{
            var target = message.author.id
            var name = message.author.username
            const itemQuery = {name: args[0], server_id : message.guild.id}
            console.log(itemQuery)
            //First check to see if the item exists for the server
            const check = await itemSchema.exists(itemQuery)
            if(!check){
                message.reply(` that item does not exist here`)
                return
            }

            //Next check to see if the command passed a target
            if(args.length === 2){
                //If a user is mentioned, check to see if the author is a DM. If not, complain
                if(message.mentions.members.first()){
                    //If the author is a DM, set target and name to the tagged user's info
                    if(message.member.roles.cache.find(r => r.name === 'DM')){
                        target = message.mentions.members.first().id
                        name = message.mentions.members.first().user.username
                    } else {
                        message.reply(` you must have the DM role to view other player inventories`)
                        return
                    }
                }
                //If the author didn't mention a user, set the target and name to 'party'
                else{
                    target = 'party'
                    name = 'party'
                }
            }

            const inventoryQuery = {itemName : args[0], server_id : message.guild.id, owner : target}

            //Now check to see if the item exists in the target's inventory. If not, tell the user and return
            const inventoryCheck = await inventorySchema.exists(inventoryQuery)
            if(!inventoryCheck){
                message.reply(` ${name} does not have any **${args[0]}**`)
                return
            }
            //Since there's at least one item for the given owner, grab info for it and display it in the channel
            const itemData = await itemSchema.find(itemQuery)
            const inventoryData = await inventorySchema.find(inventoryQuery)
            var outString = ` looking at ${args[0]} in ${name}'s inventory \n`
            outString += `> **${itemData[0].name}** \n`
            outString += `> ${itemData[0].description} \n`
            outString += `> Quantity: ${inventoryData[0].quantity}`
            message.reply(outString, {split : {prepend : '>'}})
        } finally{
            mongoose.connection.close()
        }
    })
}