import { useState, useRef } from "react";
import { Upload, FileSpreadsheet, Download, Loader2 } from "lucide-react";
import { parseCSVString } from "../../../lib/accountProvisioning/csvParser";
import { downloadCityAdminCSVTemplate } from "../../../lib/accountProvisioning/generateCSVTemplate";
import { toast } from "sonner";

export function CityAdminCSVUploader({ onCSVParsed }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;
    if (!file.name.endsWith(".csv")) {
      toast.error("Please select a valid .csv file");
      return;
    }

    setIsParsing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const { headers, rows } = parseCSVString(text);

        if (rows.length === 0) {
          toast.error("CSV file contains no valid data rows");
          return;
        }

        onCSVParsed({
          fileName: file.name,
          headers,
          rows,
        });
      } catch (err) {
        console.error(err);
        toast.error("Failed to parse CSV file");
      } finally {
        setIsParsing(false);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <FileSpreadsheet size={22} />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Bulk City Admin CSV Onboarding
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Batch create municipal City Admin accounts from a CSV file
            </p>
          </div>
        </div>

        <button
          onClick={downloadCityAdminCSVTemplate}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-purple-200 dark:border-purple-800/60 bg-purple-50/60 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 font-extrabold text-xs hover:bg-purple-100 transition-colors cursor-pointer"
        >
          <Download size={14} /> Download CSV Template
        </button>
      </div>

      {/* Drag & Drop Area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
          isDragging
            ? "border-purple-500 bg-purple-50/50 dark:bg-purple-950/20 scale-[0.99]"
            : "border-slate-200 dark:border-slate-700 hover:border-purple-500/50 hover:bg-slate-50 dark:hover:bg-slate-800/40"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
        />

        <div className="space-y-2">
          {isParsing ? (
            <div className="flex flex-col items-center py-2 text-purple-600 dark:text-purple-400">
              <Loader2 size={32} className="animate-spin mb-2" />
              <p className="text-xs font-black">Parsing CSV File...</p>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto shadow-inner">
                <Upload size={22} />
              </div>
              <div>
                <p className="text-sm font-black text-slate-800 dark:text-slate-200">
                  Drop your City Admin CSV file here or <span className="text-purple-600 dark:text-purple-400 underline">Browse</span>
                </p>
                <p className="text-xs text-slate-400 mt-1 font-semibold">
                  Supports headers: fullName, email, phone, dob, state, city
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
