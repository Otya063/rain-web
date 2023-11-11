import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { json } from '@sveltejs/kit';

export const POST = async ({ request, params }) => {
    let { data1 } = params;
    data1 = 'bnr_' + data1;

    const { fileName, fileType } = (await request.json()) as {
        fileName: string | undefined;
        fileType: string | undefined;
    };

    if (!fileName || !fileType || fileName.trim() === '' || fileType.trim() === '') {
        return json({ message: 'Missing required parameters.' }, { status: 400 });
    }

    const slugifyString = (str: string) => {
        return str.trim().toLowerCase();
    };

    const objectKey = slugifyString(fileName);

    const presignedUrl = await getSignedUrl(
        new S3Client({
            region: 'auto',
            endpoint: `https://${import.meta.env.VITE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com/bnr/${data1}`,
            credentials: {
                accessKeyId: import.meta.env.VITE_R2_ACCESS_KEY,
                secretAccessKey: import.meta.env.VITE_R2_SECRET_KEY,
            },
        }),
        new PutObjectCommand({
            Bucket: import.meta.env.VITE_R2_BNR_BUCKETNAME,
            Key: objectKey,
            ContentType: fileType,
            ACL: 'public-read',
        }),
        {
            expiresIn: 60 * 1,
        }
    );

    return json({ presignedUrl, objectKey });
};
