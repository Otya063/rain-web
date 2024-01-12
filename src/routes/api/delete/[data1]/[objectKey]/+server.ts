import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { json } from '@sveltejs/kit';
import { R2_ACCESS_KEY, R2_SECRET_KEY, R2_ACCOUNT_ID, R2_BNR_BUCKETNAME } from "$env/static/private";

export const DELETE = async ({ params }) => {
    let { data1, objectKey } = params;
    data1 = `bnr_${data1}`;
    objectKey = `${objectKey}.png`

    const presignedUrl = await getSignedUrl(
        new S3Client({
            region: 'auto',
            endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/bnr/${data1}`,
            credentials: {
                accessKeyId: R2_ACCESS_KEY,
                secretAccessKey: R2_SECRET_KEY,
            },
        }),
        new DeleteObjectCommand({
            Bucket: R2_BNR_BUCKETNAME,
            Key: objectKey,
        })
    );

    return json({ presignedUrl, objectKey });
};
