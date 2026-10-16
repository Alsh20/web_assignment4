document.addEventListener("DOMContentLoaded", () => {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".navbar-nav .nav-link").forEach((link) => {
    if (link.getAttribute("href") === currentPage) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    }
  });

  document.querySelectorAll("[data-demo-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const status = form.querySelector(".form-status");
      if (!status) return;
      status.textContent = form.dataset.successMessage || "Form submitted successfully.";
      status.hidden = false;
      status.classList.remove("is-error");
    });
  });

  document.querySelectorAll("[data-validate-form]").forEach((form) => {
    const fields = [...form.querySelectorAll("[data-validate]")];
    const radioGroups = [...form.querySelectorAll("[data-radio-group]")];
    const status = form.querySelector(".form-status");
    let attempted = false;

    const updateStatus = () => {
      if (!attempted || !status) return;
      const radiosValid = radioGroups.every((group) => group.querySelector('input[type="radio"]:checked'));
      const valid = form.checkValidity() && radiosValid;
      status.textContent = valid
        ? (form.dataset.successMessage || "Form is valid.")
        : "Please review the highlighted fields and try again.";
      status.classList.toggle("is-error", !valid);
      status.hidden = false;
    };

    const updatePasswordMatch = () => {
      fields.filter((field) => field.dataset.passwordConfirm).forEach((confirmField) => {
        const original = form.querySelector(confirmField.dataset.passwordConfirm);
        const shouldCheck = confirmField.value.length > 0 || confirmField.dataset.touched === "true" || attempted;
        confirmField.setCustomValidity(shouldCheck && original && confirmField.value !== original.value ? "Passwords must match." : "");
      });
    };

    const updateField = (field, force = false) => {
      if (field.dataset.passwordSource) updatePasswordMatch();
      if (field.dataset.passwordConfirm) updatePasswordMatch();
      const shouldShow = force || attempted || field.dataset.touched === "true";
      if (!shouldShow) return;
      const valid = field.checkValidity();
      field.classList.toggle("is-valid", valid);
      field.classList.toggle("is-invalid", !valid);
      field.setAttribute("aria-invalid", String(!valid));

      const feedback = field.parentElement.querySelector(".invalid-feedback");
      if (feedback && !valid) {
        feedback.textContent = field.validity.valueMissing
          ? (field.dataset.requiredMessage || "This field is required.")
          : (field.dataset.invalidMessage || "Please check this field.");
      }
    };

    const updateRadioGroup = (group, force = false) => {
      const radios = [...group.querySelectorAll('input[type="radio"]')];
      const feedback = group.querySelector("[data-group-feedback]");
      const shouldShow = force || attempted || group.dataset.touched === "true";
      if (!shouldShow || !radios.length) return true;
      const valid = radios.some((radio) => radio.checked);
      radios.forEach((radio) => {
        radio.classList.toggle("is-invalid", !valid);
        radio.classList.toggle("is-valid", valid && radio.checked);
        radio.setAttribute("aria-invalid", String(!valid));
      });
      if (feedback) feedback.classList.toggle("d-block", !valid);
      return valid;
    };

    fields.forEach((field) => {
      field.addEventListener("input", () => {
        field.dataset.touched = "true";
        updateField(field);
        fields.filter((other) => other.dataset.passwordConfirm).forEach((confirmField) => {
          if (confirmField.value) updateField(confirmField);
        });
        updateStatus();
      });
      field.addEventListener("change", () => {
        field.dataset.touched = "true";
        updateField(field);
      });
      field.addEventListener("blur", () => {
        field.dataset.touched = "true";
        updateField(field);
      });
    });

    radioGroups.forEach((group) => {
      group.querySelectorAll('input[type="radio"]').forEach((radio) => {
        radio.addEventListener("change", () => {
          group.dataset.touched = "true";
          updateRadioGroup(group);
          updateStatus();
        });
      });
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      attempted = true;
      updatePasswordMatch();
      fields.forEach((field) => updateField(field, true));
      const radiosValid = radioGroups.every((group) => updateRadioGroup(group, true));
      const valid = form.checkValidity() && radiosValid;
      updateStatus();
      if (valid) form.classList.add("was-validated");
    });

    form.addEventListener("reset", () => {
      window.setTimeout(() => {
        attempted = false;
        form.classList.remove("was-validated");
        if (status) status.hidden = true;
        fields.forEach((field) => {
          delete field.dataset.touched;
          field.classList.remove("is-valid", "is-invalid");
          field.removeAttribute("aria-invalid");
          field.setCustomValidity("");
        });
        radioGroups.forEach((group) => {
          delete group.dataset.touched;
          group.querySelectorAll(".form-check-input").forEach((radio) => {
            radio.classList.remove("is-valid", "is-invalid");
            radio.removeAttribute("aria-invalid");
          });
          group.querySelector("[data-group-feedback]")?.classList.remove("d-block");
        });
      }, 0);
    });
  });
});
