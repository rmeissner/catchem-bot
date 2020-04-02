"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var node_telegram_bot_api_1 = __importDefault(require("node-telegram-bot-api"));
var express = require('express');
var ethers = require('ethers');
var zoneData = require('./abi/Wilderniss.json');
var names = require('./names.json');
var app = express();
app.enable('trust proxy');
var Datastore = require('@google-cloud/datastore').Datastore;
// Instantiate a datastore client
var datastore = new Datastore();
var cacheKind = function (lastKind) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, datastore.save({
                    key: datastore.key(['Cache', 'lastKind']),
                    data: { lastKind: lastKind },
                })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
var bot = undefined;
var loadBot = function () { return __awaiter(void 0, void 0, void 0, function () {
    var token, key, secret;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!(bot == undefined)) return [3 /*break*/, 3];
                token = process.env.TELEGRAM_BOT_TOKEN;
                if (!!token) return [3 /*break*/, 2];
                key = datastore.key(['Secret', 'botToken']);
                return [4 /*yield*/, datastore.get(key)];
            case 1:
                secret = (_a.sent())[0];
                token = secret.value;
                _a.label = 2;
            case 2:
                bot = new node_telegram_bot_api_1.default(token);
                _a.label = 3;
            case 3: return [2 /*return*/, bot];
        }
    });
}); };
var loadChannel = function () { return __awaiter(void 0, void 0, void 0, function () {
    var channel, key, secret;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                channel = process.env.TELEGRAM_CHANNEL_ID;
                if (!!channel) return [3 /*break*/, 2];
                key = datastore.key(['Secret', 'botChannel']);
                return [4 /*yield*/, datastore.get(key)];
            case 1:
                secret = (_a.sent())[0];
                channel = secret.value;
                _a.label = 2;
            case 2: return [2 /*return*/, channel];
        }
    });
}); };
var loadEthKey = function () { return __awaiter(void 0, void 0, void 0, function () {
    var ethKey, key, secret, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                ethKey = process.env.ETH_SECRET_KEY;
                if (!!ethKey) return [3 /*break*/, 4];
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                key = datastore.key(['Secret', 'ethKey']);
                return [4 /*yield*/, datastore.get(key)];
            case 2:
                secret = (_a.sent())[0];
                ethKey = secret.value;
                return [3 /*break*/, 4];
            case 3:
                e_1 = _a.sent();
                console.error(e_1);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/, ethKey];
        }
    });
}); };
var loadCachedKind = function () { return __awaiter(void 0, void 0, void 0, function () {
    var key, cached, e_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                key = datastore.key(['Cache', 'lastKind']);
                return [4 /*yield*/, datastore.get(key)];
            case 1:
                cached = (_a.sent())[0];
                return [2 /*return*/, cached.lastKind];
            case 2:
                e_2 = _a.sent();
                console.log(e_2);
                return [2 /*return*/, 0];
            case 3: return [2 /*return*/];
        }
    });
}); };
function runAsyncWrapper(callback) {
    return function (req, res, next) {
        callback(req, res, next).catch(next);
    };
}
app.get('/test', runAsyncWrapper(function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var provider, zone, blockNumber, kindBlockNumber, appearBlockNumber, cachedKind, kind, kindInfo, channelId, bot_1, mnemonic, wallet, inTheZone, tx, channelId, bot_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                provider = ethers.getDefaultProvider("rinkeby");
                zone = new ethers.Contract(zoneData.networks[4].address, zoneData.abi, provider);
                return [4 /*yield*/, provider.getBlockNumber()];
            case 1:
                blockNumber = _a.sent();
                return [4 /*yield*/, zone.kindBlockNumber()];
            case 2:
                kindBlockNumber = _a.sent();
                appearBlockNumber = (kindBlockNumber + 255 > blockNumber) ? kindBlockNumber : 0;
                return [4 /*yield*/, loadCachedKind()];
            case 3:
                cachedKind = _a.sent();
                kind = 0;
                if (!(appearBlockNumber != 0 && appearBlockNumber < blockNumber)) return [3 /*break*/, 5];
                return [4 /*yield*/, zone.calcCurrentKind()];
            case 4:
                kindInfo = _a.sent();
                console.log(kindInfo);
                kind = kindInfo.calcKind;
                _a.label = 5;
            case 5:
                if (!(cachedKind != kind)) return [3 /*break*/, 18];
                return [4 /*yield*/, cacheKind(kind)];
            case 6:
                _a.sent();
                if (!(kind != 0)) return [3 /*break*/, 10];
                return [4 /*yield*/, loadChannel()];
            case 7:
                channelId = _a.sent();
                return [4 /*yield*/, loadBot()];
            case 8:
                bot_1 = _a.sent();
                return [4 /*yield*/, bot_1.sendMessage(channelId, "A wild " + names[kind - 1] + " appeared!", { parse_mode: 'Markdown' })];
            case 9:
                _a.sent();
                return [3 /*break*/, 17];
            case 10: return [4 /*yield*/, loadEthKey()];
            case 11:
                mnemonic = _a.sent();
                if (!mnemonic) return [3 /*break*/, 13];
                wallet = ethers.Wallet.fromMnemonic(mnemonic).connect(provider);
                inTheZone = zone.connect(wallet);
                return [4 /*yield*/, inTheZone.currentKindInfo({ gasLimit: 180000 })];
            case 12:
                tx = _a.sent();
                console.log(tx.hash);
                return [3 /*break*/, 17];
            case 13: return [4 /*yield*/, loadChannel()];
            case 14:
                channelId = _a.sent();
                return [4 /*yield*/, loadBot()];
            case 15:
                bot_2 = _a.sent();
                return [4 /*yield*/, bot_2.sendMessage(channelId, "Wanna catch 'em all? Then place a bait!", { parse_mode: 'Markdown' })];
            case 16:
                _a.sent();
                _a.label = 17;
            case 17:
                res
                    .status(200)
                    .send("New kind, " + cachedKind + ", " + kind)
                    .end();
                return [3 /*break*/, 19];
            case 18:
                res
                    .status(200)
                    .send("Nothing new, " + kind)
                    .end();
                _a.label = 19;
            case 19: return [2 /*return*/];
        }
    });
}); }));
var PORT = process.env.PORT || 8090;
app.listen(PORT, function () {
    console.log("App listening on port " + PORT);
    console.log('Press Ctrl+C to quit.');
});
