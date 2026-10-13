import { Plus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useThemeClasses } from "@/hooks/useThemeClasses";

interface MergeVarRow {
  key: string;
  value: string;
}

interface MergeVarsEditorProps {
  rows: MergeVarRow[];
  onChange: (rows: MergeVarRow[]) => void;
}

const MergeVarsEditor = ({ rows, onChange }: MergeVarsEditorProps) => {
  const { t } = useTranslation("email_config");
  const { textPrimary, borderColor, bgPrimary, textTertiary } =
    useThemeClasses();

  const inputCls = `flex-1 px-3 py-2 rounded-lg border ${borderColor} ${bgPrimary} ${textPrimary} text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent transition`;

  const updateRow = (
    index: number,
    field: keyof MergeVarRow,
    value: string,
  ) => {
    const next = rows.map((row, i) =>
      i === index ? { ...row, [field]: value } : row,
    );
    onChange(next);
  };

  const removeRow = (index: number) => {
    onChange(rows.filter((_, i) => i !== index));
  };

  const addRow = () => {
    onChange([...rows, { key: "", value: "" }]);
  };

  return (
    <div className="space-y-2">
      <label className={`block text-sm font-semibold ${textPrimary}`}>
        {t("merge_variables")}
      </label>
      {rows.map((row, index) => (
        <div key={index} className="flex items-center gap-2">
          <input
            type="text"
            placeholder={t("variable_key")}
            value={row.key}
            onChange={(e) => updateRow(index, "key", e.target.value)}
            className={inputCls}
          />
          <input
            type="text"
            placeholder={t("variable_value")}
            value={row.value}
            onChange={(e) => updateRow(index, "value", e.target.value)}
            className={inputCls}
          />
          <button
            type="button"
            onClick={() => removeRow(index)}
            className={`p-2 rounded-lg ${textTertiary} hover:text-red-500 transition-colors`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addRow}
        className="flex items-center gap-1.5 text-sm font-medium text-violet-600 hover:text-violet-700 transition-colors"
      >
        <Plus className="w-4 h-4" />
        {t("add_variable")}
      </button>
    </div>
  );
};

export default MergeVarsEditor;
export type { MergeVarRow };
