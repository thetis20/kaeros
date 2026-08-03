import { useState, useEffect } from 'react';

function useTags() {
    const [tags, setTags] = useState([])

    function handleTag(event) {
        setTags(event.detail)
    }

    useEffect(() => {
        window.electronAPI.tagFetch()
        document.addEventListener('tag-onchange', handleTag);
        return () => {
            document.removeEventListener('tag-onchange', handleTag);
        }
    }, []);

    return tags
}

export default useTags;
