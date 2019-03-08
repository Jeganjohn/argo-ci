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
var promisify = require("promisify-node");
var path = require("path");
var yaml = require("js-yaml");
var AsyncLock = require("async-lock");
var uuid = require("uuid");
var util = require("./util");
var fs = promisify('fs');
var CiProcessor = /** @class */ (function () {
    function CiProcessor(reposPath, crdKubeClient, argoCiImage, namespace, workflowsNamespace, controllerInstanceId, configManager) {
        this.reposPath = reposPath;
        this.crdKubeClient = crdKubeClient;
        this.argoCiImage = argoCiImage;
        this.namespace = namespace;
        this.workflowsNamespace = workflowsNamespace;
        this.controllerInstanceId = controllerInstanceId;
        this.configManager = configManager;
        this.lock = new AsyncLock();
    }
    CiProcessor.prototype.processGitEvent = function (scm, scmEvent) {
        return __awaiter(this, void 0, void 0, function () {
            var e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        util.logger.info('Processing scm event', scmEvent);
                        return [4 /*yield*/, this.doProcessGitEvent(scm, scmEvent)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        e_1 = _a.sent();
                        util.logger.error("Failed to process scm event '%s'", JSON.stringify(scmEvent), e_1);
                        this.addCommitStatus(scm, scmEvent, { targetUrl: null, description: 'Argo CI workflow', state: 'failure' });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    CiProcessor.prototype.doProcessGitEvent = function (scm, scmEvent) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var ciWorkflow, res, _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, this.asyncLock(scmEvent.commit.repo.cloneUrl, function () { return _this.loadCiWorkflow(scmEvent.commit.repo.cloneUrl, scmEvent.commit.sha); })];
                    case 1:
                        ciWorkflow = _d.sent();
                        if (!ciWorkflow) return [3 /*break*/, 5];
                        this.fillLabels(ciWorkflow);
                        this.fillCommitArgs(scmEvent, ciWorkflow);
                        return [4 /*yield*/, this.addExitHandler(scm, scmEvent, ciWorkflow)];
                    case 2:
                        _d.sent();
                        return [4 /*yield*/, this.crdKubeClient.ns['workflows'].post({ body: ciWorkflow })];
                    case 3:
                        res = _d.sent();
                        util.logger.info("CI workflow " + res.metadata.namespace + "/" + res.metadata.name + " had been created");
                        _a = this.addCommitStatus;
                        _b = [scm, scmEvent];
                        _c = {};
                        return [4 /*yield*/, this.getStatusTargetUrl(res)];
                    case 4:
                        _a.apply(this, _b.concat([(_c.targetUrl = _d.sent(),
                                _c.description = 'Argo CI workflow',
                                _c.state = 'pending',
                                _c)]));
                        return [3 /*break*/, 6];
                    case 5:
                        util.logger.info("Ignoring SCM event");
                        _d.label = 6;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    CiProcessor.prototype.getStatusTargetUrl = function (workflow) {
        return __awaiter(this, void 0, void 0, function () {
            var settings;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.configManager.getSettings()];
                    case 1:
                        settings = _a.sent();
                        return [2 /*return*/, settings.externalUiUrl + "/workflows/" + workflow.metadata.namespace + "/" + workflow.metadata.name];
                }
            });
        });
    };
    CiProcessor.prototype.addExitHandler = function (scm, scmEvent, workflow) {
        return __awaiter(this, void 0, void 0, function () {
            var settings, statusExitTemplate, existingExitHandler, steps, onExitTemplate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.configManager.getSettings()];
                    case 1:
                        settings = _a.sent();
                        statusExitTemplate = {
                            name: uuid(),
                            container: {
                                image: this.argoCiImage,
                                command: ['sh', '-c'],
                                args: ['node /app/scm/add-status.js ' +
                                        ("--status {{workflow.status}} --repoName " + scmEvent.repo.fullName + " --repoUrl " + scmEvent.repo.cloneUrl + " ") +
                                        ("--commit " + scmEvent.commit.sha + " --targetUrl " + settings.externalUiUrl + "/workflows/" + this.workflowsNamespace + "/{{workflow.name}} ") +
                                        ("--inCluster true --configPrefix " + this.configManager.kubeSecretPrefix + " ") +
                                        ("--scm " + scm.type + " --namespace " + this.namespace)],
                            },
                        };
                        existingExitHandler = workflow.spec.onExit;
                        steps = [{ name: statusExitTemplate.name, template: statusExitTemplate.name }];
                        if (existingExitHandler) {
                            steps.push(existingExitHandler);
                        }
                        onExitTemplate = {
                            name: uuid(),
                            steps: [steps],
                        };
                        workflow.spec.onExit = onExitTemplate.name;
                        workflow.spec.templates.push(statusExitTemplate);
                        workflow.spec.templates.push(onExitTemplate);
                        return [2 /*return*/];
                }
            });
        });
    };
    CiProcessor.prototype.fillLabels = function (ciWorkflow) {
        if (this.controllerInstanceId) {
            var labels = ciWorkflow.metadata.labels || {};
            labels['workflows.argoproj.io/controller-instanceid'] = this.controllerInstanceId;
            ciWorkflow.metadata.labels = labels;
        }
    };
    CiProcessor.prototype.fillCommitArgs = function (scmEvent, ciWorkflow) {
        if (ciWorkflow.spec.arguments && ciWorkflow.spec.arguments.parameters) {
            var revisionParam = ciWorkflow.spec.arguments.parameters.find(function (param) { return param.name === 'revision'; });
            var repoParam = ciWorkflow.spec.arguments.parameters.find(function (param) { return param.name === 'repo'; });
            if (revisionParam) {
                revisionParam.value = scmEvent.commit.sha;
            }
            if (repoParam) {
                repoParam.value = scmEvent.commit.repo.cloneUrl;
            }
        }
    };
    CiProcessor.prototype.addCommitStatus = function (scm, event, status) {
        return __awaiter(this, void 0, void 0, function () {
            var e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, scm.addCommitStatus(event.repo.cloneUrl, event.repo.fullName, event.commit.sha, status)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        e_2 = _a.sent();
                        util.logger.error('Unable to update commit status', e_2);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    CiProcessor.prototype.asyncLock = function (key, action) {
        return this.lock.acquire(key, function () { return action(); });
    };
    CiProcessor.prototype.ensureRepoInitialized = function (url) {
        return __awaiter(this, void 0, void 0, function () {
            var repoPath, e_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        repoPath = path.join(this.reposPath, url.replace(/\//g, '_'));
                        return [4 /*yield*/, util.fileExists(repoPath)];
                    case 1:
                        if (!!(_a.sent())) return [3 /*break*/, 3];
                        return [4 /*yield*/, fs.mkdir(repoPath)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, , 7]);
                        return [4 /*yield*/, util.sh("git status", repoPath)];
                    case 4:
                        _a.sent();
                        return [3 /*break*/, 7];
                    case 5:
                        e_3 = _a.sent();
                        return [4 /*yield*/, util.sh("git init && git config core.sparseCheckout true && echo '.argo-ci/' > .git/info/sparse-checkout && git remote add origin '" + url + "'", repoPath)];
                    case 6:
                        _a.sent();
                        return [3 /*break*/, 7];
                    case 7:
                        util.logger.info("Updating repository '" + url + "'");
                        return [4 /*yield*/, util.sh('git fetch origin', repoPath)];
                    case 8:
                        _a.sent();
                        return [2 /*return*/, repoPath];
                }
            });
        });
    };
    CiProcessor.prototype.loadCiWorkflow = function (repoCloneUrl, tag) {
        return __awaiter(this, void 0, void 0, function () {
            var repoPath, e_4, templatePath, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.ensureRepoInitialized(repoCloneUrl)];
                    case 1:
                        repoPath = _c.sent();
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, util.sh("git checkout " + tag, repoPath)];
                    case 3:
                        _c.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        e_4 = _c.sent();
                        //  Sparse checkout failes if .argo-ci/ does not exist
                        util.logger.warn("Repository '" + repoCloneUrl + "#" + tag + "' does not have .argo-ci/");
                        return [3 /*break*/, 5];
                    case 5:
                        templatePath = repoPath + "/.argo-ci/ci.yaml";
                        return [4 /*yield*/, util.fileExists(templatePath)];
                    case 6:
                        if (!_c.sent()) return [3 /*break*/, 8];
                        _b = (_a = yaml).safeLoad;
                        return [4 /*yield*/, fs.readFile(templatePath, 'utf8')];
                    case 7: return [2 /*return*/, _b.apply(_a, [_c.sent()])];
                    case 8:
                        util.logger.warn("Repository '" + repoCloneUrl + "#" + tag + "' does not have .argo-ci/ci.yaml");
                        return [2 /*return*/, null];
                }
            });
        });
    };
    return CiProcessor;
}());
exports.CiProcessor = CiProcessor;
//# sourceMappingURL=ci-processor.js.map