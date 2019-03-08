"use strict";
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
var express = require("express");
var bodyParser = require("body-parser");
var expressWinston = require("express-winston");
var util = require("./util");
var ci_processor_1 = require("./ci-processor");
var config_manager_1 = require("./config-manager");
function wrap(action) {
    return function (req, res) {
        action(req)
            .then(function (data) {
            res.send(data);
        })
            .catch(function (e) {
            res.statusCode = e.statusCode || 500;
            res.send({
                message: e.message || e,
            });
            if (res.statusCode === 500) {
                util.logger.error('Failed to process request %s', req.url, e);
            }
        });
    };
}
function createServers(options) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        var expressLogger, crdKubeClient, coreKubeClient, configManager, processor, webHookServer, apiServer;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    expressLogger = expressWinston.logger({
                        transports: [util.winstonTransport],
                        meta: false,
                        msg: '{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}',
                    });
                    crdKubeClient = util.createKubeCrdClient(options.inCluster, options.workflowsNamespace, 'argoproj.io', options.version);
                    coreKubeClient = util.createKubeCoreClient(options.inCluster, options.namespace);
                    return [4 /*yield*/, config_manager_1.ConfigManager.create(options.configPrefix, coreKubeClient)];
                case 1:
                    configManager = _a.sent();
                    processor = new ci_processor_1.CiProcessor(options.repoDir, crdKubeClient, options.argoCiImage, options.namespace, options.workflowsNamespace, options.controllerInstanceId, configManager);
                    webHookServer = express();
                    webHookServer.use(expressLogger);
                    webHookServer.post('/api/webhook/:type', wrap(function (req) { return __awaiter(_this, void 0, void 0, function () {
                        var scmByType, scm, event_1;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, configManager.getScms()];
                                case 1:
                                    scmByType = _a.sent();
                                    scm = scmByType.get(req.params.type);
                                    if (!scm) return [3 /*break*/, 3];
                                    return [4 /*yield*/, scm.parseEvent(req)];
                                case 2:
                                    event_1 = _a.sent();
                                    if (event_1) {
                                        processor.processGitEvent(scm, event_1);
                                    }
                                    return [2 /*return*/, { ok: true }];
                                case 3: throw { statusCode: 404, message: "Webhook for '" + req.params.type + "' is not supported" };
                            }
                        });
                    }); }));
                    apiServer = express();
                    apiServer.use(expressLogger);
                    apiServer.use(bodyParser.json({ type: function (req) { return !req.url.startsWith('/api/webhook/'); } }));
                    apiServer.get('/api/configuration/settings', wrap(function (req) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                        return [2 /*return*/, configManager.getSettings()];
                    }); }); }));
                    apiServer.put('/api/configuration/settings', wrap(function (req) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                        return [2 /*return*/, configManager.updateSettings(req.body)];
                    }); }); }));
                    apiServer.get('/api/configuration/scms', wrap(function (req) { return __awaiter(_this, void 0, void 0, function () {
                        var res, config;
                        return __generator(this, function (_a) {
                            res = {};
                            config = configManager.getScmsConfig();
                            Array.from(config.keys()).forEach(function (type) { return res[type] = config.get(type); });
                            return [2 /*return*/, res];
                        });
                    }); }));
                    apiServer.post('/api/configuration/scms/:type', wrap(function (req) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, configManager.setScm(req.params.type, req.body.username, req.body.password, req.body.secret, req.body.repoUrl)];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/, { ok: true }];
                            }
                        });
                    }); }));
                    apiServer.delete('/api/configuration/scms/:type/:url', wrap(function (req) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, configManager.removeScm(req.params.type, req.params.url)];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/, { ok: true }];
                            }
                        });
                    }); }));
                    apiServer.get('/', express.static(__dirname, { index: 'index.html' }));
                    return [2 /*return*/, { webHookServer: webHookServer, apiServer: apiServer, configManager: configManager }];
            }
        });
    });
}
exports.createServers = createServers;
//# sourceMappingURL=app.js.map