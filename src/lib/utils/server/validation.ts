export const checkBannerImage = async (file: File): Promise<{ success: boolean; error?: string }> => {
    const buffer = await file.arrayBuffer();
    const view = new DataView(buffer);

    // PNG シグネチャ確認
    const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
    const isPng = PNG_SIGNATURE.every((byte, i) => view.getUint8(i) === byte);

    if (!isPng) {
        return { success: false, error: 'Image format must be PNG.' };
    }

    // IHDR チャンク（バイト 16–23）から幅・高さを取得
    const width = view.getUint32(16, false); // big-endian
    const height = view.getUint32(20, false);

    if (width !== 515 || height !== 120) {
        return { success: false, error: `Image size must be 515x120.<br />Current width: ${width}, height: ${height}.` };
    }

    return { success: true };
};
