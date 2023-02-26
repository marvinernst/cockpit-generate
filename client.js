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
const headers = { "api-key": "USR-ddad43036e48261a66927f6440027971626494a2" };
const client = {
    tour: {
        getAll: (filter) => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield fetch('https://cms.ernsthaft.me/api/content/items/tour', {
                headers,
            });
            const data = yield res.json();
            if (filter) {
                return (0, filter_1.default)(data, filter);
            }
            return data;
        }),
        get: (id) => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield fetch('https://cms.ernsthaft.me/api/content/item/tour/' + id, {
                headers,
            });
            const data = yield res.json();
            return data;
        })
    },
    stationen: {
        getAll: (filter) => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield fetch('https://cms.ernsthaft.me/api/content/items/stationen', {
                headers,
            });
            const data = yield res.json();
            if (filter) {
                return (0, filter_1.default)(data, filter);
            }
            return data;
        }),
        get: (id) => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield fetch('https://cms.ernsthaft.me/api/content/item/stationen/' + id, {
                headers,
            });
            const data = yield res.json();
            return data;
        })
    },
};
exports.default = client;
