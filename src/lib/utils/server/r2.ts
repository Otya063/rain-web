import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { R2_ACCESS_KEY, R2_SECRET_KEY, R2_ACCOUNT_ID } from '$env/static/private';

const R2_BNR_BUCKET = 'launcher-banner';

const getBannerR2Client = (lang: string): S3Client => {
    return new S3Client({
        region: 'auto',
        endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${lang}`,
        credentials: {
            accessKeyId: R2_ACCESS_KEY,
            secretAccessKey: R2_SECRET_KEY,
        },
    });
};

export const uploadBannerToR2 = async (file: File, lang: string): Promise<void> => {
    await getBannerR2Client(lang).send(
        new PutObjectCommand({
            Bucket: R2_BNR_BUCKET,
            Key: file.name.trim().toLowerCase(),
            ContentType: file.type,
            Body: new Uint8Array(await file.arrayBuffer()),
        }),
    );

    return;
};

export const deleteBannerFromR2 = async (fileName: string, lang: string): Promise<void> => {
    await getBannerR2Client(lang).send(
        new DeleteObjectCommand({
            Bucket: R2_BNR_BUCKET,
            Key: fileName,
        }),
    );

    return;
};
