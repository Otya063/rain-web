import { error } from '@sveltejs/kit';
import postgres from 'postgres';
import { DIRECT_URL } from '$env/static/private';
import {
    type Distribution,
    type ActionTableTypeMap,
    type InputType,
    type ReturnType,
    type LauncherSystem,
    type ConstructorParams,
    type Information,
    type Banner,
    type User,
    type Character,
    type DistributionEditableItemType,
} from '$types';
import { getDistributionUpdatedValue, getInformationUpdatedValue } from '$utils/client';
import { BinaryManager } from '.';

// sql``はテキストのみもしくは変数を直接埋め込んでクエリを実行する際に使用。sql.unsafe()はクエリ（全体/一部に限らず）を変数に格納して実行する際やテーブル名/カラム名を動的に出力する際に使用

export class PostgresManager<O extends keyof ActionTableTypeMap, T extends keyof ActionTableTypeMap[O]> {
    private readonly action: O;
    private readonly table: T;
    private readonly object?: InputType<O, T>;
    private readonly sql = postgres(DIRECT_URL.substring(0, DIRECT_URL.indexOf('?schema=')));

    private readonly functionsMap: {
        [K in keyof ActionTableTypeMap]: {
            [U in keyof ActionTableTypeMap[K]]: (object: InputType<K, U>) => Promise<ReturnType<K, U>>;
        };
    } = {
        create: {
            distribution: this.createDistribution.bind(this),
            information: this.createInformation.bind(this),
        },
        delete: {
            distribution: this.deleteDistribution.bind(this),
            claimedDistributions: this.deleteClaimedDistributions.bind(this),
            distributions: this.deleteDistributions.bind(this),
            information: this.deleteInformation.bind(this),
        },
        get: {
            paginatedUsers: this.getPaginatedUsers.bind(this),
            authUser: this.getAuthUser.bind(this),
        },
        transactions: {
            initAdmin: this.initAdmin.bind(this),
        },
        update: {
            characterBinary: this.updateCharacterBinary.bind(this),
            information: this.updateInformation.bind(this),
            distribution: this.updateDistribution.bind(this),
        },
    };

    // 条件型を使用したコンストラクタ（第三引数が不要な場合とそうでない場合のサポートのため）
    constructor(...params: ConstructorParams<O, T>) {
        const [action, table, object] = params;
        this.action = action;
        this.table = table;
        this.object = object;
    }

    public async execute(): Promise<ReturnType<O, T>> {
        const executeActFunc = this.functionsMap[this.action];
        const executeFunc = executeActFunc[this.table];

        // 指定したアクションが有効かどうか、またそのアクション内で指定したテーブルがサポートされているか確認
        if (executeFunc) {
            return (await executeFunc(this.object as any)) as ReturnType<O, T>;
        } else {
            error(400, { message: '', message1: undefined, message2: [`Operation ${this.action} for table ${String(this.table)} isn't supported.`], message3: undefined });
        }
    }

    private async createDistribution(obj: InputType<'create', 'distribution'>): Promise<ReturnType<'create', 'distribution'>> {
        const [distribution] = await this.sql<
            Distribution[]
        >`INSERT INTO distribution (character_id, type, deadline, event_name, description, times_acceptable, min_hr, max_hr, min_gr, max_gr, data) VALUES (NULLIF(${obj.charId}, 0), ${obj.category}, ${obj.deadline}, ${obj.title}, ${obj.description}, ${obj.remaining}, ${obj.minHr}, ${obj.maxHr}, ${obj.minGr}, ${obj.maxGr}, decode(${obj.base64}, 'base64')) RETURNING id, character_id, type, deadline, event_name, description, times_acceptable, min_hr, max_hr, min_gr, max_gr, encode(data, 'hex') AS data`;

        return distribution;
    }

    private async deleteDistribution(obj: InputType<'delete', 'distribution'>): Promise<ReturnType<'delete', 'distribution'>> {
        const [distribution] = await this.sql<Pick<Distribution, 'event_name'>[]>`DELETE FROM distribution WHERE id = ${obj.deleteDistId} RETURNING event_name`;

        return distribution.event_name;
    }

