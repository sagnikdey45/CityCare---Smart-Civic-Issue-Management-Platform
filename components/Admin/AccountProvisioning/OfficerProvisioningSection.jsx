import { useState } from "react";
import { UserPlus, Upload, Shield, Zap } from "lucide-react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { OfficerCSVUploader } from "./OfficerCSVUploader";
import { OfficerProvisioningTable } from "./OfficerProvisioningTable";
import { AddOfficerDialog } from "./AddOfficerDialog";
import { CSVPreviewDialog } from "./CSVPreviewDialog";
import { BulkImportResultDialog } from "./BulkImportResultDialog";
import { validateOfficerRows } from "../../../lib/accountProvisioning/validateProvisioningData";

export function OfficerProvisioningSection({
  officersData,
  referenceData,
  adminUserId,
  onRefresh,
}) {
  const bulkCreateOfficersAction = useAction(
    api.accountProvisioningActions.bulkCreatePreProvisionedOfficers
  );

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [showCSVUploader, setShowCSVUploader] = useState(false);

  // Staged CSV State
  const [stagedCSV, setStagedCSV] = useState(null); // { fileName, headers, rawRows, validationResult }
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isProvisioning, setIsProvisioning] = useState(false);

  // Result Modal State
  const [bulkResult, setBulkResult] = useState(null);

  // Handle CSV file parsed
  const handleCSVParsed = ({ fileName, headers, rows }) => {
    const existingEmails = referenceData?.unitOfficersList
      ?.map((u) => u.email)
      .concat(officersData?.allOfficers?.map((o) => o.email) || []);

    const validationResult = validateOfficerRows(rows, {
      existingUODepartments: referenceData?.existingUODepartments || [],
      existingEmails,
    });

    setStagedCSV({
      fileName,
      headers,
      validationResult,
    });
    setIsPreviewOpen(true);
  };

  // Update a single staged row after inline edit
  const handleUpdateRow = (updatedRowPayload) => {
    if (!stagedCSV) return;

    const currentAllRows = [
      ...stagedCSV.validationResult.validRows,
      ...stagedCSV.validationResult.invalidRows,
    ];

    const updatedRawRows = currentAllRows.map((r) => {
      if (r.clientRowId === updatedRowPayload.clientRowId) {
        return {
          rowNumber: updatedRowPayload.rowNumber,
          data: {
            fullName: updatedRowPayload.fullName,
            email: updatedRowPayload.email,
            phone: updatedRowPayload.phone,
            dob: updatedRowPayload.dob,
            state: updatedRowPayload.state,
            city: updatedRowPayload.city,
            district: updatedRowPayload.district,
            department: updatedRowPayload.department,
            role: updatedRowPayload.role,
            specialisation: updatedRowPayload.specialisation,
          },
        };
      }
      return {
        rowNumber: r.rowNumber,
        data: {
          fullName: r.fullName,
          email: r.email,
          phone: r.phone,
          dob: r.dob,
          state: r.state,
          city: r.city,
          district: r.district,
          department: r.department,
          role: r.role,
          specialisation: r.specialisation,
        },
      };
    });

    const existingEmails = referenceData?.unitOfficersList
      ?.map((u) => u.email)
      .concat(officersData?.allOfficers?.map((o) => o.email) || []);

    const newValidationResult = validateOfficerRows(updatedRawRows, {
      existingUODepartments: referenceData?.existingUODepartments || [],
      existingEmails,
    });

    setStagedCSV((prev) => ({
      ...prev,
      validationResult: newValidationResult,
    }));
    toast.success(`Updated Row #${updatedRowPayload.rowNumber}`);
  };

  // Remove a row from staged CSV
  const handleRemoveRow = (clientRowId) => {
    if (!stagedCSV) return;

    const currentAllRows = [
      ...stagedCSV.validationResult.validRows,
      ...stagedCSV.validationResult.invalidRows,
    ].filter((r) => r.clientRowId !== clientRowId);

    const remainingRawRows = currentAllRows.map((r) => ({
      rowNumber: r.rowNumber,
      data: {
        fullName: r.fullName,
        email: r.email,
        phone: r.phone,
        dob: r.dob,
        state: r.state,
        city: r.city,
        district: r.district,
        department: r.department,
        role: r.role,
        specialisation: r.specialisation,
      },
    }));

    const existingEmails = referenceData?.unitOfficersList
      ?.map((u) => u.email)
      .concat(officersData?.allOfficers?.map((o) => o.email) || []);

    const newValidationResult = validateOfficerRows(remainingRawRows, {
      existingUODepartments: referenceData?.existingUODepartments || [],
      existingEmails,
    });

    setStagedCSV((prev) => ({
      ...prev,
      validationResult: newValidationResult,
    }));
    toast.info("Row removed from import staging");
  };

  // Clear all staged rows
  const handleClearAll = () => {
    setStagedCSV(null);
    setIsPreviewOpen(false);
    toast.info("CSV staging cleared");
  };

  // Confirm & Commit bulk provisioning
  const handleConfirmProvision = async () => {
    if (!stagedCSV || !adminUserId) {
      toast.error("Admin user identification required");
      return;
    }

    const validRowsToCommit = stagedCSV.validationResult.validRows;
    if (validRowsToCommit.length === 0) {
      toast.error("No valid rows ready to provision");
      return;
    }

    setIsProvisioning(true);
    try {
      const res = await bulkCreateOfficersAction({
        fileName: stagedCSV.fileName,
        uploadedBy: adminUserId,
        rows: validRowsToCommit,
      });

      setBulkResult(res);
      setIsPreviewOpen(false);
      setStagedCSV(null);
      toast.success(`Provisioned ${res.createdRows} officer accounts!`);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Failed to commit bulk officer provisioning");
    } finally {
      setIsProvisioning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Shield size={20} className="text-emerald-500" />
            Officer Account Provisioning
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Pre-provision Unit Officers & Field Officers manually or via bulk CSV onboarding
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCSVUploader(!showCSVUploader)}
            className={`px-4 py-2.5 rounded-2xl font-bold text-xs border transition-all flex items-center gap-2 ${
              showCSVUploader
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
            }`}
          >
            <Upload size={15} /> {showCSVUploader ? "Hide Uploader" : "Upload CSV"}
          </button>
          <button
            onClick={() => setIsAddDialogOpen(true)}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <UserPlus size={15} /> Add Officer
          </button>
        </div>
      </div>

      {/* CSV Uploader Card */}
      {showCSVUploader && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-300">
          <OfficerCSVUploader onCSVParsed={handleCSVParsed} />
        </div>
      )}

      {/* Provisioned Officers Table */}
      <OfficerProvisioningTable
        officers={officersData?.allOfficers || []}
        onRefresh={onRefresh}
      />

      {/* Add Officer Modal */}
      <AddOfficerDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        referenceData={referenceData}
        onSuccess={() => {
          setIsAddDialogOpen(false);
          if (onRefresh) onRefresh();
        }}
      />

      {/* CSV Staging Preview Dialog */}
      <CSVPreviewDialog
        isOpen={isPreviewOpen}
        type="officers"
        fileName={stagedCSV?.fileName || ""}
        validationResult={stagedCSV?.validationResult}
        onClose={() => setIsPreviewOpen(false)}
        onUpdateRow={handleUpdateRow}
        onRemoveRow={handleRemoveRow}
        onClearAll={handleClearAll}
        onConfirmProvision={handleConfirmProvision}
        isProvisioning={isProvisioning}
      />

      {/* Bulk Result Summary Modal */}
      <BulkImportResultDialog
        isOpen={!!bulkResult}
        result={bulkResult}
        onClose={() => setBulkResult(null)}
      />
    </div>
  );
}
