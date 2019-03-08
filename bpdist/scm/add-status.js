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
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var yargs = require("yargs");
var util = require("../util");
var config_manager_1 = require("../config-manager");
var argv = yargs
    .option('scm', { demand: true })
    .option('repoUrl', { demand: true })
    .option('repoName', { demand: true })
    .option('commit', { demand: true })
    .option('status', { demand: true })
    .option('targetUrl', { demand: true })
    .option('inCluster', { demand: true })
    .option('namespace', { demand: true })
    .option('configPrefix', { demand: true })
    .argv;
var coreKubeClient = util.createKubeCoreClient(argv.inCluster === 'true', argv.namespace);
config_manager_1.ConfigManager.create(argv.configPrefix, coreKubeClient).then(function (configManager) { return __awaiter(_this, void 0, void 0, function () {
    var scmByName, scm, state;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, configManager.getScms()];
            case 1:
                scmByName = _a.sent();
                scm = scmByName.get(argv.scm);
                if (!scm) {
                    throw Error("Unable to find config for scm " + argv.scm);
                }
                switch (argv.status) {
                    case 'Succeeded':
                        state = 'success';
                        break;
                    case 'Failed':
                        state = 'failure';
                        break;
                    case 'Error':
                        state = 'error';
                        break;
                }
                return [4 /*yield*/, scm.addCommitStatus(argv.repoUrl, argv.repoName, argv.commit, {
                        targetUrl: argv.targetUrl,
                        description: argv.description || 'Argo CI',
                        state: state,
                    })];
            case 2:
                _a.sent();
                configManager.dispose();
                process.exit(0);
                return [2 /*return*/];
        }
    });
}); }).catch(function (err) {
    util.logger.error(err);
    process.exit(1);
});
//# sourceMappingURL=add-status.js.map