    private async initAdmin(): Promise<ReturnType<'transactions', 'initAdmin'>> {
        const [launcherSystem, information, banners, distributions, charIdNamePair] = await this.sql.begin(async (sql) => {
            /* システム情報取得
            ========================================================= */
            const [launcherSystem] = await sql<LauncherSystem[]>`SELECT * FROM launcher_system WHERE id = 1`;

            /* お知らせ情報取得
            ========================================================= */
            const information = await sql<Information[]>`SELECT * FROM information ORDER BY id ASC`;

            /* バナー情報取得
            ========================================================= */
            const banners = await sql<Banner[]>`SELECT * FROM banner ORDER BY id ASC`;

            /* 配布情報取得
            ========================================================= */
            const distributions = await this.sql<
                Distribution[]
            >`SELECT id, character_id, type AS category, deadline, event_name, description, times_acceptable, min_hr, max_hr, min_sr, max_sr, min_gr, max_gr, encode(data, 'hex') AS data, CASE WHEN character_id IS NULL THEN 0 ELSE 1 END AS type FROM distribution`;

            /* キャラクターIDと名前のペア配列取得（DistributionList.svelteで使用）
            ========================================================= */
            const characters = await this.sql<Pick<Character, 'id' | 'name'>[]>`SELECT id, name FROM characters`;

            const charIdNamePair = characters.map((character) => {
                return `[${character.id}] ${character.name || 'Ready to Hunt'}`;
            });

            return [launcherSystem, information, banners, distributions, charIdNamePair];
        });

        return { launcherSystem, information, banners, distributions, charIdNamePair };
    }

