import JSZip from 'jszip';
import type { RequestHandler } from '@sveltejs/kit';
import { PostgresManager } from '$utils/server';

// nodebufferはcloudflare未対応。arraybufferはWeb標準のためcloudflareでも使用可能
export const GET: RequestHandler = async ({ params }) => {
    const charId = Number(params.id);
    if (isNaN(charId)) {
        return new Response('Invalid character ID', { status: 400 });
    }

    let character;
    try {
        character = await new PostgresManager('get', 'character', { charId }).execute();
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unexpected Error';
        return new Response(message, { status: 500 });
    }
    
    if (!character) {
        return new Response(new Uint8Array(), {
            headers: {
                'Content-Type': 'application/zip',
                'Content-Disposition': 'attachment; filename="empty.zip"',
            },
        });
    }

    const zip = new JSZip();

    const addFile = (filename: string, data: Uint8Array | null) => {
        if (data && data.length > 0) {
            zip.file(filename, data);
        }
    };

    addFile('savedata.bin', character.savedata);
    addFile('decomyset.bin', character.decomyset);
    addFile('hunternavi.bin', character.hunternavi);
    addFile('otomoairou.bin', character.otomoairou);
    addFile('partner.bin', character.partner);
    addFile('platebox.bin', character.platebox);
    addFile('platedata.bin', character.platedata);
    addFile('platemyset.bin', character.platemyset);
    addFile('rengokudata.bin', character.rengokudata);
    addFile('savemercenary.bin', character.savemercenary);
    addFile('minidata.bin', character.minidata);
    addFile('skin_hist.bin', character.skin_hist);
    addFile('scenariodata.bin', character.scenariodata);
    addFile('savefavoritequest.bin', character.savefavoritequest);

    const zipData = await zip.generateAsync({ type: 'arraybuffer' });

    const safeName = (character.name || 'unknown').replace(/[^\x00-\x7F]/g, '_');
    const encodedName = encodeURIComponent(character.name || 'unknown');

    return new Response(zipData, {
        headers: {
            'Content-Type': 'application/zip',
            'Content-Disposition': `attachment; filename="${safeName}_binary.zip"; filename*=UTF-8''${encodedName}_binary.zip`,
        },
    });
};
