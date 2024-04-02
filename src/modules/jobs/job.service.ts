import AWS from "aws-sdk";
import { autoInjectable, inject, NotFoundError, ValidationError } from "@structured-growth/microservice-sdk";
import { JobRepository } from "./job.repository";

@autoInjectable()
export class JobService {
	constructor(@inject("JobRepository") private jobRepository: JobRepository) {}

	// public async createJob(
	// 	orgId: number,
	// 	region: string,
	// 	translator: string,
	// 	translations: {clientId: number, locale: string, translationsForJob: object}[]
	// ): Promise<void> {
	// 	const translate = new AWS.Translate({
	// 		accessKeyId: process.env.AMAZON_ACCESS_KEY_ID,
	// 		secretAccessKey: process.env.AMAZON_SECRET_ACCESS_KEY,
	// 		region: region
	// 	});
	//
	// 	for (const translation of translations) {
	// 		const json = JSON.stringify(translation.translationsForJob);
	// 		const currentDate = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
	//
	// 		AWS.config.update({
	// 			accessKeyId: process.env.AWS_ACCESS_KEY_ID,
	// 			secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
	// 		});
	//
	// 		const s3 = new AWS.S3();
	//
	// 		const translationData = JSON.stringify(translation.translationsForJob);
	// 		const fileName = 'translations.json';
	//
	// 		const params = {
	// 			Bucket: 'bucket-name',
	// 			Key: `path/to/${fileName}`,
	// 			Body: translationData
	// 		};
	//
	// 		s3.upload(params, (err, data) => {
	// 			if (err) {
	// 				console.error('Ошибка при загрузке файла на Amazon S3:', err);
	// 			} else {
	// 				console.log('Файл успешно загружен на Amazon S3:', data.Location);
	// 			}
	// 		});
	//
	// 		try {
	// 			const params: AWS.Translate.Types.StartTextTranslationJobRequest = {
	// 				JobName: `TranslationJob_${orgId}_${translation.clientId}_${translation.locale}_${currentDate}`,
	// 					InputDataConfig: {
	// 						S3Uri: `s3://bucket/path/to/input/${filePath}`,
	// 						ContentType: 'application/json'
	// 					},
	// 				OutputDataConfig: {
	// 					S3Uri: `s3://bucket/path/to/output/${translation.locale}/`,
	// 				},
	// 				DataAccessRoleArn: process.env.AMAZON_DATA_ACCESS_ROLE_ARN,
	// 				SourceLanguageCode: 'en',
	// 				TargetLanguageCodes: [translation.locale]
	// 			};
	//
	// 			await createAndAwaitTranslationJob(translate, params);
	// 		} catch (err) {
	// 			throw new ValidationError({
	// 				title: "Translation error",
	// 			});
	// 		}
	// 	}
	//
	// 	translate.translateText(params).promise()
	// 		.then(data => {
	// 			console.log(data.TranslatedText);
	// 		})
	// 		.catch(err => {
	// 			console.error('Ошибка при переводе текста:', err);
	// 		});
	// }
}
