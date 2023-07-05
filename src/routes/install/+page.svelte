<script lang="ts">
    import { onMount } from 'svelte';

    // Function to initiate the file download
    function downloadFile() {
        const downloadLink = document.createElement('a');
        downloadLink.href = '/static/install/setup.exe';
        downloadLink.download = 'mhfSetup_ZZ_v1.3.1.exe';
        downloadLink.click();
    }

    onMount(() => {
        downloadFile();
    });
</script>