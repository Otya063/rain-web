import { type discord, type discord_register, type distribution, type launcher_info, type launcher_system, type users } from '@prisma/client/edge';

export type Discord = discord | null;

export type DiscordRegister = discord_register | null;

export type LauncherInfo = launcher_info[] | { [key: string]: launcher_info[] };

export type LauncherSystem = launcher_system | null;

export type Users = users | null;

export type Distribution = Omit<Omit<distribution, 'bot'>, 'data'> & {
    data: string;
};
