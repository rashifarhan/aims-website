import type { SVGProps } from "react";

/** Line icons on a 24px grid, 1.75 stroke (Design Doc ch. 7). Decorative by default. */
function Icon({ children, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export const SearchIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </Icon>
);
export const MenuIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M4 8h16M4 16h16" />
  </Icon>
);
export const CloseIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Icon>
);
export const ChevronDownIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="m6 9 6 6 6-6" />
  </Icon>
);
export const ArrowIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p} className={`rtl:-scale-x-100 ${p.className ?? ""}`}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Icon>
);
export const PhoneIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
  </Icon>
);
export const MailIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </Icon>
);
export const PinIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12Z" />
    <circle cx="12" cy="9" r="2.5" />
  </Icon>
);
export const ListIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" />
  </Icon>
);
/** WhatsApp glyph (filled). */
export const WhatsAppIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 32 32" width="20" height="20" fill="currentColor" aria-hidden="true" focusable="false" {...p}>
    <path d="M16 3a13 13 0 0 0-11.2 19.6L3 29l6.6-1.7A13 13 0 1 0 16 3Zm0 23.6c-2 0-4-.6-5.7-1.6l-.4-.2-3.9 1 1-3.8-.3-.4A10.6 10.6 0 1 1 16 26.6Zm5.8-7.9c-.3-.2-1.9-.9-2.2-1-.3-.1-.5-.2-.7.2l-1 1.2c-.2.2-.4.2-.7.1a8.7 8.7 0 0 1-4.3-3.8c-.3-.5.3-.5.9-1.6.1-.2 0-.4 0-.5l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.2 5.1 4.5 1.9.8 2.6.9 3.6.7.6-.1 1.9-.8 2.1-1.5.3-.7.3-1.3.2-1.5l-.1-.1Z" />
  </svg>
);
/** Filled, for ratings; the stroke family has no star (Design Doc 7). */
export const StarIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon fill="currentColor" stroke="none" {...p}>
    <path d="m12 2.8 2.83 5.73 6.32.92-4.57 4.46 1.08 6.3L12 17.24l-5.66 2.97 1.08-6.3-4.57-4.46 6.32-.92L12 2.8Z" />
  </Icon>
);
/* Step icons for JourneySteps (ui/JourneySteps.tsx): one per kind of step, on the same 24px line grid. */
export const ChatIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M4.5 5h15a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H10l-4.5 3.5V16h-1a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" />
    <path d="M8 9.5h8M8 12.5h5" />
  </Icon>
);
export const DocumentIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M6.5 3h8l4 4v13a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
    <path d="M14.5 3v4h4M9 12h6.5M9 16h4.5" />
  </Icon>
);
export const TruckIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p} className={`rtl:-scale-x-100 ${p.className ?? ""}`}>
    <path d="M2.5 6.5h11V16h-11ZM13.5 9.5h4l3 3.2V16h-7" />
    <circle cx="6.5" cy="17.5" r="1.8" />
    <circle cx="17" cy="17.5" r="1.8" />
  </Icon>
);
export const ToolIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M14.7 3.6a4.5 4.5 0 0 0-4.4 5.9l-6.7 6.7a1.9 1.9 0 0 0 0 2.7l1.5 1.5a1.9 1.9 0 0 0 2.7 0l6.7-6.7a4.5 4.5 0 0 0 5.9-4.4l-2.8 2.8-3-.8-.8-3Z" />
  </Icon>
);
export const SlidersIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
    <circle cx="15" cy="7" r="2" />
    <circle cx="9" cy="17" r="2" />
  </Icon>
);
export const HeadsetIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M4.5 14v-2a7.5 7.5 0 0 1 15 0v2" />
    <rect x="3.5" y="13.5" width="4" height="6.5" rx="1.5" />
    <rect x="16.5" y="13.5" width="4" height="6.5" rx="1.5" />
    <path d="M18.5 20c0 1-1.5 1.5-4 1.5" />
  </Icon>
);
export const ShieldIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M12 3 5 6v5.5c0 4.4 3 8.2 7 9.5 4-1.3 7-5.1 7-9.5V6Z" />
    <path d="m9 12 2.2 2.2L15.5 10" />
  </Icon>
);
export const KeyIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <circle cx="8" cy="15" r="4" />
    <path d="m10.8 12.2 8.7-8.7M16 7l2.5 2.5M13.5 9.5 15.5 11.5" />
  </Icon>
);
