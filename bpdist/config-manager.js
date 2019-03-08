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
var rxjs_1 = require("rxjs");
var JSONStream = require("json-stream");
var scm = require("./scm");
var ConfigManager = /** @class */ (function () {
    function ConfigManager(kubeSecretPrefix, kubeCoreClient) {
        this.kubeSecretPrefix = kubeSecretPrefix;
        this.kubeCoreClient = kubeCoreClient;
    }
    ConfigManager.create = function (kubeSecretPrefix, kubeCoreClient) {
        return __awaiter(this, void 0, void 0, function () {
            var manager;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        manager = new ConfigManager(kubeSecretPrefix, kubeCoreClient);
                        return [4 /*yield*/, manager.initialize()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, manager];
                }
            });
        });
    };
    ConfigManager.prototype.getScms = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.getScmsFromConfig(this.scmsConfig.getValue())];
            });
        });
    };
    ConfigManager.prototype.getSettings = function () {
        return __awaiter(this, void 0, void 0, function () {
            var configMap;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.loadKubeEntity('configmap', this.configMapName)];
                    case 1:
                        configMap = (_a.sent()) || {
                            data: {
                                externalUiUrl: 'http://argo-ci',
                            },
                        };
                        return [2 /*return*/, configMap.data];
                }
            });
        });
    };
    ConfigManager.prototype.updateSettings = function (settings) {
        return __awaiter(this, void 0, void 0, function () {
            var updatedConfigMap;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        updatedConfigMap = {
                            apiVersion: 'v1',
                            kind: 'ConfigMap',
                            metadata: {
                                name: this.configMapName,
                            },
                            data: settings,
                        };
                        return [4 /*yield*/, this.updateKubeEntity('configmap', this.configMapName, updatedConfigMap)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ConfigManager.prototype.getScmsConfig = function () {
        var result = new Map();
        for (var _i = 0, _a = Array.from(this.scmsConfig.getValue().keys()); _i < _a.length; _i++) {
            var key = _a[_i];
            var typeConfig = this.scmsConfig.getValue().get(key);
            result.set(key, Object.keys(typeConfig));
        }
        return result;
    };
    ConfigManager.prototype.setScm = function (type, username, password, secret, repoUrl) {
        return __awaiter(this, void 0, void 0, function () {
            var scmsConfig, config, scms;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        scmsConfig = this.scmsConfig.getValue();
                        config = scmsConfig.get(type) || {};
                        config[repoUrl] = { username: username, password: password, secret: secret };
                        scmsConfig.set(type, config);
                        return [4 /*yield*/, this.updateScmSecret(scmsConfig)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.getScms()];
                    case 2:
                        scms = _a.sent();
                        return [2 /*return*/, scms.get(type)];
                }
            });
        });
    };
    ConfigManager.prototype.removeScm = function (type, repoUrl) {
        return __awaiter(this, void 0, void 0, function () {
            var scmsConfig, config;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        scmsConfig = this.scmsConfig.getValue();
                        config = scmsConfig.get(type) || {};
                        delete config[repoUrl];
                        scmsConfig.set(type, config);
                        if (Object.keys(config).length === 0) {
                            scmsConfig.delete(type);
                        }
                        return [4 /*yield*/, this.updateScmSecret(scmsConfig)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ConfigManager.prototype.dispose = function () {
        if (this.subscription) {
            this.subscription.unsubscribe();
            this.subscription = null;
        }
    };
    ConfigManager.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _a = this;
                        _b = rxjs_1.BehaviorSubject.bind;
                        _c = this.deserializeScmsConfig;
                        return [4 /*yield*/, this.loadKubeEntity('secret', this.secretName)];
                    case 1:
                        _a.scmsConfig = new (_b.apply(rxjs_1.BehaviorSubject, [void 0, _c.apply(this, [((_d.sent()) || {}).data])]))();
                        this.subscription = new rxjs_1.Observable(function (observer) {
                            var stream = _this.kubeCoreClient.ns.secret.getStream({ qs: { watch: true } });
                            stream.on('end', function () { return observer.complete(); });
                            stream.on('error', function (e) { return observer.error(e); });
                            stream.on('close', function () { return observer.complete(); });
                            var jsonStream = stream.pipe(new JSONStream());
                            jsonStream.on('data', function (d) { return observer.next(d); });
                            return function () { return stream.req.abort(); };
                        })
                            .repeat().retry()
                            .filter(function (info) { return info.object && info.object.metadata && info.object.metadata.name === _this.secretName; })
                            .subscribe(function (info) { return _this.scmsConfig.next(_this.deserializeScmsConfig(info.object.data)); });
                        return [2 /*return*/];
                }
            });
        });
    };
    ConfigManager.prototype.getScmsFromConfig = function (scmsConfig) {
        var result = new Map();
        Array.from(scmsConfig.keys()).forEach(function (key) {
            var item;
            if (key === 'github') {
                item = new scm.GitHubScm(scmsConfig.get(key));
            }
            else {
                throw new Error("Scm type " + key + " is not supported");
            }
            result.set(key, item);
        });
        return result;
    };
    ConfigManager.prototype.updateScmSecret = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var updatedSecret;
            return __generator(this, function (_a) {
                updatedSecret = {
                    apiVersion: 'v1',
                    kind: 'Secret',
                    metadata: {
                        name: this.secretName,
                    },
                    type: 'Opaque',
                    data: this.serializeScmsConfig(data),
                };
                this.updateKubeEntity('secret', this.secretName, updatedSecret);
                return [2 /*return*/];
            });
        });
    };
    ConfigManager.prototype.deserializeScmsConfig = function (data) {
        var result = new Map();
        Object.keys(data || {}).forEach(function (key) {
            result.set(key, JSON.parse(new Buffer(data[key], 'base64').toString('ascii')));
        });
        return result;
    };
    ConfigManager.prototype.serializeScmsConfig = function (config) {
        var result = {};
        for (var _i = 0, _a = Array.from(config.keys()); _i < _a.length; _i++) {
            var key = _a[_i];
            result[key] = new Buffer(JSON.stringify(config.get(key))).toString('base64');
        }
        return result;
    };
    ConfigManager.prototype.updateKubeEntity = function (type, name, updatedEntity) {
        return __awaiter(this, void 0, void 0, function () {
            var entity;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.loadKubeEntity(type, name)];
                    case 1:
                        entity = _a.sent();
                        if (!!entity) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.kubeCoreClient.ns[type].post({ body: updatedEntity })];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, this.kubeCoreClient.ns[type].put({ name: name, body: updatedEntity })];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    ConfigManager.prototype.loadKubeEntity = function (type, name) {
        return __awaiter(this, void 0, void 0, function () {
            var e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.kubeCoreClient.ns[type].get(name)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        e_1 = _a.sent();
                        if (e_1.code === 404) {
                            return [2 /*return*/, null];
                        }
                        else {
                            throw e_1;
                        }
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    Object.defineProperty(ConfigManager.prototype, "secretName", {
        get: function () {
            return this.kubeSecretPrefix + "-scm";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ConfigManager.prototype, "configMapName", {
        get: function () {
            return this.kubeSecretPrefix + "-settings";
        },
        enumerable: true,
        configurable: true
    });
    return ConfigManager;
}());
exports.ConfigManager = ConfigManager;
//# sourceMappingURL=config-manager.js.map