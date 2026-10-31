package com.hayat.kutubkhanah_webapp.web;

import com.hayat.kutubkhanah_webapp.services.SecurityHelper;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ModelAttribute;

/** Puts the signed-in user (or null) into every page model as {@code currentUser}. */
@ControllerAdvice
class CurrentUserAdvice {
    private final SecurityHelper securityHelper;

    CurrentUserAdvice(SecurityHelper securityHelper) {
        this.securityHelper = securityHelper;
    }

    @ModelAttribute("currentUser")
    SecurityHelper.CurrentUser currentUser() {
        return securityHelper.getCurrentUser();
    }
}
