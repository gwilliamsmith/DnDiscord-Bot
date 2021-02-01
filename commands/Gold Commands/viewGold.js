const mongo = require('../../mongo')
const itemSchema = require('../../schemas/itemSchema')
const { prefix } = require('../../config.json')
const goldSchema = require('../../schemas/goldSchema')

module.exports = {
	name: 'viewGold',
	description: 'Shows how much gold a player or party has. DMs can view anyone\'s gold.',
	minArgs: 0,
    maxArgs: 1,
    dbCommand: true,
    expectedArgs: ['(optional) [ <target> ]'],
	execute(message, args) {
		run(message, args)
    },
    help: true,
	helpString: `**${prefix}viewGold** posts the amount of gold the target has.
It takes a maximum of one argument: \n
(optional) [ <target> ]: The person or party whose gold you're trying to view. DMs can specify any player, while non-DMs can only view the gold for a party they're a member of.`
}

async function run(message, args){
    await mongo().then(async (mongoose) => {
        try {
            var target = message.author.id
            var name = message.author.username
            
            //If there's an arg, they're trying to look at someone else's gold.
            if(args.length === 1){
                //If a user is mentioned, check if they're a DM. If not, complain
                if(message.mentions.members.first()){
                    if(message.member.roles.cache.find(r => r.name === 'DM')){
                        target = message.mentions.members.first().id
                        name = message.mentions.members.first().user.username
                    } else {
                        message.reply(` you must have the DM role to give gold to others`)
                        return
                    }
                }
                //If a user isn't mentioned, they're trying to give money to the party
                else{ 
                    target = 'party'
                    name = 'party'
                }                
            }
            
            const check = await goldSchema.exists({owner : target, server_id : message.guild.id})
            if (!check) {
                message.reply(` ${name} either doesn't exist, or has never been given gold here.`)
                return
            }
            const data = await goldSchema.find({owner : target, server_id : message.guild.id})
            const platinum = data[0]['platinum']
            const gold = data[0]['gold']
            const silver = data[0]['silver']
            const copper = data[0]['copper']
            message.reply(` ${name} has: ${platinum}pp ${gold}gp ${silver}sp ${copper}cp`)
        } finally {
            mongoose.connection.close()
        }
    })
}