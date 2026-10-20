---
type: script
---

# Permanent MOC Helpers

```js
function viewpointStatus(text) {
    let fence = null;
    const visible = [];
    for (const line of String(text).replace(/<!--[\s\S]*?-->/g, "").split(/\r?\n/)) {
        const marker = line.match(/^\s{0,3}(`{3,}|~{3,})/);
        if (marker) {
            if (!fence) fence = marker[1];
            else if (marker[1][0] === fence[0] && marker[1].length >= fence.length) fence = null;
            continue;
        }
        if (!fence) visible.push(line);
    }
    const body = visible.join("\n");
    if (/^>\s*\[!todo\][+-]?\s*Personal viewpoint pending\s*$/im.test(body)) return "Personal viewpoint pending";
    if (/^>\s*\[!question\][+-]?\s*Open question\s*$/im.test(body)) return "Open question";
    return "Unmarked";
}

function createStatusCache(readFile) {
    const entries = new Map();
    const stampOf = file => file.stat.mtime + ":" + file.stat.size;
    const fresh = file => {
        const entry = entries.get(file.path);
        return entry && entry.stamp === stampOf(file) && !entry.promise && entry.status !== "Read failed";
    };
    return {
        peek: path => entries.get(path)?.status || "Loading",
        needsRead: file => !fresh(file),
        prune: paths => { for (const path of entries.keys()) if (!paths.has(path)) entries.delete(path); },
        load(file) {
            const old = entries.get(file.path), stamp = stampOf(file);
            if (fresh(file)) return Promise.resolve(old.status);
            if (old?.stamp === stamp && old.promise) return old.promise;
            const entry = { stamp, status: "Loading" };
            entries.set(file.path, entry);
            entry.promise = Promise.resolve().then(() => readFile(file)).then(viewpointStatus).catch(() => "Read failed").then(status => {
                if (entries.get(file.path) === entry) { entry.status = status; entry.promise = null; }
                return status;
            });
            return entry.promise;
        }
    };
}

function filterRows(rows, query, topic, status, sortKey) {
    const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return rows.filter(row => (!topic || row.topics.includes(topic)) && (!status || row.status === status) && words.every(word => row.hay.includes(word)))
        .sort((a, b) => sortKey === "title" ? a.title.localeCompare(b.title) : b.modified.localeCompare(a.modified) || a.title.localeCompare(b.title));
}

function pageWindow(rows, position, token, size = 10) {
    const total = Math.max(1, Math.ceil(rows.length / size));
    const page = position.token === token ? Math.max(0, Math.min(position.page, total - 1)) : 0;
    return { page, total, shown: rows.slice(page * size, (page + 1) * size) };
}

return { viewpointStatus, createStatusCache, filterRows, pageWindow };
```
