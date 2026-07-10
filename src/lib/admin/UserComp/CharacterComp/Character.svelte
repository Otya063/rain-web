<script lang="ts">
    import type { CharacterProps } from '$types';
    import CharacterCard from './CharacterCard.svelte';
    import CharacterMain from './CharacterMain.svelte';

    let {
        user,
        stage = $bindable(0),
        scrollY = $bindable(),
        scrollYBeforeClickClaimedDist = $bindable(),
        catTypes,
        editingId,
        editModeSwitch,
        onCharacterUpdate,
        onDeleteCharacter,
        onLinkDiscord,
        isMobile,
    }: CharacterProps = $props();
</script>

<CharacterCard {user} {isMobile} {onDeleteCharacter} {onLinkDiscord} />
<CharacterMain {user} bind:stage bind:scrollY bind:scrollYBeforeClickClaimedDist {catTypes} {editingId} {editModeSwitch} {onCharacterUpdate} {isMobile} />
