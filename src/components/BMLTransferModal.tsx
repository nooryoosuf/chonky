import React, { useState, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { 
  X, 
  Copy, 
  Check, 
  UploadCloud, 
  FileText, 
  Trash2, 
  ArrowRight,
  ShieldCheck,
  Building,
  Info
} from 'lucide-react';

interface BMLTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue?: () => void;
}

export const BMLTransferModal: React.FC<BMLTransferModalProps> = ({ isOpen, onClose, onContinue }) => {
  const { total, setPaymentMethod, transferSlip, setTransferSlip } = useCart();
  
  const [copiedField, setCopiedField] = useState<'account' | 'amount' | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(transferSlip || null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const ACCOUNT_NAME = "Chonky Burgers MV";
  const ACCOUNT_NUMBER = "7730000123456";

  const handleCopy = (text: string, field: 'account' | 'amount') => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: 10MB
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File size exceeds 10MB limit. Please upload a smaller image or PDF.");
      return;
    }

    setUploadError(null);
    setFileName(file.name);
    setFileSize((file.size / 1024).toFixed(0) + ' KB');

    // Read as Data URL for preview and storage
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPreviewUrl(result);
      setTransferSlip(result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewUrl(null);
    setFileName(null);
    setFileSize(null);
    setTransferSlip(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleContinue = () => {
    setPaymentMethod('transfer');
    if (onContinue) {
      onContinue();
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 font-sans">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-white dark:bg-[#0c0606] text-chonky-text dark:text-[#F7F3EE] rounded-t-[2rem] sm:rounded-3xl shadow-2xl z-10 overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 border border-chonky-border/70 dark:border-white/10 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-chonky-border dark:border-white/10 flex items-center justify-between bg-chonky-peach-light/40 dark:bg-white/5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center font-black text-xs shadow-xs shrink-0">
              BML
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-chonky-text dark:text-white leading-tight">
                Bank Transfer (BML)
              </h3>
              <p className="text-xs text-chonky-muted dark:text-gray-400">
                Transfer to account and attach the payment slip
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-chonky-muted dark:text-gray-400 hover:text-chonky-text dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition"
            aria-label="Close transfer modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 overscroll-contain flex-1">
          
          {/* Amount Due Highlight Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-red-600 to-[#990a0a] text-white flex items-center justify-between shadow-md">
            <div>
              <p className="text-[11px] font-bold text-white/80 uppercase tracking-wider">
                Total Amount to Transfer
              </p>
              <p className="text-2xl sm:text-3xl font-black text-white mt-0.5">
                MVR {total}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(total.toString(), 'amount')}
              className="px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition flex items-center gap-1.5 active:scale-95"
            >
              {copiedField === 'amount' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedField === 'amount' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* 1. Account Information Box */}
          <div className="p-4 rounded-2xl bg-chonky-subtle dark:bg-white/5 border border-chonky-border/80 dark:border-white/10 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-chonky-border/50 dark:border-white/10">
              <span className="text-xs font-bold text-chonky-muted dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-chonky-red dark:text-chonky-peach" />
                <span>Account Information</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200">
                Bank of Maldives (BML)
              </span>
            </div>

            <div className="space-y-2 text-xs">
              {/* Account Name */}
              <div className="flex justify-between items-center">
                <span className="text-chonky-muted dark:text-gray-400">Account Name</span>
                <span className="font-extrabold text-chonky-text dark:text-white sm:text-sm">
                  {ACCOUNT_NAME}
                </span>
              </div>

              {/* Account Number with 1-tap Copy */}
              <div className="flex justify-between items-center pt-1">
                <span className="text-chonky-muted dark:text-gray-400">Account Number</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-sm sm:text-base text-chonky-red dark:text-chonky-peach tracking-wide">
                    {ACCOUNT_NUMBER}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(ACCOUNT_NUMBER, 'account')}
                    className="p-1.5 rounded-lg bg-white dark:bg-white/10 text-chonky-text dark:text-white hover:text-chonky-red dark:hover:text-chonky-peach border border-chonky-border/60 dark:border-white/15 transition active:scale-95 shadow-2xs"
                    title="Copy Account Number"
                  >
                    {copiedField === 'account' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Currency */}
              <div className="flex justify-between items-center pt-1 border-t border-chonky-border/40 dark:border-white/5">
                <span className="text-chonky-muted dark:text-gray-400">Currency</span>
                <span className="font-bold text-chonky-text dark:text-white">Maldivian Rufiyaa (MVR)</span>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-chonky-muted dark:text-gray-400 flex items-start gap-1.5 bg-white/60 dark:bg-black/20 p-2.5 rounded-xl border border-chonky-border/40 dark:border-white/5">
              <Info className="w-3.5 h-3.5 text-chonky-red dark:text-chonky-peach shrink-0 mt-0.5" />
              <span>Please include your <strong>contact phone number</strong> in the BML transfer remarks.</span>
            </div>
          </div>

          {/* 2. Attach Transfer Slip */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-chonky-muted dark:text-gray-400">
              Attach Transfer Slip / Screenshot
            </label>

            {/* Hidden Input */}
            <input 
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Interactive Upload Box */}
            {previewUrl ? (
              <div className="p-3.5 rounded-2xl border-2 border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-950/20 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {previewUrl.startsWith('data:image') ? (
                    <img 
                      src={previewUrl} 
                      alt="Transfer Receipt Preview" 
                      className="w-14 h-14 rounded-xl object-cover border border-emerald-500/30 shrink-0 shadow-xs"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                      <FileText className="w-7 h-7" />
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-extrabold text-xs">
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Transfer Slip Attached!</span>
                    </div>
                    <p className="text-xs text-chonky-text dark:text-white font-medium truncate mt-0.5">
                      {fileName || "Transfer_Receipt.jpg"}
                    </p>
                    {fileSize && (
                      <p className="text-[10px] text-chonky-muted dark:text-gray-400">
                        {fileSize}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white dark:bg-white/10 text-chonky-text dark:text-white hover:bg-chonky-peach transition border border-chonky-border/60 dark:border-white/10"
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="p-1.5 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                    title="Remove File"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="p-5 rounded-2xl border-2 border-dashed border-chonky-border hover:border-chonky-red dark:border-white/15 dark:hover:border-chonky-peach bg-white dark:bg-[#150a0a] text-center cursor-pointer transition group"
              >
                <div className="w-12 h-12 rounded-full bg-chonky-peach/50 dark:bg-white/10 text-chonky-red dark:text-chonky-peach flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <p className="text-xs sm:text-sm font-bold text-chonky-text dark:text-white">
                  Tap to upload transfer slip or screenshot
                </p>
                <p className="text-[11px] text-chonky-muted dark:text-gray-400 mt-0.5">
                  Supports PNG, JPG, or PDF from BML mobile banking
                </p>
              </div>
            )}

            {uploadError && (
              <p className="text-xs text-rose-600 dark:text-rose-400 font-bold mt-1">
                {uploadError}
              </p>
            )}
          </div>

          <div className="flex items-center justify-center gap-2 text-[11px] text-chonky-muted dark:text-gray-400 pt-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Our kitchen verifies transfer slips in real-time</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-chonky-border dark:border-white/10 bg-white/95 dark:bg-[#0c0606]/95 backdrop-blur-xl shrink-0 pb-[max(1.25rem,env(safe-area-inset-bottom,16px))] sm:pb-5">
          <button
            type="button"
            onClick={handleContinue}
            className="w-full h-[52px] sm:h-[56px] px-6 rounded-full bg-chonky-red hover:bg-chonky-red-light text-white font-black text-sm sm:text-base flex items-center justify-between transition-all transform active:scale-98 shadow-glow-red"
          >
            <span>{previewUrl ? 'Slip Attached · Continue' : 'Continue with Transfer'}</span>
            <div className="flex items-center gap-2">
              <span className="font-black text-base sm:text-lg">MVR {total}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </div>
          </button>
        </div>

      </div>
    </div>
  );
};
