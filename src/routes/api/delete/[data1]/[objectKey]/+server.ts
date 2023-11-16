import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { json } from '@sveltejs/kit';

export const DELETE = async ({ params }) => {
    let { data1, objectKey } = params;
    data1 = `bnr_${data1}`;
    objectKey = `${objectKey}.png`

    const presignedUrl = await getSignedUrl(
        new S3Client({
            region: 'auto',
            endpoint: `https://${import.meta.env.VITE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com/bnr/${data1}`,
            credentials: {
                accessKeyId: import.meta.env.VITE_R2_ACCESS_KEY,
                secretAccessKey: import.meta.env.VITE_R2_SECRET_KEY,
            },
        }),
        new DeleteObjectCommand({
            Bucket: import.meta.env.VITE_R2_BNR_BUCKETNAME,
            Key: objectKey,
        })
    );

    return json({ presignedUrl, objectKey });
};