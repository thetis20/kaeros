import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

function TagMultiSelect({ id, tags, value, onChange, className }) {
    const { t } = useTranslation();
    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(false);
    const pendingCreateName = useRef(null);

    useEffect(() => {
        if (!pendingCreateName.current) return;
        const created = tags.find((tag) => tag.name.trim().toLowerCase() === pendingCreateName.current.toLowerCase());
        if (created) {
            pendingCreateName.current = null;
            if (!value.includes(created.id)) onChange([...value, created.id]);
        }
    }, [tags]);

    const selectedTags = value.map((tagId) => tags.find((tag) => tag.id === tagId)).filter(Boolean);
    const trimmedQuery = query.trim();
    const lowerQuery = trimmedQuery.toLowerCase();
    const matches = tags.filter((tag) => !value.includes(tag.id) && (!lowerQuery || tag.name.toLowerCase().includes(lowerQuery)));
    const exactMatch = trimmedQuery && tags.some((tag) => tag.name.trim().toLowerCase() === lowerQuery);

    function addTag(tagId) {
        onChange([...value, tagId]);
        setQuery('');
    }

    function removeTag(tagId) {
        onChange(value.filter((id) => id !== tagId));
    }

    function createTag() {
        pendingCreateName.current = trimmedQuery;
        window.electronAPI.tagCreate({ name: trimmedQuery });
        setQuery('');
    }

    return (
        <div className={`tag-multiselect ${className || ''}`}>
            <div className="tag-multiselect-chips">
                {selectedTags.map((tag) => (
                    <span key={tag.id} className="pill pill-removable" style={{ background: `${tag.color}22`, color: tag.color }}>
                        {tag.name}
                        <button
                            type="button"
                            aria-label={t('tagSelect.remove', { name: tag.name })}
                            onClick={() => removeTag(tag.id)}
                        >×</button>
                    </span>
                ))}
                <input
                    id={id}
                    type="text"
                    className="tag-multiselect-input"
                    placeholder={t('musique.form.tagsPlaceholder')}
                    value={query}
                    onFocus={() => setOpen(true)}
                    onBlur={() => setTimeout(() => setOpen(false), 150)}
                    onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
                />
            </div>
            {open && (matches.length > 0 || (trimmedQuery && !exactMatch)) && (
                <div className="tag-multiselect-dropdown">
                    {matches.map((tag) => (
                        <button
                            type="button"
                            key={tag.id}
                            className="tag-multiselect-option"
                            onMouseDown={() => addTag(tag.id)}
                        >{tag.name}</button>
                    ))}
                    {trimmedQuery && !exactMatch && (
                        <button type="button" className="tag-multiselect-option" onMouseDown={createTag}>
                            {t('musique.form.createTag', { name: trimmedQuery })}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

export default TagMultiSelect;