    private async getPaginatedUsers(obj: InputType<'get', 'paginatedUsers'>): Promise<ReturnType<'get', 'paginatedUsers'>> {
        const { sql } = this;
        const binaryManager = new BinaryManager();

        /* ユーザー情報全体取得
        ========================================================= */
        // キャラクター名もしくはキャラクターIDで検索時、マッチしたユーザー全体情報を取得するため共通テーブル式を作成する
        const cte =
            obj.filterParam === 'character_name' || obj.filterParam === 'character_id'
                ? `WITH matched_users AS ( SELECT DISTINCT users.id FROM users LEFT JOIN characters ON users.id = characters.user_id WHERE ${obj.filterParam === 'character_name' ? `characters.name ILIKE '%${obj.filterValue}%'` : `characters.id = ${Number(obj.filterValue)}`} ),`
                : `WITH`;

        // 昇順キャラクターのメイン共通テーブル式（猟団データ、ディスコードデータ、受取済み配布データ取得）
        const withClause = `${cte} ordered_characters AS ( SELECT characters.id, characters.user_id, characters.is_female, characters.is_new_character, characters.name, characters.gr, characters.hrp, characters.weapon_type, characters.weapon_id, characters.last_login, characters.savedata, characters.deleted, discord.discord_id AS linked_discord_id, discord.bounty AS bounty_coin, guilds.id AS joined_clan_id, guilds.name AS joined_clan_name, (SELECT COUNT(*) FROM guild_characters WHERE guild_characters.guild_id = guilds.id) AS joined_clan_members, (SELECT JSON_AGG( JSON_BUILD_OBJECT( 'id', distribution.id, 'character_id', distribution.character_id, 'category', distribution.type, 'deadline', distribution.deadline, 'event_name', distribution.event_name, 'description', distribution.description, 'times_acceptable', distribution.times_acceptable, 'min_hr', distribution.min_hr, 'max_hr', distribution.max_hr, 'min_sr', distribution.min_sr, 'max_sr', distribution.max_sr, 'min_gr', distribution.min_gr, 'max_gr', distribution.max_gr, 'data', encode(distribution.data, 'hex'), 'type', CASE WHEN distribution.character_id IS NULL THEN 0 ELSE 1 END ) ORDER BY distribution.id ASC ) FROM distribution JOIN distributions_accepted ON distribution.id = distributions_accepted.distribution_id WHERE distributions_accepted.character_id = characters.id) AS claim_distribution FROM characters LEFT JOIN guild_characters ON characters.id = guild_characters.character_id LEFT JOIN guilds ON guild_characters.guild_id = guilds.id LEFT JOIN discord ON characters.id = discord.char_id ORDER BY characters.id ASC )`;

        // メインクエリ構築
        // charactersプロパティは、ordered_characters.idがNULLの場合（キャラクター未保有）、[null]が返る
        let query = `${withClause} SELECT users.id, users.username, users.password, users.rights, users.last_character, users.last_login, users.return_expires, users.gacha_premium, users.gacha_trial, users.frontier_points, users.psn_id, users.wiiu_key, users.web_login_key, users.web_login_key_mobile, COALESCE( JSON_AGG( CASE WHEN ordered_characters.id IS NOT NULL THEN JSON_BUILD_OBJECT( 'id', ordered_characters.id, 'is_female', ordered_characters.is_female, 'is_new_character', ordered_characters.is_new_character, 'name', ordered_characters.name, 'gr', ordered_characters.gr, 'hrp', ordered_characters.hrp, 'weapon_type', ordered_characters.weapon_type, 'weapon_id', ordered_characters.weapon_id, 'last_login', ordered_characters.last_login, 'savedata', encode(ordered_characters.savedata, 'hex'), 'deleted', ordered_characters.deleted, 'linked_discord_id', ordered_characters.linked_discord_id, 'bounty_coin', ordered_characters.bounty_coin, 'clan', JSON_BUILD_OBJECT( 'id', ordered_characters.joined_clan_id, 'name', ordered_characters.joined_clan_name, 'members', ordered_characters.joined_clan_members ), 'claim_distribution', ordered_characters.claim_distribution ) ELSE NULL END ), '[]'::json ) AS characters, CASE WHEN suspended_account.user_id IS NOT NULL THEN JSON_BUILD_OBJECT( 'is_suspended', true, 'username', suspended_account.username, 'user_id', suspended_account.user_id, 'reason', suspended_account.reason, 'until_at', suspended_account.until_at, 'permanent', suspended_account.permanent, 'other_reason', suspended_account.other_reason, 'by_whom', suspended_account.by_whom ) ELSE JSON_BUILD_OBJECT( 'is_suspended', false, 'username', NULL, 'user_id', NULL, 'reason', NULL, 'until_at', NULL, 'permanent', NULL, 'other_reason', NULL, 'by_whom', NULL ) END AS suspended_status FROM users LEFT JOIN ordered_characters ON users.id = ordered_characters.user_id LEFT JOIN suspended_account ON users.id = suspended_account.user_id`;

        // filterParamに基づいてWHERE句に条件追加
        let whereClauses = [];
        if (obj.filterParam === 'username') {
            whereClauses.push(`users.username ILIKE '%${obj.filterValue}%'`);
        } else if (obj.filterParam === 'character_name' || obj.filterParam === 'character_id') {
            whereClauses.push(`users.id IN (SELECT id FROM matched_users)`);
        } else if (obj.filterParam === 'user_id') {
            whereClauses.push(`users.id = ${Number(obj.filterValue)}`);
        }

        if (obj.cursor) {
            const operator = obj.status === 'back' ? '<' : '>';
            whereClauses.push(`users.id ${operator} ${obj.cursor}`);
        }

        if (whereClauses.length > 0) {
            query += ` WHERE ${whereClauses.join(' AND ')}`;
        }

        // GROUP BY句とORDER BY句追加
        query += ` GROUP BY users.id, users.username, users.password, users.rights, users.last_character, users.last_login, users.return_expires, users.gacha_premium, users.gacha_trial, users.frontier_points, users.psn_id, users.wiiu_key, users.web_login_key, users.web_login_key_mobile, suspended_account.username, suspended_account.user_id, suspended_account.reason, suspended_account.until_at, suspended_account.permanent, suspended_account.other_reason, suspended_account.by_whom ORDER BY users.id ASC`;

        // LIMIT句追加
        query += ` LIMIT 5`;

        const users = await sql.unsafe<User[]>(query);

        // playtimeプロパティ追加
        users.forEach((user) => {
            user.characters.forEach((character) => {
                // キャラクターを保有している場合のみ
                if (character) {
                    const playtime = binaryManager.getDataFromSavedata('playtime', character.savedata);
                    character.playtime = playtime;
                }
            });
        });

        /* ページネーションメタ情報取得
        ========================================================= */
        if (obj.filterParam === 'username' || obj.filterParam === 'character_name') {
            const firstUserId = users[0]?.id;
            const lastUserId = users[users.length - 1]?.id;

            const query = `WITH only_id_users AS ( SELECT users.id FROM users ${obj.filterParam === 'username' ? '' : 'LEFT JOIN characters ON users.id = characters.user_id'} WHERE ${obj.filterParam === 'username' ? 'users.username' : 'characters.name'} ILIKE '%${obj.filterValue}%' ORDER BY users.id ASC ), prev_and_next AS ( SELECT id, LAG(id) OVER (ORDER BY id) AS prev_id, LEAD(id) OVER (ORDER BY id) AS next_id FROM only_id_users ) SELECT JSON_BUILD_OBJECT( 'hasPrevPage', CASE WHEN EXISTS (SELECT 1 FROM prev_and_next WHERE id = ${firstUserId} AND prev_id IS NOT NULL) THEN true ELSE false END, 'hasNextPage', CASE WHEN EXISTS (SELECT 1 FROM prev_and_next WHERE id = ${lastUserId} AND next_id IS NOT NULL) THEN true ELSE false END ) AS result;`;

            const [pageData] = await sql.unsafe<{ result: { hasPrevPage: boolean; hasNextPage: boolean } }[]>(query);

            const meta = {
                hasPrevPage: pageData.result.hasPrevPage,
                hasNextPage: pageData.result.hasNextPage,
                prevCursor: firstUserId,
                nextCursor: lastUserId,
            };

            /* await sql`WITH only_id_users AS ( SELECT id FROM users WHERE username ILIKE '%${obj.filterValue}%' ORDER BY id ASC ), prev_and_next AS ( SELECT id, LAG(id) OVER (ORDER BY id) AS prev_id, LEAD(id) OVER (ORDER BY id) AS next_id FROM only_id_users ) SELECT JSON_BUILD_OBJECT( 'hasPrevPage', CASE WHEN EXISTS (SELECT 1 FROM prev_and_next WHERE id = ${firstUserId} AND prev_id IS NOT NULL) THEN true ELSE false END, 'hasNextPage', CASE WHEN EXISTS (SELECT 1 FROM prev_and_next WHERE id = ${lastUserId} AND next_id IS NOT NULL) THEN true ELSE false END ) AS result;`;

            await sql`WITH only_id_users AS ( SELECT users.id FROM users LEFT JOIN characters ON users.id = characters.user_id WHERE characters.name ILIKE '%${obj.filterValue}%' ORDER BY users.id ASC ), prev_and_next AS ( SELECT id, LAG(id) OVER (ORDER BY id) AS prev_id, LEAD(id) OVER (ORDER BY id) AS next_id FROM only_id_users ) SELECT JSON_BUILD_OBJECT( 'hasPrevPage', CASE WHEN EXISTS (SELECT 1 FROM prev_and_next WHERE id = ${firstUserId} AND prev_id IS NOT NULL) THEN true ELSE false END, 'hasNextPage', CASE WHEN EXISTS (SELECT 1 FROM prev_and_next WHERE id = ${lastUserId} AND next_id IS NOT NULL) THEN true ELSE false END ) AS result;`; */

            return { users, meta };
        } else {
            // idからレコード１つだけを取得する場合は、固定値
            const meta = {
                hasPrevPage: false,
                hasNextPage: false,
                prevCursor: 0,
                nextCursor: 0,
            };

            return { users, meta };
        }
    }

