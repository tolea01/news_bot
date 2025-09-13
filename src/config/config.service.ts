import type { DotenvParseOutput } from 'dotenv'
import { config } from 'dotenv'
import type { IConfigService } from './config.interface'

export class ConfigService implements IConfigService {
	private config: DotenvParseOutput

	constructor() {
		const { error, parsed } = config()

		if (error) {
			throw new Error('The .env file was not found')
		}

		if (!parsed) {
			throw new Error('The .env file is empty')
		}

		this.config = parsed
	}

	get(key: string): string {
		const res: string | undefined = this.config[key]

		if (!res) {
			throw new Error('No such key')
		}

		return res
	}
}
