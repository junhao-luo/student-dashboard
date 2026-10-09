export type PdfText = { str: string; x: number; y: number; width: number };
export type ImportedMeeting = {
  name: string;
  instructor: string;
  room: string;
  day: number;
  start: string;
  end: string;
};
export function parseTimetable(items: PdfText[]): ImportedMeeting[] {
  const labels = ["一", "二", "三", "四", "五", "六", "日"];
  const headers = labels.map((label) =>
    items.find((item) => item.str.trim() === `星期${label}`),
  );
  if (headers.some((header) => !header))
    throw new Error(
      "This PDF layout is not supported. Use the weekly grid exported by MyFCU.",
    );
  const centers = headers.map((header) => header!.x + header!.width / 2);
  const left = centers[0] - (centers[1] - centers[0]) / 2;
  const times = items
    .filter((item) => item.x < left && /^\d{2}:\d{2}$/.test(item.str.trim()))
    .sort((a, b) => b.y - a.y);
  if (times.length !== 28)
    throw new Error(
      "Could not identify all 14 class periods. Please use manual entry.",
    );
  const result: ImportedMeeting[] = [];
  for (let period = 0; period < 14; period++) {
    const top = times[period * 2].y + 10;
    const bottom =
      period < 13
        ? times[(period + 1) * 2].y + 10
        : times[period * 2 + 1].y - 12;
    for (let day = 0; day < 7; day++) {
      const lines = items
        .filter(
          (item) =>
            item.str.trim() &&
            item.x >= left &&
            item.y <= top &&
            item.y > bottom &&
            centers.reduce(
              (best, center, index) =>
                Math.abs(center - (item.x + item.width / 2)) <
                Math.abs(centers[best] - (item.x + item.width / 2))
                  ? index
                  : best,
              0,
            ) === day,
        )
        .sort((a, b) => b.y - a.y || a.x - b.x)
        .map((item) => item.str.trim());
      if (!lines.length) continue;
      const room =
        lines.length > 1 &&
        /^[\p{Script=Han}A-Za-z]{1,6}\d/u.test(lines[lines.length - 1])
          ? lines.pop()!
          : "";
      const text = lines.join("");
      const match = text.match(/^(.*)[(（]([^()（）]*)[)）]$/u);
      const name = match ? match[1] : text;
      if (!name) continue;
      const instructor = match?.[2] ?? "";
      const previous = result.findLast(
        (item) =>
          item.day === day + 1 &&
          item.name === name &&
          item.instructor === instructor &&
          item.room === room,
      );
      if (previous && previous.end === times[(period - 1) * 2 + 1]?.str)
        previous.end = times[period * 2 + 1].str;
      else
        result.push({
          name,
          instructor,
          room,
          day: day + 1,
          start: times[period * 2].str,
          end: times[period * 2 + 1].str,
        });
    }
  }
  if (!result.length)
    throw new Error(
      "No class meetings found. This may be a scanned or empty timetable.",
    );
  return result;
}