    private async updateCharacterBinary(obj: InputType<'update', 'characterBinary'>): Promise<ReturnType<'update', 'characterBinary'>> {
        const setClause = Object.entries(obj.binaryData)
            .map(([key, value]) => `${key} = decode('${Buffer.from(value).toString('base64')}', 'base64')`)
            .join(', ');

        const query = `UPDATE characters SET ${setClause} WHERE id = ${obj.charId}`;

        await this.sql.unsafe(query);

        /* 
        const isNull = {
            savedata: !binaryData.savedata ? 'NULL' : 'NOT_NULL',
            decomyset: !binaryData.decomyset ? 'NULL' : 'NOT_NULL',
            hunternavi: !binaryData.hunternavi ? 'NULL' : 'NOT_NULL',
            otomoairou: !binaryData.otomoairou ? 'NULL' : 'NOT_NULL',
            partner: !binaryData.partner ? 'NULL' : 'NOT_NULL',
            platebox: !binaryData.platebox ? 'NULL' : 'NOT_NULL',
            platedata: !binaryData.platedata ? 'NULL' : 'NOT_NULL',
            platemyset: !binaryData.platemyset ? 'NULL' : 'NOT_NULL',
            rengokudata: !binaryData.rengokudata ? 'NULL' : 'NOT_NULL',
            savemercenary: !binaryData.savemercenary ? 'NULL' : 'NOT_NULL',
            skin_hist: !binaryData.skin_hist ? 'NULL' : 'NOT_NULL',
            minidata: !binaryData.minidata ? 'NULL' : 'NOT_NULL',
            scenariodata: !binaryData.scenariodata ? 'NULL' : 'NOT_NULL',
            savefavoritequest: !binaryData.savefavoritequest ? 'NULL' : 'NOT_NULL',
        };

        await this
            .sql`UPDATE characters SET savedata = CASE ${isNull.savedata} WHEN 'NULL' THEN decode((SELECT encode(savedata, 'base64') FROM characters WHERE id = ${charId}), 'base64') WHEN 'NOT_NULL' THEN decode(${binaryData.savedata}, 'base64') END, decomyset = CASE ${isNull.decomyset} WHEN 'NULL' THEN decode((SELECT encode(decomyset, 'base64') FROM characters WHERE id = ${charId}), 'base64') WHEN 'NOT_NULL' THEN decode(${binaryData.decomyset}, 'base64') END, hunternavi = CASE ${isNull.hunternavi} WHEN 'NULL' THEN decode((SELECT encode(hunternavi, 'base64') FROM characters WHERE id = ${charId}), 'base64') WHEN 'NOT_NULL' THEN decode(${binaryData.hunternavi}, 'base64') END, otomoairou = CASE ${isNull.otomoairou} WHEN 'NULL' THEN decode((SELECT encode(otomoairou, 'base64') FROM characters WHERE id = ${charId}), 'base64') WHEN 'NOT_NULL' THEN decode(${binaryData.otomoairou}, 'base64') END, partner = CASE ${isNull.partner} WHEN 'NULL' THEN decode((SELECT encode(partner, 'base64') FROM characters WHERE id = ${charId}), 'base64') WHEN 'NOT_NULL' THEN decode(${binaryData.partner}, 'base64') END, platebox = CASE ${isNull.platebox} WHEN 'NULL' THEN decode((SELECT encode(platebox, 'base64') FROM characters WHERE id = ${charId}), 'base64') WHEN 'NOT_NULL' THEN decode(${binaryData.platebox}, 'base64') END, platedata = CASE ${isNull.platedata} WHEN 'NULL' THEN decode((SELECT encode(platedata, 'base64') FROM characters WHERE id = ${charId}), 'base64') WHEN 'NOT_NULL' THEN decode(${binaryData.platedata}, 'base64') END, platemyset = CASE ${isNull.platemyset} WHEN 'NULL' THEN decode((SELECT encode(platemyset, 'base64') FROM characters WHERE id = ${charId}), 'base64') WHEN 'NOT_NULL' THEN decode(${binaryData.platemyset}, 'base64') END, rengokudata = CASE ${isNull.rengokudata} WHEN 'NULL' THEN decode((SELECT encode(rengokudata, 'base64') FROM characters WHERE id = ${charId}), 'base64') WHEN 'NOT_NULL' THEN decode(${binaryData.rengokudata}, 'base64') END, savemercenary = CASE ${isNull.savemercenary} WHEN 'NULL' THEN decode((SELECT encode(savemercenary, 'base64') FROM characters WHERE id = ${charId}), 'base64') WHEN 'NOT_NULL' THEN decode(${binaryData.savemercenary}, 'base64') END, skin_hist = CASE ${isNull.skin_hist} WHEN 'NULL' THEN decode((SELECT encode(skin_hist, 'base64') FROM characters WHERE id = ${charId}), 'base64') WHEN 'NOT_NULL' THEN decode(${binaryData.skin_hist}, 'base64') END, minidata = CASE ${isNull.minidata} WHEN 'NULL' THEN decode((SELECT encode(minidata, 'base64') FROM characters WHERE id = ${charId}), 'base64') WHEN 'NOT_NULL' THEN decode(${binaryData.minidata}, 'base64') END, scenariodata = CASE ${isNull.scenariodata} WHEN 'NULL' THEN decode((SELECT encode(scenariodata, 'base64') FROM characters WHERE id = ${charId}), 'base64') WHEN 'NOT_NULL' THEN decode(${binaryData.scenariodata}, 'base64') END, savefavoritequest = CASE ${isNull.savefavoritequest} WHEN 'NULL' THEN decode((SELECT encode(savefavoritequest, 'base64') FROM characters WHERE id = ${charId}), 'base64') WHEN 'NOT_NULL' THEN decode(${binaryData.savefavoritequest}, 'base64') END WHERE id = ${charId}`;
        */
    }

