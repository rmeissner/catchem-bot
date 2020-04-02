
import TelegramBot from 'node-telegram-bot-api'

const express = require('express');
const ethers = require('ethers');

const zoneData = require('./abi/Wilderniss.json')
const names = require('./names.json')

const app = express();
app.enable('trust proxy');

const { Datastore } = require('@google-cloud/datastore');
// Instantiate a datastore client
const datastore = new Datastore();

const cacheKind = async (lastKind: number) => {
    await datastore.save({
        key: datastore.key(['Cache', 'lastKind']),
        data: { lastKind: lastKind },
    })
};

let bot: TelegramBot | undefined = undefined
const loadBot = async (): Promise<TelegramBot> => {
    if (bot == undefined) {
        let token = process.env.TELEGRAM_BOT_TOKEN as string
        if (!token) {
            const key = datastore.key(['Secret', 'botToken'])
            const [secret] = await datastore.get(key);
            token = secret.value
        }
        bot = new TelegramBot(token)
    }
    return bot
}

const loadChannel = async (): Promise<string> => {
    let channel = process.env.TELEGRAM_CHANNEL_ID as string
    if (!channel) {
        const key = datastore.key(['Secret', 'botChannel'])
        const [secret] = await datastore.get(key);
        channel = secret.value
    }
    return channel
}

const loadEthKey = async (): Promise<string> => {
    let ethKey = process.env.ETH_SECRET_KEY as string
    if (!ethKey) {
        try {
            const key = datastore.key(['Secret', 'ethKey'])
            const [secret] = await datastore.get(key);
            ethKey = secret.value
        } catch (e) {
            console.error(e)
        }
    }
    return ethKey
}

const loadCachedKind = async (): Promise<number> => {
    try {
        const key = datastore.key(['Cache', 'lastKind'])
        const [cached] = await datastore.get(key);
        return cached.lastKind
    } catch (e) {
        console.log(e)
        return 0
    }
}

function runAsyncWrapper (callback: any) {
    return function (req: any, res: any, next: any) {
        callback(req, res, next).catch(next)
    }
}

app.get('/test', runAsyncWrapper(async (req: any, res: any, next: any) => {
    const provider = ethers.getDefaultProvider("rinkeby")
    const zone = new ethers.Contract(zoneData.networks[4].address, zoneData.abi, provider);
    const blockNumber = await provider.getBlockNumber()
    const kindBlockNumber = await zone.kindBlockNumber()
    const appearBlockNumber = (kindBlockNumber + 255 > blockNumber) ? kindBlockNumber : 0
    const cachedKind = await loadCachedKind()
    let kind = 0
    if (appearBlockNumber != 0 && appearBlockNumber < blockNumber) {
        const kindInfo = await zone.calcCurrentKind()
        console.log(kindInfo)
        kind = kindInfo.calcKind
    }
    if (cachedKind != kind) {
        await cacheKind(kind)
        if (kind != 0) {
            const channelId = await loadChannel()
            const bot = await loadBot()
            await bot.sendMessage(channelId, `A wild ${names[kind - 1]} appeared! Fast catch it http://catchem.thegerman.de/#/zone`, { parse_mode: 'Markdown' })
        } else {
            const mnemonic = await loadEthKey()
            if (mnemonic) {
                const wallet = ethers.Wallet.fromMnemonic(mnemonic).connect(provider)
                let inTheZone = zone.connect(wallet)
                const tx = await inTheZone.currentKindInfo({ gasLimit: 180000 })
                console.log(tx.hash)
            } else {
                const channelId = await loadChannel()
                const bot = await loadBot()
                await bot.sendMessage(channelId, `Wanna catch \'em all? Then place a bait! http://catchem.thegerman.de/#/zone`, { parse_mode: 'Markdown' })
            }
        }
        res
            .status(200)
            .send(`New kind, ${cachedKind}, ${kind}`)
            .end();
    } else {
        res
            .status(200)
            .send(`Nothing new, ${kind}`)
            .end();
    }
}));

const PORT = process.env.PORT || 8090;
app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log('Press Ctrl+C to quit.');
});