package com.pigeon.messenger.util;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class PhoneNumbersTest {

    @Test
    void normalisesTheCommonWrittenForms() {
        assertEquals("3055550178", PhoneNumbers.nationalDigits("(305) 555-0178"));
        assertEquals("3055550178", PhoneNumbers.nationalDigits("305.555.0178"));
        assertEquals("3055550178", PhoneNumbers.nationalDigits("+1 305 555 0178"));
        assertEquals("3055550178", PhoneNumbers.nationalDigits("13055550178"));
    }

    @Test
    void rejectsAreaAndExchangeCodesNanpForbids() {
        // The old demo seed used numbers like these, so no demo account could
        // ever be routed to.
        assertNull(PhoneNumbers.nationalDigits("+0987654321"));
        assertNull(PhoneNumbers.nationalDigits("1112223333"));
    }

    @Test
    void rejectsWrongLengthInput() {
        assertNull(PhoneNumbers.nationalDigits("5550178"));
        assertNull(PhoneNumbers.nationalDigits("305555017812345"));
        assertNull(PhoneNumbers.nationalDigits(""));
        assertNull(PhoneNumbers.nationalDigits(null));
    }

    @Test
    void producesCanonicalE164() {
        assertEquals("+13055550178", PhoneNumbers.toE164("(305) 555-0178"));
        assertNull(PhoneNumbers.toE164("nonsense"));
    }

    @Test
    void differentWrittenFormsOfOneNumberAgree() {
        String a = PhoneNumbers.nationalDigits("(305) 555-0178");
        String b = PhoneNumbers.nationalDigits("+13055550178");
        assertEquals(a, b, "recipient lookup depends on these matching");
    }
}
