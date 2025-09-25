import { Context, Telegraf } from 'telegraf';

export interface ICommand {
  bot: Telegraf<Context>;
  init(): void;
}
