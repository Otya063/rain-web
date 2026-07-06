import postgres from 'postgres';
import { AsyncLocalStorage } from 'node:async_hooks';
import type { DatabaseConfig } from '$types';

const dbContext = new AsyncLocalStorage<ReturnType<typeof postgres>>();

/**
 * リクエスト単位でDB接続を生成し、そのリクエストの非同期コンテキスト内でのみ利用可能にする
 * Cloudflare Workersは異なるリクエスト間でI/Oオブジェクト（ソケット等）を共有できないため、
 * 接続をグローバルにキャッシュせず、リクエストごとに生成・破棄する
 *
 * @param config - データベース接続に必要な情報を含むオブジェクト
 * @param fn - このDB接続を使って実行する処理
 */
export const runWithDb = async <T>(config: DatabaseConfig, fn: () => Promise<T>): Promise<T> => {
    const sql = postgres({
        host: config.host,
        port: config.port,
        database: config.database,
        username: config.username,
        password: config.password,
    });

    try {
        return await dbContext.run(sql, fn);
    } finally {
        await sql.end();
    }
};

/**
 * 現在のリクエストのデータベース接続インスタンスを取得する
 *
 * @returns データベース接続インスタンス
 */
export const getDb = (): ReturnType<typeof postgres> => {
    const sql = dbContext.getStore();
    if (!sql) {
        throw new Error('DB is not initialized. Call runWithDb() first.');
    }

    return sql;
};
