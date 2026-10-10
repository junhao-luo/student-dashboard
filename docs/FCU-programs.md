# FCU department and program directory

Snapshot checked on 2026-10-10 against FCU's official [undergraduate directory](https://www.fcu.edu.tw/undergraduate/) and [graduate directory](https://www.fcu.edu.tw/graduate/).

`src/fcu-programs.ts` contains all 54 distinct undergraduate and 72 graduate titles listed on those pages, including institutes, in-service programs and international dual degrees. Compatibility characters are normalized to standard Unicode; titles otherwise follow FCU's Chinese directory. The app keeps these official Chinese titles in both interface languages rather than inventing English translations.

The profile form searches these titles inside the **Department / program** dropdown and offers **Add custom program**, including when the search has no matches. Existing unlisted department values open in the custom field without being discarded. The list is a checked snapshot, not a live enrollment service. Recheck both official pages when FCU changes its programs; new or renamed programs can be entered manually meanwhile.

School email is no longer an input. The server stores lowercase `studentId@o365.fcu.edu.tw` on each profile save. This derives the destination, without verifying enrollment or mailbox ownership. Mobile input accepts exactly `09` plus eight digits, or `+8869` plus eight digits, and stores the local ten-digit form. Spaces, separators, landlines and other country codes are rejected by both form and server.
