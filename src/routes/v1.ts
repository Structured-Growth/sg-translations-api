/**
* IMPORTANT NOTE!
* This file was auto-generated with tsoa.
* Please do not modify it. Re-run tsoa to re-generate this file
*/

import { Router } from "express";
import { container, handleRequest } from "@structured-growth/microservice-sdk";
import * as Controllers from "../controllers/v1";

const handlerOpts = {
    logRequestBody: container.resolve<boolean>('logRequestBody'),
    logResponses: container.resolve<boolean>('logResponses'),
}

export const router = Router();
const pathPrefix = process.env.URI_PATH_PREFIX || '';

//TranslationsController
router.get(pathPrefix + '/v1/translations', handleRequest(Controllers.TranslationsController, "search", handlerOpts));
router.get(pathPrefix + '/v1/translations/:translationId', handleRequest(Controllers.TranslationsController, "get", handlerOpts));
router.put(pathPrefix + '/v1/translations/:translationId', handleRequest(Controllers.TranslationsController, "update", handlerOpts));

//TranslationSetController
router.get(pathPrefix + '/v1/translation-set/:clientId/:locale', handleRequest(Controllers.TranslationSetController, "getTranslationSet", handlerOpts));
router.post(pathPrefix + '/v1/translation-set/:clientId/translate', handleRequest(Controllers.TranslationSetController, "translate", handlerOpts));
router.post(pathPrefix + '/v1/translation-set/:clientId/upload', handleRequest(Controllers.TranslationSetController, "uploadTranslation", handlerOpts));
router.post(pathPrefix + '/v1/translation-set/:clientId/update', handleRequest(Controllers.TranslationSetController, "updateTranslation", handlerOpts));

//TokensController
router.get(pathPrefix + '/v1/tokens', handleRequest(Controllers.TokensController, "search", handlerOpts));
router.get(pathPrefix + '/v1/tokens/:tokenId', handleRequest(Controllers.TokensController, "get", handlerOpts));

//SystemController
router.post(pathPrefix + '/v1/system/migrate', handleRequest(Controllers.SystemController, "migrate", handlerOpts));
router.post(pathPrefix + '/v1/system/i18n-upload', handleRequest(Controllers.SystemController, "uploadI18n", handlerOpts));

//PingController
router.get(pathPrefix + '/v1/ping/alive', handleRequest(Controllers.PingController, "pingGet", handlerOpts));

//ClientsController
router.get(pathPrefix + '/v1/clients', handleRequest(Controllers.ClientsController, "search", handlerOpts));
router.post(pathPrefix + '/v1/clients', handleRequest(Controllers.ClientsController, "create", handlerOpts));
router.get(pathPrefix + '/v1/clients/:clientId', handleRequest(Controllers.ClientsController, "get", handlerOpts));
router.put(pathPrefix + '/v1/clients/:clientId', handleRequest(Controllers.ClientsController, "update", handlerOpts));
router.delete(pathPrefix + '/v1/clients/:clientId', handleRequest(Controllers.ClientsController, "delete", handlerOpts));

//JobsController
router.get(pathPrefix + '/v1/jobs', handleRequest(Controllers.JobsController, "search", handlerOpts));
router.get(pathPrefix + '/v1/jobs/:jobId', handleRequest(Controllers.JobsController, "get", handlerOpts));
router.delete(pathPrefix + '/v1/jobs/:jobId', handleRequest(Controllers.JobsController, "delete", handlerOpts));

//ResolverController
router.get(pathPrefix + '/v1/resolver/resolve', handleRequest(Controllers.ResolverController, "resolve", handlerOpts));
router.get(pathPrefix + '/v1/resolver/actions', handleRequest(Controllers.ResolverController, "actions", handlerOpts));
router.get(pathPrefix + '/v1/resolver/models', handleRequest(Controllers.ResolverController, "models", handlerOpts));

// map is required for correct resolving action by route
export const actionToRouteMap = {
	"TranslationsController.search": 'get /v1/translations',
	"TranslationsController.get": 'get /v1/translations/:translationId',
	"TranslationsController.update": 'put /v1/translations/:translationId',
	"TranslationSetController.getTranslationSet": 'get /v1/translation-set/:clientId/:locale',
	"TranslationSetController.translate": 'post /v1/translation-set/:clientId/translate',
	"TranslationSetController.uploadTranslation": 'post /v1/translation-set/:clientId/upload',
	"TranslationSetController.updateTranslation": 'post /v1/translation-set/:clientId/update',
	"TokensController.search": 'get /v1/tokens',
	"TokensController.get": 'get /v1/tokens/:tokenId',
	"SystemController.migrate": 'post /v1/system/migrate',
	"SystemController.uploadI18n": 'post /v1/system/i18n-upload',
	"PingController.pingGet": 'get /v1/ping/alive',
	"ClientsController.search": 'get /v1/clients',
	"ClientsController.create": 'post /v1/clients',
	"ClientsController.get": 'get /v1/clients/:clientId',
	"ClientsController.update": 'put /v1/clients/:clientId',
	"ClientsController.delete": 'delete /v1/clients/:clientId',
	"JobsController.search": 'get /v1/jobs',
	"JobsController.get": 'get /v1/jobs/:jobId',
	"JobsController.delete": 'delete /v1/jobs/:jobId',
	"ResolverController.resolve": 'get /v1/resolver/resolve',
	"ResolverController.actions": 'get /v1/resolver/actions',
	"ResolverController.models": 'get /v1/resolver/models',
};
