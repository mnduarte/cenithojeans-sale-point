import React, { useState, useEffect } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { MdClose } from "react-icons/md";
import { FaFilePdf, FaFileExcel } from "react-icons/fa";
import { useTheme } from "../contexts/ThemeContext";

interface ModalGenerarProps {
  isOpen: boolean;
  onClose: () => void;
  pdfDocument?: React.ReactElement;
  pdfFileName?: string;
  onExcel?: () => Promise<void> | void;
  title?: string;
}

const Spinner = () => (
  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
);

const ModalGenerar = ({
  isOpen,
  onClose,
  pdfDocument,
  pdfFileName,
  onExcel,
  title = "Generar",
}: ModalGenerarProps) => {
  const {
    state: { theme, themeStyles },
  } = useTheme();
  const [isGeneratingExcel, setIsGeneratingExcel] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const frame = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(frame);
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleExcel = async () => {
    setIsGeneratingExcel(true);
    try {
      await onExcel?.();
    } finally {
      setIsGeneratingExcel(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-black flex items-center justify-center transition-opacity duration-200 ${
        visible ? "bg-opacity-50 opacity-100" : "bg-opacity-0 opacity-0"
      }`}
      onClick={onClose}
    >
      <div
        className={`relative p-6 rounded-lg shadow-2xl min-w-[260px] transition-all duration-[220ms] ${
          themeStyles[theme].tailwindcss.modal
        } ${
          visible
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 -translate-y-2"
        }`}
        style={{
          border: "1px solid #3f3f46",
          transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-200"
          onClick={onClose}
        >
          <MdClose className="text-xl" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-2 h-6 bg-cyan-500 rounded-full" />
          <h2 className="text-base font-semibold text-gray-100">{title}</h2>
        </div>

        <div className="flex flex-col gap-3">
          {pdfDocument && pdfFileName && (
            <PDFDownloadLink document={pdfDocument} fileName={pdfFileName}>
              {({ loading }) => (
                <button
                  className="w-full flex items-center justify-center gap-2 bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-md cursor-pointer transition-colors disabled:opacity-60"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner />
                      Generando PDF...
                    </>
                  ) : (
                    <>
                      <FaFilePdf />
                      Generar PDF
                    </>
                  )}
                </button>
              )}
            </PDFDownloadLink>
          )}

          {onExcel && (
            <button
              className="w-full flex items-center justify-center gap-2 bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-md cursor-pointer transition-colors disabled:opacity-60"
              disabled={isGeneratingExcel}
              onClick={handleExcel}
            >
              {isGeneratingExcel ? (
                <>
                  <Spinner />
                  Generando...
                </>
              ) : (
                <>
                  <FaFileExcel />
                  Generar Excel
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalGenerar;
