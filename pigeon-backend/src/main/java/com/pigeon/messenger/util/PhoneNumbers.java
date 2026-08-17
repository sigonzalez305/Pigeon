package com.pigeon.messenger.util;

/** Phone-number normalisation shared by lookup and storage. */
public final class PhoneNumbers {

    private PhoneNumbers() {
    }

    /**
     * Reduces any user-typed form to the 10-digit national number, dropping a
     * leading NANP country code. Returns null when the input cannot be a NANP
     * number, so callers can reject it rather than storing something unroutable.
     */
    public static String nationalDigits(String raw) {
        if (raw == null) return null;
        String digits = raw.replaceAll("\\D", "");
        if (digits.length() == 11 && digits.startsWith("1")) {
            digits = digits.substring(1);
        }
        if (digits.length() != 10) return null;
        // NANP area codes and exchange codes never begin with 0 or 1.
        if (digits.charAt(0) < '2' || digits.charAt(3) < '2') return null;
        return digits;
    }

    /** Canonical E.164 form for storage and display. */
    public static String toE164(String raw) {
        String national = nationalDigits(raw);
        return national == null ? null : "+1" + national;
    }
}
