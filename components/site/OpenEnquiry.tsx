"use client";

import { ArrowRightIcon } from "@phosphor-icons/react";
import { useContactModal } from "./ModalProvider";

/** The site's one "contact" CTA. Same label everywhere (nav, hero, banners)
 *  so there is a single, recognisable action. Opens the enquiry modal. */
export const ENQUIRY_LABEL = "Book free counselling";

export default function OpenEnquiry({
  className = "btn btn-primary",
  label = ENQUIRY_LABEL,
  presetEntry,
  arrow = true,
}: {
  className?: string;
  label?: string;
  presetEntry?: string;
  arrow?: boolean;
}) {
  const { open } = useContactModal();
  return (
    <button type="button" onClick={() => open(presetEntry)} className={`group ${className}`}>
      {label}
      {arrow && <ArrowRightIcon size={18} weight="bold" className="arrow" />}
    </button>
  );
}
