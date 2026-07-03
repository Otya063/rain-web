import { error } from '@sveltejs/kit';
import { DateTime } from 'luxon';
import {
    type Distribution,
    type ActionTableTypeMap,
    type InputType,
    type ReturnType,
    type LauncherSystem,
    type ConstructorParams,
    type Banner,
    type User,
    type Character,
    type CharacterRaw,
    type DistributionEditableItemType,
    type PaginatedClans,
    type PaginatedAlliances,
} from '$types';
import { getDistributionUpdatedValue, encodeToShiftJIS } from '$utils/client';
import { BinaryManager, getDb } from '.';

// sql``はテキストのみもしくは変数を直接埋め込んでクエリを実行する際に使用。sql.unsafe()はクエリ（全体/一部に限らず）を変数に格納して実行する際やテーブル名/カラム名を動的に出力する際に使用

export class PostgresManager<O extends keyof ActionTableTypeMap, T extends keyof ActionTableTypeMap[O]> {
    private readonly action: O;
    private readonly table: T;
    private readonly object?: InputType<O, T>;
    private get sql() {
        return getDb(); // 必要な時に取得
    }

    private readonly functionsMap: {
        [K in keyof ActionTableTypeMap]: {
            [U in keyof ActionTableTypeMap[K]]: (object: InputType<K, U>) => Promise<ReturnType<K, U>>;
        };
    } = {
        create: {
            distribution: this.createDistribution.bind(this),
            // information: this.createInformation.bind(this),
            banner: this.createBanner.bind(this),
        },
        delete: {
            distribution: this.deleteDistribution.bind(this),
            claimedDistributions: this.deleteClaimedDistributions.bind(this),
            distributions: this.deleteDistributions.bind(this),
            // information: this.deleteInformation.bind(this),
            banner: this.deleteBanner.bind(this),
            users: this.deleteUsers.bind(this),
            character: this.deleteCharacter.bind(this),
            unlinkDiscord: this.unlinkDiscord.bind(this),
            deleteClans: this.deleteClans.bind(this),
            deleteAlliances: this.deleteAlliances.bind(this),
        },
        get: {
            paginatedUsers: this.getPaginatedUsers.bind(this),
            authUser: this.getAuthUser.bind(this),
            adminDiscordId: this.getAdminDiscordId.bind(this),
            character: this.getCharacterRaw.bind(this),
            paginatedClans: this.getPaginatedClans.bind(this),
            paginatedAlliances: this.getPaginatedAlliances.bind(this),
        },
        transactions: {
            initAdmin: this.initAdmin.bind(this),
        },
        update: {
            characterBinary: this.updateCharacterBinary.bind(this),
            // information: this.updateInformation.bind(this),
            distribution: this.updateDistribution.bind(this),
            banner: this.updateBanner.bind(this),
            charName: this.editName.bind(this),
            launcherSystem: this.updateLauncherSystem.bind(this),
            user: this.updateUser.bind(this),
            courseControl: this.updateCourseControl.bind(this),
            suspendUsers: this.suspendUsers.bind(this),
            unsuspendUsers: this.unsuspendUsers.bind(this),
            bounty: this.updateBounty.bind(this),
            leaveClan: this.leaveClan.bind(this),
            rebuildClans: this.rebuildClans.bind(this),
            restoreCharacter: this.restoreCharacter.bind(this),
            linkDiscord: this.linkDiscord.bind(this),
            allianceData: this.updateAllianceData.bind(this),
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
        >`INSERT INTO distribution (character_id, type, deadline, event_name, description, times_acceptable, min_hr, max_hr, min_gr, max_gr, data) VALUES (NULLIF(${obj.charId}, 0), ${obj.category}, ${obj.deadline}, ${obj.title}, ${obj.description}, ${obj.remaining}, ${obj.minHr}, ${obj.maxHr}, ${obj.minGr}, ${obj.maxGr}, decode(${obj.base64}, 'base64')) RETURNING id, character_id, type AS category, deadline, event_name, description, times_acceptable, min_hr, max_hr, min_sr, max_sr, min_gr, max_gr, encode(data, 'hex') AS data, CASE WHEN character_id IS NULL THEN 0 ELSE 1 END AS type`;

        return distribution;
    }

    private async deleteDistribution(obj: InputType<'delete', 'distribution'>): Promise<ReturnType<'delete', 'distribution'>> {
        const [distribution] = await this.sql<Pick<Distribution, 'event_name'>[]>`DELETE FROM distribution WHERE id = ${obj.deleteDistId} RETURNING event_name`;

        return distribution.event_name;
    }

    private async initAdmin(): Promise<ReturnType<'transactions', 'initAdmin'>> {
        const [launcherSystem, banners, distributions, charIdNamePair] = await this.sql.begin(async (sql) => {
            /* システム情報取得
            ========================================================= */
            const [launcherSystem] = await sql<LauncherSystem[]>`SELECT * FROM launcher_system WHERE id = 1`;

            /* お知らせ情報取得
            ========================================================= */
            // const information = await sql<Information[]>`SELECT * FROM information ORDER BY id ASC`;

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

            return [launcherSystem, banners, distributions, charIdNamePair];
        });

        return { launcherSystem, banners, distributions, charIdNamePair };
    }

    private async getPaginatedUsers(obj: InputType<'get', 'paginatedUsers'>): Promise<ReturnType<'get', 'paginatedUsers'>> {
        const { sql } = this;
        const binaryManager = new BinaryManager();

        // 検索条件に一致するユーザーIDのみ先に絞り込む CTE を動的に構築
        // これにより ordered_characters は対象ユーザーのキャラクターのみ処理する
        let filteredUsersCTE: string;
        const filterParams: (string | number)[] = [];

        if (obj.filterParam === 'character_name') {
            filteredUsersCTE = `SELECT DISTINCT characters.user_id AS id FROM characters WHERE characters.name ILIKE $1`;
            filterParams.push(`%${obj.filterValue}%`);
        } else if (obj.filterParam === 'character_id') {
            filteredUsersCTE = `SELECT DISTINCT characters.user_id AS id FROM characters WHERE characters.id = $1`;
            filterParams.push(Number(obj.filterValue));
        } else if (obj.filterParam === 'username') {
            filteredUsersCTE = `SELECT id FROM users WHERE username ILIKE $1`;
            filterParams.push(`%${obj.filterValue}%`);
        } else {
            filteredUsersCTE = `SELECT id FROM users WHERE id = $1`;
            filterParams.push(Number(obj.filterValue));
        }

        // メインクエリ構築
        // ordered_characters は JOIN filtered_user_ids により対象ユーザーのキャラクターのみ処理
        const query = `
        WITH filtered_user_ids AS (
            ${filteredUsersCTE}
        ),
        ordered_characters AS (
            SELECT
                characters.id, characters.user_id, characters.is_female, characters.is_new_character,
                characters.name, characters.gr, characters.hrp, characters.weapon_type, characters.weapon_id,
                characters.last_login, encode(characters.savedata, 'hex') AS savedata, characters.deleted,
                discord.discord_id AS linked_discord_id, discord.bounty AS bounty_coin,
                guilds.id AS joined_clan_id, guilds.name AS joined_clan_name,
                clan_size.joined_clan_members,
                json_agg(
                    CASE
                        WHEN distribution.id IS NOT NULL THEN json_build_object(
                            'id', distribution.id, 'character_id', distribution.character_id,
                            'category', distribution.type, 'deadline', distribution.deadline,
                            'event_name', distribution.event_name, 'description', distribution.description,
                            'times_acceptable', distribution.times_acceptable, 'min_hr', distribution.min_hr,
                            'max_hr', distribution.max_hr, 'min_sr', distribution.min_sr, 'max_sr', distribution.max_sr,
                            'min_gr', distribution.min_gr, 'max_gr', distribution.max_gr,
                            'data', encode(distribution.data, 'hex'), 'type',
                            CASE WHEN distribution.character_id IS NULL THEN 0 ELSE 1 END
                        )
                        ELSE NULL
                    END
                ) FILTER (WHERE distribution.id IS NOT NULL) AS claim_distribution
            FROM characters
            JOIN filtered_user_ids ON characters.user_id = filtered_user_ids.id
            LEFT JOIN guild_characters ON characters.id = guild_characters.character_id
            LEFT JOIN guilds ON guild_characters.guild_id = guilds.id
            LEFT JOIN (
                SELECT guild_id, COUNT(*) AS joined_clan_members
                FROM guild_characters
                GROUP BY guild_id
            ) clan_size ON clan_size.guild_id = guilds.id
            LEFT JOIN discord ON characters.id = discord.char_id
            LEFT JOIN distributions_accepted ON characters.id = distributions_accepted.character_id
            LEFT JOIN distribution ON distributions_accepted.distribution_id = distribution.id
            GROUP BY characters.id, discord.discord_id, discord.bounty, guilds.id, guilds.name, clan_size.joined_clan_members
        )
        SELECT
            users.id, users.username, users.password, users.rights, users.last_character,
            users.last_login, users.return_expires, users.gacha_premium, users.gacha_trial,
            users.frontier_points, users.psn_id, users.wiiu_key, users.web_login_key,
            users.web_login_key_mobile,
            COALESCE(json_agg(
                CASE WHEN ordered_characters.id IS NOT NULL THEN json_build_object(
                    'id', ordered_characters.id, 'is_female', ordered_characters.is_female,
                    'is_new_character', ordered_characters.is_new_character, 'name', ordered_characters.name,
                    'gr', ordered_characters.gr, 'hrp', ordered_characters.hrp,
                    'weapon_type', ordered_characters.weapon_type, 'weapon_id', ordered_characters.weapon_id,
                    'last_login', ordered_characters.last_login, 'savedata', ordered_characters.savedata,
                    'deleted', ordered_characters.deleted, 'linked_discord_id', ordered_characters.linked_discord_id,
                    'bounty_coin', ordered_characters.bounty_coin,
                    'clan', json_build_object(
                        'id', ordered_characters.joined_clan_id,
                        'name', ordered_characters.joined_clan_name,
                        'members', ordered_characters.joined_clan_members
                    ),
                    'claim_distribution', ordered_characters.claim_distribution
                ) ELSE NULL END
            ), '[]'::json) AS characters,
            json_build_object(
                'is_suspended', CASE WHEN suspended_account.user_id IS NOT NULL THEN true ELSE false END,
                'username', suspended_account.username,
                'user_id', suspended_account.user_id,
                'reason', suspended_account.reason,
                'until_at', suspended_account.until_at,
                'permanent', suspended_account.permanent,
                'other_reason', suspended_account.other_reason,
                'by_whom', suspended_account.by_whom,
                'by_whom_username', suspend_admin.username
            ) AS suspended_status
        FROM users
        JOIN filtered_user_ids ON users.id = filtered_user_ids.id
        LEFT JOIN ordered_characters ON users.id = ordered_characters.user_id
        LEFT JOIN suspended_account ON users.id = suspended_account.user_id
        LEFT JOIN users AS suspend_admin ON suspend_admin.id = suspended_account.by_whom
        GROUP BY users.id, suspended_account.username, suspended_account.user_id, suspended_account.reason,
                 suspended_account.until_at, suspended_account.permanent, suspended_account.other_reason,
                 suspended_account.by_whom, suspend_admin.username
        ORDER BY users.id ASC
        `;

        const searchedUsers = await sql.unsafe<User[]>(query, filterParams);
        if (searchedUsers.length >= 1000) {
            // 1000件以上のデータ
            return [null];
        }

        // playtimeプロパティ追加
        searchedUsers.forEach((user) => {
            user.characters.forEach((character) => {
                if (character) {
                    const playtime = binaryManager.getDataFromSavedata('playtime', character.savedata);
                    character.playtime = playtime;
                }
            });
        });

        return searchedUsers;
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

    // private async createInformation(obj: InputType<'create', 'information'>): Promise<ReturnType<'create', 'information'>> {
    //     const [information] = await this.sql<Information[]>`INSERT INTO information (title, url, type) VALUES (${obj.title}, ${obj.url}, ${obj.type}) RETURNING id, title, url, type, created_at`;

    //     return information;
    // }

    // private async updateInformation(obj: InputType<'update', 'information'>): Promise<ReturnType<'update', 'information'>> {
    //     const value = getInformationUpdatedValue(obj.column, obj.value);
    //     const formattedValue = typeof value === 'string' ? `'${value}'` : value; // 文字列の時のみシングルクォーテーションでワラップ

    //     const query = `UPDATE information SET ${obj.column} = ${formattedValue} WHERE id = ${obj.infoId}`; // カラム名を動的に出力するため、クエリはunsafe
    //     await this.sql.unsafe(query);
    // }

    // private async deleteInformation(obj: InputType<'delete', 'information'>): Promise<ReturnType<'delete', 'information'>> {
    //     const [deletedInformation] = await this.sql<
    //         { titles: string[] }[]
    //     >`WITH deleted AS ( DELETE FROM information WHERE id = ANY(${obj.deleteInfoIds}::int[] ) RETURNING title ) SELECT ARRAY_AGG(title) AS titles FROM deleted`;

    //     return deletedInformation.titles;
    // }

    private async updateDistribution(obj: InputType<'update', 'distribution'>): Promise<ReturnType<'update', 'distribution'>> {
        const columnMap: Record<string, string> = {
            category: 'type', // ウェブ上ではcategoryとして扱われているが、データベース内のカラム名はtype
        };

        const dbColumn = (columnMap[obj.column] || obj.column) as DistributionEditableItemType;
        const value = getDistributionUpdatedValue(dbColumn, obj.value);

        if (dbColumn === 'data') {
            const base64 = Buffer.from(value as string, 'hex').toString('base64');
            await this.sql.unsafe(`UPDATE distribution SET ${dbColumn} = decode($1, 'base64') WHERE id = $2`, [base64, obj.distId]);
        } else {
            await this.sql.unsafe(`UPDATE distribution SET ${dbColumn} = $1 WHERE id = $2`, [value, obj.distId]);
        }

        return;
    }

    private async getAuthUser(obj: InputType<'get', 'authUser'>): Promise<ReturnType<'get', 'authUser'>> {
        const sql = `SELECT id, username FROM users WHERE CASE WHEN ${obj.isMobile} THEN web_login_key_mobile = '${obj.loginKey}' ELSE web_login_key = '${obj.loginKey}' END`;
        const [row] = await this.sql.unsafe<{ id: number; username: string }[]>(sql);

        return row ?? null;
    }

    private async getAdminDiscordId(obj: InputType<'get', 'adminDiscordId'>): Promise<ReturnType<'get', 'adminDiscordId'>> {
        const [row] = await this.sql<{ discord_id: string }[]>`
            SELECT dr.discord_id FROM discord_register dr
            JOIN users u ON u.id = dr.user_id
            WHERE u.username = ${obj.username}
        `;

        return row?.discord_id ?? null;
    }

    private async getCharacterRaw(obj: InputType<'get', 'character'>): Promise<ReturnType<'get', 'character'>> {
        const [character] = await this.sql<CharacterRaw[]>`
            SELECT name, savedata, decomyset, hunternavi, otomoairou, partner, platebox,
                   platedata, platemyset, rengokudata, savemercenary, skin_hist,
                   scenariodata, savefavoritequest
            FROM characters WHERE id = ${obj.charId}
        `;

        return character ?? null;
    }

    private async getPaginatedClans(obj: InputType<'get', 'paginatedClans'>): Promise<ReturnType<'get', 'paginatedClans'>> {
        const { sql } = this;

        const filterParams: (string | number)[] = [];
        let filteredClansCTE: string;

        if (obj.filterParam === 'clan_name') {
            filteredClansCTE = `SELECT id FROM guilds WHERE name ILIKE $1`;
            filterParams.push(`%${obj.filterValue}%`);
        } else {
            filteredClansCTE = `SELECT id FROM guilds WHERE id = $1`;
            filterParams.push(Number(obj.filterValue));
        }

        const query = `
        WITH filtered_clans AS (
            ${filteredClansCTE}
        ),
        clan_members AS (
            SELECT
                gc.guild_id,
                json_agg(
                    json_build_object(
                        'order_index', gc.order_index,
                        'characters', CASE
                            WHEN c.id IS NOT NULL THEN json_build_object('id', c.id, 'name', c.name, 'hrp', c.hrp, 'gr', c.gr)
                            ELSE NULL
                        END
                    ) ORDER BY gc.order_index
                ) AS guild_characters
            FROM guild_characters gc
            JOIN filtered_clans fc ON gc.guild_id = fc.id
            LEFT JOIN characters c ON gc.character_id = c.id
            GROUP BY gc.guild_id
        )
        SELECT
            g.id,
            g.name,
            g.created_at,
            g.leader_id,
            l.name AS leader_name,
            COALESCE(cm.guild_characters, '[]'::json) AS guild_characters
        FROM guilds g
        JOIN filtered_clans fc ON g.id = fc.id
        LEFT JOIN characters l ON g.leader_id = l.id
        LEFT JOIN clan_members cm ON g.id = cm.guild_id
        ORDER BY g.id ASC
        `;

        const clans = await sql.unsafe<PaginatedClans[]>(query, filterParams);

        if (clans.length >= 1000) {
            return [null];
        }

        return clans;
    }

    private async getPaginatedAlliances(obj: InputType<'get', 'paginatedAlliances'>): Promise<ReturnType<'get', 'paginatedAlliances'>> {
        const { sql } = this;

        const filterParams: (string | number)[] = [];
        let filterCondition: string;

        if (obj.filterParam === 'alliance_name') {
            filterCondition = `ga.name ILIKE $1`;
            filterParams.push(`%${obj.filterValue}%`);
        } else {
            filterCondition = `ga.id = $1`;
            filterParams.push(Number(obj.filterValue));
        }

        const query = `
        SELECT
            ga.id,
            ga.name,
            ga.created_at,
            ga.parent_id,
            ga.sub1_id,
            ga.sub2_id,
            p.name AS "parentClan",
            s1.name AS "firstChildClan",
            s2.name AS "secondChildClan"
        FROM guild_alliances ga
        LEFT JOIN guilds p ON ga.parent_id = p.id
        LEFT JOIN guilds s1 ON ga.sub1_id = s1.id
        LEFT JOIN guilds s2 ON ga.sub2_id = s2.id
        WHERE ${filterCondition}
        ORDER BY ga.id ASC
        `;

        const alliances = await sql.unsafe<PaginatedAlliances[]>(query, filterParams);

        if (alliances.length >= 1000) {
            return { alliances: [null], clanNames: [] };
        }

        const guilds = await sql<{ id: number; name: string | null }[]>`SELECT id, name FROM guilds ORDER BY id ASC`;
        const clanNames = guilds.map((g) => `[${g.id}] - ${g.name ?? ''}`);

        return { alliances, clanNames };
    }

    private async createBanner(obj: InputType<'create', 'banner'>): Promise<ReturnType<'create', 'banner'>> {
        const [banner] = await this.sql<
            Banner[]
        >`INSERT INTO banner (bnr_name, bnr_url, ja_img_src, en_img_src) VALUES (${obj.bnrName}, ${obj.bnrUrl}, ${obj.jaImgSrc}, ${obj.enImgSrc}) RETURNING id, bnr_name, bnr_url, ja_img_src, en_img_src`;

        return banner;
    }

    private async updateBanner(obj: InputType<'update', 'banner'>): Promise<ReturnType<'update', 'banner'>> {
        await this.sql`UPDATE banner SET bnr_url = ${obj.value} WHERE id = ${obj.bnrId}`;
    }

    private async deleteBanner(obj: InputType<'delete', 'banner'>): Promise<ReturnType<'delete', 'banner'>> {
        await this.sql`DELETE FROM banner WHERE id = ANY(${obj.deleteBnrIds}::int[] )`;
    }

    private async editName(input: InputType<'update', 'charName'>): Promise<ReturnType<'update', 'charName'>> {
        const { charId, newName, bountyCoin } = input;

        const [{ isLogin }] = await this.sql<{ isLogin: boolean }[]>`
            SELECT EXISTS(SELECT 1 FROM sign_sessions WHERE char_id = ${charId}) AS isLogin
        `;
        if (isLogin) {
            return { success: false, message: "Can't be processed while the target character is logged in." };
        }

        const nameBuffer = Buffer.from(new Uint8Array(encodeToShiftJIS(newName)));
        if (nameBuffer.toString('hex').length > 24 || nameBuffer.toString('hex').length === 0) {
            return { success: false, message: 'Character name must be 1-12 characters (1-6 characters in Japanese).' };
        }

        const paddedNameBuffer = Buffer.alloc(24);
        nameBuffer.copy(paddedNameBuffer);

        const rows = await this.sql`SELECT savedata FROM characters WHERE id = ${charId} LIMIT 1`;
        const savedata = rows[0]?.savedata as Buffer<ArrayBufferLike> | null | undefined;
        if (!savedata) {
            return { success: false, message: 'Savedata not found.' };
        }

        const base64 = new BinaryManager().exportEditedSavedata('name', savedata, paddedNameBuffer);

        await this.sql.begin(async (sql) => {
            await sql`
                UPDATE characters
                SET savedata = decode(${base64}, 'base64'),
                    name = ${newName}
                WHERE id = ${charId}
            `;

            await sql`
                UPDATE discord
                SET bounty = ${bountyCoin - 50000}
                WHERE char_id = ${charId}
            `;
        });

        return { success: true, message: '' };
    }

    private async updateUser(obj: InputType<'update', 'user'>): Promise<ReturnType<'update', 'user'>> {
        await this.sql.unsafe(`UPDATE users SET "${obj.column}" = $1 WHERE id = $2`, [obj.value, obj.id]);
    }

    private async updateCourseControl(obj: InputType<'update', 'courseControl'>): Promise<ReturnType<'update', 'courseControl'>> {
        if (obj.userIds?.length) {
            await this.sql`UPDATE users SET rights = ${obj.rights} WHERE id = ANY(${obj.userIds}::int[])`;
        } else {
            await this.sql`UPDATE users SET rights = ${obj.rights}`;
        }
    }

    private async updateLauncherSystem(obj: InputType<'update', 'launcherSystem'>): Promise<ReturnType<'update', 'launcherSystem'>> {
        const { column, value } = obj;

        if (column === 'maint_all') {
            const boolValue = value === 'true';
            await this.sql`UPDATE launcher_system SET "RainJP" = ${boolValue}, "RainUS" = ${boolValue}, "RainEU" = ${boolValue} WHERE id = 1`;
        } else {
            await this.sql`UPDATE launcher_system SET ${this.sql(column)} = ${value === 'true'} WHERE id = 1`;
        }
    }

    private async deleteUsers(obj: InputType<'delete', 'users'>): Promise<ReturnType<'delete', 'users'>> {
        const charRows = await this.sql<{ id: number }[]>`SELECT id FROM characters WHERE user_id = ANY(${obj.userIds}::int[])`;
        const charIds = charRows.map((r) => r.id);

        if (charIds.length) {
            const sessions = await this.sql<{ char_id: number }[]>`SELECT char_id FROM sign_sessions WHERE char_id = ANY(${charIds}::int[])`;
            const loggedInIds = sessions.map((s) => s.char_id);

            if (loggedInIds.length) {
                throw new Error(`Couldn't process because all characters haven't logged out.<br />Logged-In Character's ID: ${loggedInIds}`);
            }
        }

        await this.sql`DELETE FROM users WHERE id = ANY(${obj.userIds}::int[])`;
    }

    private async unsuspendUsers(obj: InputType<'update', 'unsuspendUsers'>): Promise<ReturnType<'update', 'unsuspendUsers'>> {
        await this.sql.begin(async (sql) => {
            await sql`UPDATE characters SET deleted = false WHERE user_id = ANY(${obj.userIds}::int[])`;
            await sql`DELETE FROM suspended_account WHERE user_id = ANY(${obj.userIds}::int[])`;
        });
    }

    private async updateBounty(obj: InputType<'update', 'bounty'>): Promise<ReturnType<'update', 'bounty'>> {
        await this.sql`UPDATE discord SET bounty = ${obj.amount} WHERE char_id = ${obj.charId}`;
    }

    private async leaveClan(obj: InputType<'update', 'leaveClan'>): Promise<ReturnType<'update', 'leaveClan'>> {
        if (obj.isLastMember) {
            await this.sql`DELETE FROM guilds WHERE id = ${obj.clanId}`;
        } else {
            await this.sql`DELETE FROM guild_characters WHERE character_id = ${obj.charId}`;
        }
    }

    private async deleteCharacter(obj: InputType<'delete', 'character'>): Promise<ReturnType<'delete', 'character'>> {
        if (obj.permanent) {
            await this.sql.begin(async (sql) => {
                const [discordRow] = await sql<{ discord_id: string | null }[]>`
                    SELECT discord_id FROM discord WHERE char_id = ${obj.charId}
                `;
                await sql`DELETE FROM characters WHERE id = ${obj.charId}`;
                if (discordRow?.discord_id) {
                    await sql`DELETE FROM discord_register WHERE discord_id = ${discordRow.discord_id}`;
                }
            });
        } else {
            await this.sql`UPDATE characters SET deleted = true WHERE id = ${obj.charId}`;
        }
    }

    private async rebuildClans(obj: InputType<'update', 'rebuildClans'>): Promise<ReturnType<'update', 'rebuildClans'>> {
        const { sql } = this;
        const { clanIds } = obj;

        type GuildRow = {
            id: number;
            name: string | null;
            leader_id: number;
            main_motto: number | null;
            rank_rp: number;
            comment: string | null;
            icon: Buffer | null;
            sub_motto: number | null;
            item_box: Buffer | null;
            event_rp: number;
            pugi_name_1: string | null;
            pugi_name_2: string | null;
            pugi_name_3: string | null;
            recruiting: boolean;
            pugi_outfit_1: number | null;
            pugi_outfit_2: number | null;
            pugi_outfit_3: number | null;
            pugi_outfits: number | null;
            tower_mission_page: number | null;
            tower_rp: number | null;
        };

        // 全対象クランのキャラクターIDを一括取得してログインチェック
        const charRows = await sql<{ character_id: number }[]>`
            SELECT character_id FROM guild_characters WHERE guild_id = ANY(${clanIds}::int[])
        `;
        const charIds = charRows.map((r) => r.character_id);
        if (charIds.length) {
            const sessions = await sql<{ char_id: number }[]>`
                SELECT char_id FROM sign_sessions WHERE char_id = ANY(${charIds}::int[])
            `;
            if (sessions.length) {
                throw new Error(`Couldn't process because all characters haven't logged out.<br />Logged-In Character's ID: ${sessions.map((s) => s.char_id).join(', ')}`);
            }
        }

        // 各クランを順次リビルド（各クランをトランザクションで保護）
        const results: { oldId: number; newId: number; name: string | null }[] = [];

        for (const clanId of clanIds) {
            const result = await sql.begin(async (sql) => {
                const [origin] = await sql<GuildRow[]>`SELECT * FROM guilds WHERE id = ${clanId}`;
                if (!origin) {
                    throw new Error(`No clan data found for ID: ${clanId}.`);
                }

                const oneDayLater = new Date(Date.now() + 24 * 60 * 60 * 1000);

                const [{ id: newId }] = await sql<{ id: number }[]>`
                    WITH inserted AS (
                        INSERT INTO guilds (name, created_at, leader_id, main_motto, rank_rp, comment, icon, sub_motto, item_box, event_rp, pugi_name_1, pugi_name_2, pugi_name_3, recruiting, pugi_outfit_1, pugi_outfit_2, pugi_outfit_3, pugi_outfits, tower_mission_page, tower_rp)
                        VALUES (${origin.name}, ${new Date()}, ${origin.leader_id}, ${origin.main_motto}, ${origin.rank_rp}, ${origin.comment}, ${origin.icon}, ${origin.sub_motto}, ${origin.item_box}, ${origin.event_rp}, ${origin.pugi_name_1}, ${origin.pugi_name_2}, ${origin.pugi_name_3}, ${origin.recruiting}, ${origin.pugi_outfit_1}, ${origin.pugi_outfit_2}, ${origin.pugi_outfit_3}, ${origin.pugi_outfits}, ${origin.tower_mission_page}, ${origin.tower_rp})
                        RETURNING id
                    ) SELECT id FROM inserted
                `;

                await sql`UPDATE guild_characters SET guild_id = ${newId}, joined_at = ${oneDayLater} WHERE guild_id = ${clanId}`;
                await sql`DELETE FROM guilds WHERE id = ${clanId}`;

                return { oldId: clanId, newId, name: origin.name };
            });

            results.push(result);
        }

        return results;
    }

    private async deleteClans(obj: InputType<'delete', 'deleteClans'>): Promise<ReturnType<'delete', 'deleteClans'>> {
        const { sql } = this;
        const { clanIds } = obj;

        await sql.begin(async (sql) => {
            await sql`DELETE FROM guild_characters WHERE guild_id = ANY(${clanIds}::int[])`;
            await sql`DELETE FROM guilds WHERE id = ANY(${clanIds}::int[])`;
            await sql`DELETE FROM guild_alliances WHERE parent_id = ANY(${clanIds}::int[])`;
            // sub1が削除対象 → sub2をsub1に繰り上げ。sub2も削除対象なら両方NULL
            await sql`
                UPDATE guild_alliances
                SET sub1_id = CASE WHEN sub2_id = ANY(${clanIds}::int[]) THEN NULL ELSE sub2_id END,
                    sub2_id = NULL
                WHERE sub1_id = ANY(${clanIds}::int[])
            `;
            // sub2が削除対象（sub1は対象外のケース、上のUPDATE後に残るもの）
            await sql`UPDATE guild_alliances SET sub2_id = NULL WHERE sub2_id = ANY(${clanIds}::int[])`;
        });
    }

    private async restoreCharacter(obj: InputType<'update', 'restoreCharacter'>): Promise<ReturnType<'update', 'restoreCharacter'>> {
        await this.sql`UPDATE characters SET deleted = false WHERE id = ${obj.charId}`;
    }

    private async linkDiscord(obj: InputType<'update', 'linkDiscord'>): Promise<ReturnType<'update', 'linkDiscord'>> {
        const { userId, charId, discordId } = obj;

        const [existingUserLink] = await this.sql<{ discord_id: string }[]>`
            SELECT discord_id FROM discord_register WHERE user_id = ${userId}
        `;
        if (existingUserLink && existingUserLink.discord_id !== discordId) {
            throw new Error('This user account is already linked to another discord account.<br />Linked data can only be transferred between characters with the same discord ID (account).');
        }

        await this.sql.begin(async (sql) => {
            const [existingRegister] = await sql<{ id: number }[]>`
                SELECT id FROM discord_register WHERE discord_id = ${discordId}
            `;
            if (existingRegister) {
                await sql`UPDATE discord_register SET user_id = ${userId} WHERE discord_id = ${discordId}`;
            } else {
                await sql`INSERT INTO discord_register (user_id, discord_id) VALUES (${userId}, ${discordId})`;
            }

            const [existingDiscord] = await sql<{ id: number }[]>`
                SELECT id FROM discord WHERE discord_id = ${discordId}
            `;
            if (existingDiscord) {
                await sql`UPDATE discord SET char_id = ${charId} WHERE discord_id = ${discordId}`;
            } else {
                await sql`INSERT INTO discord (char_id, discord_id) VALUES (${charId}, ${discordId})`;
            }
        });
    }

    private async updateAllianceData(obj: InputType<'update', 'allianceData'>): Promise<ReturnType<'update', 'allianceData'>> {
        const { sql } = this;
        const { allianceId, sub1Id, sub2Id } = obj;

        const [clan1Check, clan2Check] = await Promise.all([
            sql<{ id: number; name: string }[]>`
                SELECT id, name FROM guild_alliances
                WHERE parent_id = ${sub1Id} OR sub1_id = ${sub1Id} OR sub2_id = ${sub1Id}
                LIMIT 1
            `,
            sub2Id !== null
                ? sql<{ id: number; name: string }[]>`
                    SELECT id, name FROM guild_alliances
                    WHERE parent_id = ${sub2Id} OR sub1_id = ${sub2Id} OR sub2_id = ${sub2Id}
                    LIMIT 1
                  `
                : Promise.resolve<{ id: number; name: string }[]>([]),
        ]);

        if (clan1Check[0] && clan1Check[0].id !== allianceId) {
            throw new Error(`The selected 1st clan has already joined the alliance (Name: ${clan1Check[0].name}).`);
        }

        if (clan2Check[0] && clan2Check[0].id !== allianceId) {
            throw new Error(`The selected 2nd clan has already joined the alliance (Name: ${clan2Check[0].name}).`);
        }

        await sql`UPDATE guild_alliances SET sub1_id = ${sub1Id}, sub2_id = ${sub2Id} WHERE id = ${allianceId}`;
    }

    private async deleteAlliances(obj: InputType<'delete', 'deleteAlliances'>): Promise<ReturnType<'delete', 'deleteAlliances'>> {
        await this.sql`DELETE FROM guild_alliances WHERE id = ANY(${obj.allianceIds}::int[])`;
    }

    private async unlinkDiscord(obj: InputType<'delete', 'unlinkDiscord'>): Promise<ReturnType<'delete', 'unlinkDiscord'>> {
        await this.sql.begin(async (sql) => {
            await sql`DELETE FROM discord WHERE discord_id = ${obj.discordId}`;
            await sql`DELETE FROM discord_register WHERE discord_id = ${obj.discordId}`;
        });
    }

    private async suspendUsers(obj: InputType<'update', 'suspendUsers'>): Promise<ReturnType<'update', 'suspendUsers'>> {
        const { entries, zoneName, byWhom } = obj;

        const records = entries.map(({ userId, username, reasonType, permanent, untilAt, otherReason }) => ({
            user_id: userId,
            username,
            reason: reasonType,
            until_at: permanent ? DateTime.utc(9999, 1, 1).toISO()! : DateTime.fromISO(String(untilAt), { zone: zoneName }).toString()!,
            permanent,
            other_reason: otherReason ?? null,
            by_whom: byWhom,
        }));

        const permanentIds = entries.filter((e) => e.permanent).map((e) => e.userId);
        const tempIds = entries.filter((e) => !e.permanent).map((e) => e.userId);

        await this.sql.begin(async (sql) => {
            await sql`INSERT INTO suspended_account ${sql(records, 'user_id', 'username', 'reason', 'until_at', 'permanent', 'other_reason', 'by_whom')}`;

            if (permanentIds.length > 0) {
                await sql`DELETE FROM characters WHERE user_id = ANY(${permanentIds}::int[])`;
                await sql`DELETE FROM discord_register WHERE user_id = ANY(${permanentIds}::int[])`;
            }

            if (tempIds.length > 0) {
                await sql`UPDATE characters SET deleted = true WHERE user_id = ANY(${tempIds}::int[])`;
            }
        });
    }
}
