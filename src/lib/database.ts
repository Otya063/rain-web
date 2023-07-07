import { VITE_DATABASE_URL } from '$env/static/private';
import { PrismaClient } from '@prisma/client/edge';

export const db = new PrismaClient({
    datasources: {
        db: {
            url: VITE_DATABASE_URL,
        },
    },
});
