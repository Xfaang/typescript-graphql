"use strict";
// 1. How to retrieve this information from file?
// 2. How to merge it with existing schema
Object.defineProperty(exports, "__esModule", { value: true });
exports.concat = exports.plus = void 0;
function plus(a, b) {
    return a + b;
}
exports.plus = plus;
function concat(firstName, lastName) {
    return {
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`,
    };
}
exports.concat = concat;
