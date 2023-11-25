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
Object.defineProperty(exports, "__esModule", { value: true });
const filter_1 = require("./filter");
const headers = { "api-key": "6ccda160ab7f2a091ef159761bfc1b" };
const client = { mitarbeiter: {
        getAll: (filter) => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield fetch('https://cms.cognitio.de/api/collections/get/mitarbeiter?token=6ccda160ab7f2a091ef159761bfc1b', {
                headers,
            });
            const data = yield res.json();
            if (filter) {
                return (0, filter_1.default)(data.entries, filter);
            }
            return data.entries;
        }),
        get: (id) => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield fetch('https://cms.cognitio.de/api/collections/get/mitarbeiter?token=6ccda160ab7f2a091ef159761bfc1b&filter[_id]=' + id, {
                headers,
            });
            const data = yield res.json();
            const realData = data.entries[0];
            if (realData.image) {
                const urlForAsset = 'https://cms.cognitio.de/api/cockpit/assets/?token=6ccda160ab7f2a091ef159761bfc1b&filter[_id]=' + realData.image._id;
                const assetRes = yield fetch(urlForAsset);
                const { assets } = yield assetRes.json();
                realData.image = assets[0];
            }
            return realData;
        })
    },
};
exports.default = client;
