---
created: <% tp.file.creation_date() %>
end_time: 
meeting_status: false
scheduled_date: 
start_time: 
summary: ""
tags: [meeting]
type: meeting
attendees:
location:
related:
---

# Meeting Details

Scheduled Date: `INPUT[date(showcase):scheduled_date]`
Start Time: `INPUT[time:start_time]` End Time: `INPUT[time:end_time]`
Meeting Summary: `INPUT[text(limit(30)):summary]`
Meeting Status: `INPUT[toggle:meeting_status]` (`VIEW[{meeting_status} ? "Done" : "Not Done"]`)
Location: `INPUT[text:location]`
Attendees: `INPUT[inlineListSuggester(optionQuery("PARA/RESOURCES/CONTACTS"), useLinks(true)):attendees]`
Related: `INPUT[inlineListSuggester(optionQuery("PARA/PROJECTS"), optionQuery("PARA/AREAS")):related]`

```datacorejsx
const H = await dc.require(dc.headerLink("SYSTEM/SCRIPTS/datacore_helpers.md", "Helpers"));

return function TeamMeetingNav() {
    const current = dc.useCurrentFile();
    const all = dc.useQuery('@page and path("PARA/RESOURCES/MEETINGS")');

    const nav = dc.useMemo(function () {
        const curDate = (function () {
            const nm = (current.$name || "").match(/(\d{4}-\d{2}-\d{2})/);
            if (nm) { const d = H.DateTime.fromFormat(nm[1], "yyyy-MM-dd"); if (d.isValid) return d.startOf("day"); }
            return H.toDay(current.value("scheduled_date"));
        })();
        let prev = null, next = null;
        for (let i = 0; i < all.length; i++) {
            const p = all[i];
            if (p.$path === current.$path) continue;
            const name = p.$name || "";
            if (name.indexOf("Team Meeting") < 0) continue;
            const m = name.match(/(\d{4}-\d{2}-\d{2})/);
            const d = m ? H.DateTime.fromFormat(m[1], "yyyy-MM-dd") : null;
            if (!d || !d.isValid || !curDate) continue;
            const dd = d.startOf("day");
            if (dd < curDate) { if (!prev || dd > prev.date) prev = { page: p, date: dd }; }
            else if (dd > curDate) { if (!next || dd < next.date) next = { page: p, date: dd }; }
        }
        return { prev, next };
    }, [all, current]);

    const cell = function (item) {
        if (!item) return <span style={{opacity: 0.4}}>—</span>;
        return item.page.$link;
    };
    return <div style={{display: "flex", gap: "24px", alignItems: "center", flexWrap: "wrap"}}>
        <div>⬅️ Previous：{cell(nav.prev)}</div>
        <div>Next ➡️：{cell(nav.next)}</div>
    </div>;
}
```

# Attendees Tag

# Topic Tag

# Notes

# Next Actions
