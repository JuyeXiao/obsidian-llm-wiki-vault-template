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

# Attendees Tag

# Topic Tag

# Notes

# Next Actions