    private async deleteClaimedDistributions(obj: InputType<'delete', 'claimedDistributions'>): Promise<ReturnType<'delete', 'claimedDistributions'>> {
        const [deletedDistribution] = await this.sql<
            { titles: string[] }[]
        >`WITH deleted_distributions AS ( DELETE FROM distributions_accepted WHERE character_id = ${obj.charId} AND distribution_id = ANY(${obj.deleteDistIds}::int[] ) RETURNING distribution_id ) SELECT ARRAY_AGG(distribution.event_name) AS titles FROM deleted_distributions JOIN distribution ON deleted_distributions.distribution_id = distribution.id`;

        return deletedDistribution.titles;
    }

    private async deleteDistributions(obj: InputType<'delete', 'distributions'>): Promise<ReturnType<'delete', 'distributions'>> {
        const [deletedDistribution] = await this.sql<
            { titles: string[] }[]
        >`WITH deleted AS ( DELETE FROM distribution WHERE id = ANY(${obj.deleteDistIds}::int[] ) RETURNING event_name ) SELECT ARRAY_AGG(event_name) AS titles FROM deleted`;

        return deletedDistribution.titles;
    }

    private async createInformation(obj: InputType<'create', 'information'>): Promise<ReturnType<'create', 'information'>> {
        const [information] = await this.sql<Information[]>`INSERT INTO information (title, url, type) VALUES (${obj.title}, ${obj.url}, ${obj.type}) RETURNING id, title, url, type, created_at`;

        return information;
    }

