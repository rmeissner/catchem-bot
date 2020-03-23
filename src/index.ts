
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

app.get('/test', async (req: any, res: any, next: any) => {
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
            await bot.sendMessage(channelId, `A wild ${names[kind - 1]} appeared`, { parse_mode: 'Markdown' })
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
});

const PORT = process.env.PORT || 8090;
app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log('Press Ctrl+C to quit.');
});