// src/components/ui/AdModal.jsx
import React, { useEffect, useState } from "react";
import Modal from "./Modal";
import { useTranslation } from "react-i18next";

const AdModal = ({ ad, isOpen, onClose }) => {
  const [canClose, setCanClose] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (!isOpen) return;

    setCanClose(false);
    const timer = setTimeout(() => setCanClose(true), 5000);
    return () => clearTimeout(timer);
  }, [isOpen]);

  if (!ad) return null;

  const handleAdClick = () => {
    if (ad.url) window.open(ad.url, "_blank");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={canClose ? onClose : undefined}
      title={t("ads.sponsored")}
    >
      <div className="flex flex-col items-center gap-2">
        <div
          className="w-full max-w-sm rounded-xl overflow-hidden bg-[#0f1b2e] shadow-lg cursor-pointer"
          onClick={handleAdClick}
        >
          {/* IMAGEM */}
          <div className="relative w-full h-56">
            <img
              src={ad.image}
              alt={ad.title}
              className="w-full h-full object-cover"
            />

            <span className="absolute top-2 left-2 bg-black/50 text-white text-[10px] px-2 py-1 rounded">
              {t("ads.sponsored")}
            </span>
          </div>

          {/* TEXTO */}
          <div className="p-4">
            <h3 className="text-white font-bold text-lg">{ad.title}</h3>
            <p className="text-gray-300 text-sm mt-1">{ad.subtitle}</p>
          </div>
        </div>

        {!canClose && (
          <div className="text-center text-gray-400 text-xs">
            {t("ads.wait")}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default AdModal;
