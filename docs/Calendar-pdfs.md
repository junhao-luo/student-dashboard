# School calendar previews

The school calendar view renders the supplied public PDFs above Google Calendar using the existing PDF.js renderer. The academic-year document has two pages; the course-registration document has eight. Preview and page controls are display-only and do not create personal classes, deadlines or reminders.

Bundled assets preserve the original PDF bytes and use Vite's hashed URLs, so mobile browsers need neither a third-party PDF viewer nor a cross-origin fetch. The Open PDF link offers the complete document. The copies are fixed to the user's supplied versions; replace them when the university publishes updates.

- [115 academic-year calendar, university PDF](https://s3.ap-southeast-1.amazonaws.com/web-content.fcu.edu.tw/wp-content/uploads/sites/118/2026/04/08110307/%E9%80%A2%E7%94%B2-115%E5%AD%B8%E5%B9%B4%E5%BA%A6-%E8%A1%8C%E4%BA%8B%E6%9B%86115.02.25%E6%9C%83%E8%AD%B0%E5%BE%8C-%E5%85%AC%E5%91%8A.pdf): src/assets/calendars/fcu-115-academic.pdf, 318,376 bytes.
- [115-1 course-registration calendar, university PDF](https://s3.ap-southeast-1.amazonaws.com/web-content.fcu.edu.tw/wp-content/uploads/sites/118/2026/08/13104403/115-1%E5%AD%B8%E7%94%9F%E9%81%B8%E8%AA%B2%E8%A1%8C%E4%BA%8B%E6%9B%86_%E4%B8%AD%E8%8B%B1%E5%85%AC%E5%91%8A%E7%89%88_20260522.pdf): src/assets/calendars/fcu-115-1-registration.pdf, 1,383,653 bytes.

Both were retrieved and previewed on October 13, 2026. Titles, dates and document content belong to the university. Refer to its latest official announcements for changes.
