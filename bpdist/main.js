"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var yargs = require("yargs");
var shell = require("shelljs");
var app = require("./app");
var util_1 = require("./util");
var argv = yargs
    .option('reposDir', { describe: 'Repositories temp directory' })
    .option('inCluster', { describe: 'Flag which indicates if app is running insite kube cluster or not' })
    .option('crdVersion', { describe: 'Version of Workflow CRD. Default is v1alpha1' })
    .option('namespace', { describe: 'Workflows creation namespace' })
    .option('argoCiImage', { describe: 'Argo CI Image name' })
    .option('configPrefix', { describe: 'Configuration name prefix' })
    .option('controllerInstanceId', { describe: 'Argo workflow controller instance id. Used to separate workflows in a cluster with multiple controllers.' })
    .argv;
app.createServers({
    repoDir: argv.repoDir || shell.tempdir(),
    inCluster: argv.inCluster === 'true',
    version: argv.crdVersion || 'v1alpha1',
    workflowsNamespace: argv.workflowsNamespace || 'default',
    namespace: argv.namespace || 'default',
    argoCiImage: argv.argoCiImage || 'argoproj/argoci:latest',
    configPrefix: argv.configPrefix || 'argo-ci',
    controllerInstanceId: argv.controllerInstanceId || '',
}).then(function (servers) {
    servers.webHookServer.listen(8001);
    servers.apiServer.listen(8002);
}).catch(function (e) {
    util_1.logger.error(e);
});
//# sourceMappingURL=main.js.map