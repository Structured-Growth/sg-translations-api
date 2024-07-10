import "reflect-metadata";
import "./load-environment";
import { App } from "./app";
import {
	container,
	Lifecycle,
	logWriters,
	Logger,
	AuthService,
	PolicyService,
	eventBusProviders,
	EventbusService,
} from "@structured-growth/microservice-sdk";
import { loadEnvironment } from "./load-environment";
import { ClientRepository } from "../modules/clients/client.repository";
import { ClientService } from "../modules/clients/client.service";
import { TokenRepository } from "../modules/tokens/token.repository";
import { TokenService } from "../modules/tokens/token.service";
import { TranslationRepository } from "../modules/translations/translation.repository";
import { TranslationService } from "../modules/translations/translation.service";
import { JobRepository } from "../modules/jobs/job.repository";
import { JobService } from "../modules/jobs/job.service";

// load and validate env variables
loadEnvironment();

// const
container.register("appPrefix", { useValue: process.env.APP_PREFIX });
container.register("stage", { useValue: process.env.STAGE });
container.register("region", { useValue: process.env.REGION });
container.register("isDev", { useValue: process.env.STAGE === "dev" });
container.register("isTest", { useValue: process.env.STAGE === "test" });
container.register("logDbRequests", { useValue: process.env.LOG_DB_REQUESTS === "true" });
container.register("logRequestBody", { useValue: process.env.LOG_HTTP_REQUEST_BODY === "true" });
container.register("logResponses", { useValue: process.env.LOG_HTTP_RESPONSES === "true" });

// services
container.register("LogWriter", logWriters[process.env.LOG_WRITER] || "ConsoleLogWriter", {
	lifecycle: Lifecycle.Singleton,
});
container.register("Logger", Logger);
container.register("App", App, { lifecycle: Lifecycle.Singleton });
container.register("ClientService", ClientService);
container.register("TranslationService", TranslationService);
container.register("TokenService", TokenService);
container.register("JobService", JobService);

container.register("authenticationEnabled", { useValue: process.env.AUTHENTICATION_ENABLED === "true" });
container.register("authorizationEnabled", { useValue: process.env.AUTHORIZATION_ENABLED === "true" });
container.register("internalAuthenticationEnabled", {
	useValue: process.env.INTERNAL_AUTHENTICATION_ENABLED === "true",
});
container.register("internalRequestsAllowed", { useValue: process.env.INTERNAL_REQUESTS_ALLOWED === "true" });
container.register("internalAuthenticationJwtSecret", { useValue: process.env.INTERNAL_AUTHENTICATION_JWT_SECRET });
container.register("oAuthServiceGetUserUrl", { useValue: process.env.OAUTH_USER_URL });
container.register("policiesServiceUrl", { useValue: process.env.POLICY_SERVICE_URL });
container.register("AuthService", AuthService);
container.register("PolicyService", PolicyService);

container.register("eventbusName", { useValue: process.env.EVENTBUS_NAME || "sg-eventbus-dev" });
container.register("EventbusProvider", eventBusProviders[process.env.EVENTBUS_PROVIDER || "TestEventbusProvider"]);
container.register("EventbusService", EventbusService);

// repositories
container.register("ClientRepository", ClientRepository);
container.register("TokenRepository", TokenRepository);
container.register("TranslationRepository", TranslationRepository);
container.register("JobRepository", JobRepository);
