"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.oid = oid;
exports.serialize = serialize;
const mongodb_1 = require("mongodb");
function oid(id) {
    if (!mongodb_1.ObjectId.isValid(id))
        throw new Error(`Invalid id: ${id}`);
    return new mongodb_1.ObjectId(id);
}
function serialize(value) {
    const { _id, ...rest } = value;
    return { ...rest, id: _id.toString() };
}
