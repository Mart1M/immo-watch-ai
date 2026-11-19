---
cron: "*/10 * * * *"
---

Cron tick. Call `due_searches`. For each search returned, run it: for every source of the search, follow the
matching skill, then save the results with `save_listings` (or `record_run` on failure). If no search is due,
reply with a single line and do nothing else.
