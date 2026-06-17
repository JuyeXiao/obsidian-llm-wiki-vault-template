---
created: <% tp.file.creation_date() %>
end_time: 
meeting_status: false
scheduled_date: 
start_time: 
summary: ""
tags: [agile, meeting, standup]
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
Attendees: `INPUT[inlineListSuggester(optionQuery(#contact)):attendees]`
Related: `INPUT[inlineListSuggester(optionQuery("PARA/PROJECTS"), optionQuery("PARA/AREAS")):related]`

# Attendees Tag

# Topic Tag

# Agenda

1. What you completed?
2. What are you working currently?
3. What are the roadblocks?
4. Any topic outside of the above agenda but needs teams input (16th minute items)?

# Notes

# Next Actions
