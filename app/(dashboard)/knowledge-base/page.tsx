import { getSystemPrompt } from "@/lib/dal";
import { saveSystemPrompt } from "@/lib/actions";
import { Save, FileText, Upload, X } from "lucide-react";

const DUMMY_DOCS = [
  {
    id: "1",
    name: "Return Policy.pdf",
    type: "pdf",
    size: "245 KB",
    uploaded: "Jun 10, 2026",
  },
  {
    id: "2",
    name: "Product FAQ.md",
    type: "doc",
    size: "18 KB",
    uploaded: "Jun 8, 2026",
  },
  {
    id: "3",
    name: "Shipping Guide.pdf",
    type: "pdf",
    size: "112 KB",
    uploaded: "Jun 5, 2026",
  },
];

export default async function KnowledgeBasePage() {
  const currentPrompt = await getSystemPrompt();

  return (
    <div className="mx-auto w-full max-w-6xl px-8 py-16">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-[36px] font-semibold leading-[1.20] tracking-[-0.5px] text-[#1a1a1a]">
          Knowledge Base
        </h1>
        <p className="mt-2 text-[16px] leading-[1.55] text-[#787671]">
          Configure Aditi&apos;s instructions, behavior, and reference documents for all customer interactions.
        </p>
      </div>

      {/* 2-column layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* System Prompt — functional */}
        <div className="flex flex-col rounded-[12px] border border-[#e5e3df] bg-[#ffffff]">
          <div className="flex items-center justify-between border-b border-[#e5e3df] px-6 py-5">
            <div>
              <h2 className="text-[18px] font-semibold leading-[1.40] text-[#1a1a1a]">
                System Prompt
              </h2>
              <p className="mt-1 text-[13px] leading-[1.40] text-[#787671]">
                Sent to the AI model before each conversation
              </p>
            </div>
            <span className="rounded-full bg-[#1aae39] px-[10px] py-[4px] text-[13px] font-bold leading-[1.40] text-white">
              Active
            </span>
          </div>

          <form action={saveSystemPrompt} className="flex flex-1 flex-col">
            <div className="flex-1 p-6">
              <textarea
                name="prompt"
                defaultValue={currentPrompt}
                placeholder="Enter the system prompt for Aditi..."
                className="h-full min-h-[400px] w-full resize-none rounded-[8px] border border-[#c8c4be] bg-[#ffffff] px-[16px] py-[12px] text-[16px] leading-[1.55] text-[#1a1a1a] outline-none focus:border-[#5645d4] focus:ring-1 focus:ring-[#5645d4]"
              />
            </div>

            <div className="flex items-center justify-between border-t border-[#e5e3df] px-6 py-5">
              <p className="text-[13px] leading-[1.40] text-[#787671]">
                Supports plain text and markdown.
              </p>
              <button
                type="submit"
                className="flex items-center gap-2 rounded-[8px] bg-[#5645d4] px-[18px] py-[10px] text-[14px] font-medium leading-[1.30] text-white transition-colors hover:bg-[#4534b3]"
              >
                <Save className="h-4 w-4" />
                Save prompt
              </button>
            </div>
          </form>
        </div>

        {/* Company Documents — dummy */}
        <div className="flex flex-col rounded-[12px] border border-[#e5e3df] bg-[#ffffff]">
          <div className="border-b border-[#e5e3df] px-6 py-5">
            <h2 className="text-[18px] font-semibold leading-[1.40] text-[#1a1a1a]">
              Company Documents
            </h2>
            <p className="mt-1 text-[13px] leading-[1.40] text-[#787671]">
              Upload docs and PDFs for Aditi to reference.
            </p>
          </div>

          <div className="flex flex-1 flex-col p-6">
            {/* Upload zone */}
            <div className="flex flex-col items-center justify-center rounded-[12px] border-2 border-dashed border-[#c8c4be] bg-[#fafaf9] px-6 py-10 text-center transition-colors hover:border-[#5645d4] hover:bg-[#f6f5f4]">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#f6f5f4]">
                <Upload className="h-4 w-4 text-[#787671]" />
              </div>
              <p className="text-[14px] font-medium text-[#1a1a1a]">
                Drop files here or <span className="text-[#5645d4]">browse</span>
              </p>
              <p className="mt-1 text-[12px] text-[#787671]">
                PDF, Markdown, TXT — up to 10 MB
              </p>
            </div>

            {/* File list */}
            <div className="mt-5 flex-1">
              <p className="mb-3 text-[12px] font-semibold uppercase tracking-[1px] text-[#a4a097]">
                Uploaded files
              </p>
              <div className="space-y-2">
                {DUMMY_DOCS.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-3 rounded-[8px] border border-[#e5e3df] bg-[#fafaf9] px-3.5 py-2.5"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-[#e6e0f5]">
                      <FileText className="h-3.5 w-3.5 text-[#5645d4]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium text-[#1a1a1a]">
                        {doc.name}
                      </p>
                      <p className="text-[11px] text-[#787671]">
                        {doc.size} · {doc.uploaded}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-[4px] bg-[#e6e0f5] px-[6px] py-[2px] text-[10px] font-semibold uppercase tracking-[0.5px] text-[#391c57]">
                      {doc.type}
                    </span>
                    <button
                      type="button"
                      className="shrink-0 rounded-[6px] p-1 text-[#787671] transition-colors hover:bg-[#f0eeec] hover:text-[#e03131]"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
