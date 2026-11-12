import type { SVGProps } from 'react';

/**
 * The Dusk Aviary icon set, traced from the Figma file ("Dusk Aviary UI").
 *
 * The exported SVGs carry a baked-in stroke colour. They are inlined here with
 * `currentColor` instead so one icon can be petrol when active and ash when
 * not, which a static file cannot do.
 */
type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const make = (viewBox: number, strokeWidth: number, d: string) =>
  function DuskIcon({ size = 24, ...rest }: IconProps) {
    return (
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${viewBox} ${viewBox}`}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        {...rest}
      >
        <path d={d} />
      </svg>
    );
  };

export const CoopIcon = make(22, 1.65, 'M3.66669 10.5417L11 3.66667L18.3334 10.5417V18.3333C18.3334 18.5765 18.2368 18.8096 18.0649 18.9815C17.893 19.1534 17.6598 19.25 17.4167 19.25H12.8334V13.75H9.16669V19.25H4.58335C4.34024 19.25 4.10708 19.1534 3.93517 18.9815C3.76326 18.8096 3.66669 18.5765 3.66669 18.3333V10.5417Z');
export const MessagesIcon = make(22, 1.65, 'M3.66669 4.58333H18.3334V14.6667H7.33335L3.66669 18.3333V4.58333Z');
export const SendIcon = make(22, 1.65, 'M11 2.75V19.25M2.75 11H19.25');
export const JournalIcon = make(22, 1.65, 'M4.58331 3.66667H14.6666C15.396 3.66667 16.0955 3.9564 16.6112 4.47213C17.1269 4.98785 17.4166 5.68733 17.4166 6.41667V18.3333H7.33331C6.91526 18.092 6.44104 17.9649 5.95831 17.9649C5.47559 17.9649 5.00137 18.092 4.58331 18.3333V3.66667Z');
export const BackIcon = make(24, 1.75, 'M15 5L8 12L15 19');
export const WindIcon = make(24, 1.75, 'M3 8H15C15.5933 8 16.1734 7.82405 16.6667 7.49441C17.1601 7.16477 17.5446 6.69623 17.7716 6.14805C17.9987 5.59987 18.0581 4.99667 17.9424 4.41473C17.8266 3.83279 17.5409 3.29824 17.1213 2.87868C16.7018 2.45912 16.1672 2.1734 15.5853 2.05765C15.0033 1.94189 14.4001 2.0013 13.8519 2.22836C13.3038 2.45543 12.8352 2.83994 12.5056 3.33329C12.1759 3.82664 12 4.40666 12 5M3 12H19C19.5933 12 20.1734 12.1759 20.6667 12.5056C21.1601 12.8352 21.5446 13.3038 21.7716 13.852C21.9987 14.4001 22.0581 15.0033 21.9424 15.5853C21.8266 16.1672 21.5409 16.7018 21.1213 17.1213C20.7018 17.5409 20.1672 17.8266 19.5853 17.9424C19.0033 18.0581 18.4001 17.9987 17.8519 17.7716C17.3038 17.5446 16.8352 17.1601 16.5056 16.6667C16.1759 16.1734 16 15.5933 16 15M3 16H9');

const RECEIPT_PATHS = {
  sending: 'M12 3V7M12 17V21M3 12H7M17 12H21M5.6 5.6L8.4 8.4M15.6 15.6L18.4 18.4M5.6 18.4L8.4 15.6M15.6 8.4L18.4 5.6',
  sent: 'M4 12L9 17L20 6',
  delivered: 'M2 12L6 16L16 6M10 14L12 16L22 6',
  read: 'M12 6C6 6 2 12 2 12C2 12 6 18 12 18C18 18 22 12 22 12C22 12 18 6 12 6Z',
} as const;

export type ReceiptStatus = keyof typeof RECEIPT_PATHS;

const RECEIPT_LABEL: Record<ReceiptStatus, string> = {
  sending: 'Sending',
  sent: 'Sent',
  delivered: 'Delivered',
  read: 'Read',
};

/** Message receipt. Colour comes from the parent so it reads on any bubble. */
export const ReceiptIcon = ({ status, size = 14 }: { status: ReceiptStatus; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    role="img"
    aria-label={RECEIPT_LABEL[status]}
  >
    <path d={RECEIPT_PATHS[status]} />
    {status === 'read' && <circle cx="12" cy="12" r="2.5" />}
  </svg>
);
