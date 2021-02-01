const mongo = require('../../mongo')
const itemSchema = require('../../schemas/itemSchema')
const { prefix } = require('../../config.json')
const goldSchema = require('../../schemas/goldSchema')

module.exports = {
    name: 'giveGold',
    description: 'Gives gold to a player or party inventory',
    minArgs: 1,
    maxArgs: 2,
    dbCommand: true,
    expectedArgs: ['[Wpp, Xgp, Ysp, Zcp]', '(optional) [ <target> ]'],
    execute(message, args){
        run(message, args)
    },
    help: true,
    helpString: `**${prefix}giveGold gives gold to a player or party inventory.
It takes a minimum of one, and a maximum of two arguments: \n
[Wpp, Xgp, Ysp, Zcp]: The amount of coins to give. The values must be seperated by commas, and must include the denomination.
(optional) [ <target> ]: The intended recipient of the gold. By default, the command gives gold to the person calling the command, though they can give gold to the party instead. The DM can give gold to anyone.`
}

async function run(message, args){
    await mongo().then(async (mongoose) => {
        try {
            var target = message.author.id
            var name = message.author.username
            var p = 0
            var g = 0
            var s = 0
            var c = 0
            //If there are two args, they're trying to give gold to someone else.
            if(args.length === 2){
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

            //Parse the platinum, gold, silver, and copper amounts into regular numbers
            var coins = args[0].split(',')
            for(var i=0;i<coins.length;i++){
                var hold = ''
                //Iterate through the split string to find out what coins were passed into the command
                if(coins[i].includes('pp')){
                    hold = coins[i].replace('pp','')
                    if(isNaN(parseInt(hold))){
                        message.reply(` you must enter a number of coins!`)
                        return
                    }
                    if(parseInt(hold) < 0){
                        message.reply(` you must enter a positive number!`)
                        return
                    }
                    p = parseInt(hold)
                } else if (coins[i].includes('gp')){
                    hold = coins[i].replace('gp','')
                    if(isNaN(parseInt(hold))){
                        message.reply(` you must enter a number of coins!`)
                        return
                    }
                    if(parseInt(hold) < 0){
                        message.reply(` you must enter a positive number!`)
                        return
                    }
                    g = parseInt(hold)
                } else if (coins[i].includes('sp')){
                    hold = coins[i].replace('sp','')
                    if(isNaN(parseInt(hold))){
                        message.reply(` you must enter a number of coins!`)
                        return
                    }
                    if(parseInt(hold) < 0){
                        message.reply(` you must enter a positive number!`)
                        return
                    }
                    s = parseInt(hold)
                } else if (coins[i].includes('cp')){
                    hold = coins[i].replace('cp','')
                    if(isNaN(parseInt(hold))){
                        message.reply(` you must enter a number of coins!`)
                        return
                    }
                    if(parseInt(hold) < 0){
                        message.reply(` you must enter a positive number!`)
                        return
                    }
                    c = parseInt(hold)
                } else {
                    message.reply(` you must enter a number of coins!`)
                }
            }

            const query = {owner : target, server_id : message.guild.id}
            await goldSchema.findOneAndUpdate(
                query,{
                    $inc: {platinum : +p, gold : +g, silver : +s, copper : +c}
                },{
                    upsert : true,
                    useFindAndModify : false
                })
            message.reply(` ${name} given ${args[0]}`)
        } finally {
            mongoose.connection.close()
        }
    })
}