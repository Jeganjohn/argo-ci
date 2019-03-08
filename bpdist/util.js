"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
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
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
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
Object.defineProperty(exports, "__esModule", { value: true });
var shell = require("shelljs");
var shellEscape = require("shell-escape");
var promisify = require("promisify-node");
var Api = require("kubernetes-client");
var winston = require("winston");
var fs = promisify('fs');
function sh(cmd, cwd, rejectOnFail) {
    if (cwd === void 0) { cwd = null; }
    if (rejectOnFail === void 0) { rejectOnFail = true; }
    return new Promise(function (resolve, reject) {
        shell.exec(shellEscape(['sh', '-c', cmd]), { silent: true, cwd: cwd }, function (code, stdout, stderr) {
            var res = { code: code, stdout: stdout, stderr: stderr };
            if (code !== 0 && rejectOnFail) {
                reject(res);
            }
            else {
                resolve(res);
            }
        });
    });
}
exports.sh = sh;
function fileExists(filePath) {
    return __awaiter(this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, fs.stat(filePath)];
                case 1:
                    _b.sent();
                    return [2 /*return*/, true];
                case 2:
                    _a = _b.sent();
                    return [2 /*return*/, false];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.fileExists = fileExists;
function createKubeCoreClient(inCluster, namespace) {
    var config = __assign({}, (inCluster ? Api.config.getInCluster() : Api.config.fromKubeconfig()), { namespace: namespace, promises: true });
    return new Api.Core(__assign({}, config));
}
exports.createKubeCoreClient = createKubeCoreClient;
function createKubeCrdClient(inCluster, namespace, group, version) {
    var config = __assign({}, (inCluster ? Api.config.getInCluster() : Api.config.fromKubeconfig()), { namespace: namespace, group: group, promises: true });
    var client = new Api.CustomResourceDefinitions(__assign({}, config, { version: version, group: group }));
    client.addResource('workflows');
    return client;
}
exports.createKubeCrdClient = createKubeCrdClient;
exports.winstonTransport = new winston.transports.Console();
function replaceErrors(_, value) {
    if (value instanceof Buffer) {
        return value.toString('base64');
    }
    else if (value instanceof Error) {
        var error_1 = {};
        Object.getOwnPropertyNames(value).forEach(function (key) {
            error_1[key] = value[key];
        });
        return error_1;
    }
    return value;
}
exports.logger = winston.createLogger({
    format: winston.format.combine(winston.format.json({ replacer: replaceErrors })),
    transports: [exports.winstonTransport],
    level: process.env.LOGGING_LEVEL || 'info',
});
//# sourceMappingURL=util.js.map