    private async updateInformation(obj: InputType<'update', 'information'>): Promise<ReturnType<'update', 'information'>> {
        /*
        updateDistribution用
        const columnMap: Record<string, string> = {
            category: 'type', // ウェブ上ではcategoryとして扱われているが、データベース内のカラム名はtype
        };

        const dbColumn = columnMap[obj.column] || obj.column;
        */

        const value = getInformationUpdatedValue(obj.column, obj.value);
        const formattedValue = typeof value === 'string' ? `'${value}'` : value; // 文字列の時のみシングルクォーテーションでワラップ

        const query = `UPDATE information SET ${obj.column} = ${formattedValue} WHERE id = ${obj.infoId}`; // カラム名を動的に出力するため、クエリはunsafe
        await this.sql.unsafe(query);
    }

    private async deleteInformation(obj: InputType<'delete', 'information'>): Promise<ReturnType<'delete', 'information'>> {
        const [deletedInformation] = await this.sql<
            { titles: string[] }[]
        >`WITH deleted AS ( DELETE FROM information WHERE id = ANY(${obj.deleteInfoIds}::int[] ) RETURNING title ) SELECT ARRAY_AGG(title) AS titles FROM deleted`;

        return deletedInformation.titles;
    }

    private async updateDistribution(obj: InputType<'update', 'distribution'>): Promise<ReturnType<'update', 'distribution'>> {
        const columnMap: Record<string, string> = {
            category: 'type', // ウェブ上ではcategoryとして扱われているが、データベース内のカラム名はtype
        };

        const dbColumn = (columnMap[obj.column] || obj.column) as DistributionEditableItemType;
        const value = getDistributionUpdatedValue(dbColumn, obj.value);
        const formattedValue = typeof value === 'string' ? (dbColumn === 'data' ? `decode('${Buffer.from(value, 'hex').toString('base64')}', 'base64')` : `'${value}'`) : value; // dataカラム以外で文字列の時のみシングルクォーテーションでワラップ

        const query = `UPDATE distribution SET ${dbColumn} = ${formattedValue} WHERE id = ${obj.distId}`; // カラム名を動的に出力するため、クエリはunsafe
        await this.sql.unsafe(query);
    }

    private async getAuthUser(obj: InputType<'get', 'authUser'>): Promise<ReturnType<'get', 'authUser'>> {
        const sql = `SELECT username FROM users WHERE CASE WHEN ${obj.isMobile} THEN web_login_key_mobile = '${obj.loginKey}' ELSE web_login_key = '${obj.loginKey}' END`;
        const [{ username }] = await this.sql.unsafe<{ username: string }[]>(sql);

        return username;
    }
}
