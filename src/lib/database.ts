import { PrismaClient } from '@prisma/client/edge';

export const db = new PrismaClient({
    datasources: {
        db: {
            url: import.meta.env.VITE_DATABASE_URL,
        },
    },
});
