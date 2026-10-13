import { ImportedTimetable } from "./ImportedTimetable";
import { Select, UploadArea, LoadingState } from "./Interface";
import { useState } from "react";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { parseTimetable, type ImportedMeeting } from "./pdf-parser";
GlobalWorkerOptions.workerSrc = workerUrl;
export function PdfImport({
  zh,
  hasExistingTimetable,
  onSave,
}: {
  zh: boolean;
  hasExistingTimetable: boolean;
  onSave: (rows: ImportedMeeting[], replace: boolean) => void;
}) {
  const [rows, setRows] = useState<ImportedMeeting[]>([]);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [replace, setReplace] = useState(false);
  const t = (en: string, cn: string) => (zh ? cn : en);
  async function read(file?: File) {
    if (!file) return;
    setBusy(true);
    setError("");
    setRows([]);
    setPreview("");
    let loadingTask: ReturnType<typeof getDocument> | undefined;
    const deadline=setTimeout(()=>{void loadingTask?.destroy();},20000);
    try {
      if (
        file.size > 10 * 1024 * 1024 ||
        !file.name.toLowerCase().endsWith(".pdf")
      )
        throw new Error(
          t("Choose a PDF under 10 MB.", "請選擇小於 10 MB 的 PDF。"),
        );
      const bytes = new Uint8Array(await file.arrayBuffer());
      if (new TextDecoder().decode(bytes.slice(0, 5)) !== "%PDF-")
        throw new Error(
          t("The file is not a valid PDF.", "檔案不是有效的 PDF。"),
        );
      loadingTask = getDocument({ data: bytes });
      const pdf = await loadingTask.promise;
      if (pdf.numPages !== 1)
        throw new Error(
          t(
            "Use the one-page MyFCU weekly timetable export.",
            "請使用 MyFCU 匯出的單頁每週課表。",
          ),
        );
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 1.5 });
      if(viewport.width*viewport.height>6000000)throw new Error(t('PDF page dimensions are too large.','PDF 頁面尺寸過大。'));
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvas, viewport }).promise;
      setPreview(canvas.toDataURL("image/png"));
      const content = await page.getTextContent();
      if(content.items.length>10000)throw new Error(t('PDF has too much content to process.','PDF 內容過多，無法處理。'));
      setRows(
        parseTimetable(
          content.items
            .filter(
              (
                item,
              ): item is import("pdfjs-dist/types/src/display/api").TextItem =>
                "str" in item,
            )
            .map((item) => ({
              str: item.str,
              x: item.transform[4],
              y: item.transform[5],
              width: item.width,
            })),
        ),
      );
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : t("Could not read this PDF.", "無法讀取此 PDF。"),
      );
    } finally {
      clearTimeout(deadline);
      await loadingTask?.destroy();
      setBusy(false);
    }
  }
  return (
    <section className="import-section">
      <h2>{t("Import from MyFCU", "匯入 MyFCU 課表")}</h2>
      <p className="muted">
        {t(
          "Upload the weekly timetable PDF (10 MB max). Review every meeting before saving. The source PDF stays on this device.",
          "上傳每週課表 PDF（上限 10 MB）。儲存前請確認每個時段。原始 PDF 僅在此裝置處理。",
        )}
      </p>
      <UploadArea label={t("Class schedule PDF", "課表 PDF")} accept=".pdf,application/pdf" busy={busy} zh={zh} onFile={file=>void read(file)}/>
      {busy && <LoadingState compact zh={zh} label={t("Reading timetable…", "正在讀取課表…")}/>}
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      {preview && (
        <details>
          <summary>{t("View source PDF", "查看原始 PDF")}</summary>
          <img
            className="pdf-preview"
            src={preview}
            alt={t("Source timetable for comparison", "原始課表，供核對使用")}
          />
        </details>
      )}
      {rows.length > 0 && (
        <>
          <h3>{t("Review imported meetings", "確認匯入時段")}</h3>
          <p className="muted">
            {t(
              "Course codes and credits are not in this grid. Complete them in the course database.",
              "課表格內沒有課程代碼與學分，請至課程資料庫補充。",
            )}
          </p>
          <ImportedTimetable rows={rows} onChange={setRows} zh={zh}/>
          {hasExistingTimetable&&<><label>
            {t("Import mode", "匯入方式")}
            <Select
              value={replace ? "replace" : "merge"}
              onChange={(e) => setReplace(e.target.value === "replace")}
            >
              <option value="merge">
                {t("Merge (keep existing classes)", "合併（保留現有時段）")}
              </option>
              <option value="replace">
                {t("Replace this semester’s timetable", "取代本學期課表")}
              </option>
            </Select>
          </label>
          <p className="muted">
            {replace
              ? t(
                  "Replaces class meetings in the selected semester. Notes and deadlines are kept.",
                  "取代所選學期的上課時段。保留筆記與截止事項。",
                )
              : t(
                  "Exact duplicates are skipped. Different times or rooms are kept for you to review.",
                  "略過完全相同的時段。不同時間或教室會保留，供你確認。",
                )}
          </p></>}
          <button
            className="primary"
            disabled={rows.some(
              (row) => !row.name.trim() || !row.start || !row.end || row.start >= row.end,
            )}
            onClick={() => {
              onSave(rows, hasExistingTimetable&&replace);
              setRows([]);
              setPreview("");
            }}
          >
            {t("Save reviewed timetable", "儲存已確認課表")}
          </button>
        </>
      )}
    </section>
  );
}
