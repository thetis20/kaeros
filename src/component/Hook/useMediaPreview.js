import { useEffect, useRef } from 'react';
import { hasSource } from '../../lib/filename';
import { toFileUrl } from '../../lib/mediaUrl';
import { toWindow, isPastEnd } from '../../lib/mediaWindow';

function useMediaPreview() {
    const mediaRef = useRef(null);
    const blobUrlRef = useRef(null);
    const loadedMetadataListenerRef = useRef(null);
    const timeUpdateListenerRef = useRef(null);

    function revokeBlobUrl() {
        if (blobUrlRef.current) {
            URL.revokeObjectURL(blobUrlRef.current);
            blobUrlRef.current = null;
        }
    }

    function clearListeners(mediaEl) {
        if (loadedMetadataListenerRef.current) {
            mediaEl.removeEventListener('loadedmetadata', loadedMetadataListenerRef.current);
            loadedMetadataListenerRef.current = null;
        }
        if (timeUpdateListenerRef.current) {
            mediaEl.removeEventListener('timeupdate', timeUpdateListenerRef.current);
            timeUpdateListenerRef.current = null;
        }
    }

    useEffect(() => () => {
        const mediaEl = mediaRef.current;
        if (mediaEl) clearListeners(mediaEl);
        revokeBlobUrl();
        // Unmount cleanup only: the refs it touches are stable, so an empty dep
        // array is what we want here, not a re-run on every render.
    }, []);

    function play(value) {
        const mediaEl = mediaRef.current;
        if (!mediaEl || !hasSource(value)) return;

        clearListeners(mediaEl);
        revokeBlobUrl();

        if (value.file) {
            const url = URL.createObjectURL(value.file);
            blobUrlRef.current = url;
            mediaEl.src = url;
        } else {
            mediaEl.src = toFileUrl(value.src);
        }
        mediaEl.load();

        const { startSec, endSec } = toWindow(value);

        function onLoadedMetadata() {
            mediaEl.currentTime = startSec;
            mediaEl.play()?.catch(() => {});
            mediaEl.removeEventListener('loadedmetadata', onLoadedMetadata);
            loadedMetadataListenerRef.current = null;
        }
        loadedMetadataListenerRef.current = onLoadedMetadata;
        mediaEl.addEventListener('loadedmetadata', onLoadedMetadata);

        if (endSec !== null) {
            function onTimeUpdate() {
                if (isPastEnd(mediaEl.currentTime, endSec)) {
                    mediaEl.pause();
                    mediaEl.removeEventListener('timeupdate', onTimeUpdate);
                    timeUpdateListenerRef.current = null;
                }
            }
            timeUpdateListenerRef.current = onTimeUpdate;
            mediaEl.addEventListener('timeupdate', onTimeUpdate);
        }
    }

    return { mediaRef, play };
}

export default useMediaPreview;
