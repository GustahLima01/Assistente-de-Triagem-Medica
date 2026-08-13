const state = {
  token: localStorage.getItem("triage.token") || "",
  user: loadStoredUser(),
  theme: loadStoredTheme(),
  route: "dashboard",
  triageDraft: {
    patient: null,
    symptoms: [],
    consultResult: null,
    triage: null,
    consultPending: false,
    consultError: ""
  },
  collections: {
    patients: [],
    dashboardPatients: [],
    doctors: [],
    symptoms: [],
    triageSymptoms: [],
    users: [],
    triages: [],
    appointments: [],
    dashboardAppointments: []
  },
  capabilityWarnings: {
    doctors: "",
    symptoms: ""
  }
};

const pageMeta = {
  dashboard: "Acompanhe pacientes em atendimento e a agenda mais recente da recepção.",
  patients: "Gerencie o cadastro de pacientes com filtros simples e acoes rapidas.",
  triage: "Conduza a triagem em etapas com foco em clareza, prioridade e encaminhamento.",
  appointments: "Consulte a agenda, valide horarios e confirme novos agendamentos.",
  doctors: "Mantenha a base de médicos alinhada à especialidade e disponibilidade.",
  symptoms: "Administre a base de sintomas usada na triagem e na sugestão de especialidade.",
  users: "Controle acesso, perfil e status dos usuários da clínica."
};

const DEFAULT_DOCTOR_QUERY = {
  includeInactive: true
};

pageMeta.patients = "Gerencie o cadastro de pacientes com filtros simples e ações rápidas.";
pageMeta.appointments = "Consulte a agenda, valide horários e confirme novos agendamentos.";

const CUSTOM_PICKER_FIELDS = ["patient-birthdate", "appointment-filter-from", "appointment-filter-to", "appointment-scheduled-at"];

const customPickerState = {
  activeInputId: "",
  mode: "date",
  viewDate: null,
  selectedDate: null,
  stage: "date"
};

const FORM_PANEL_CONFIG = {
  patient: {
    panelId: "patient-form-panel",
    emptyStateId: "patient-form-empty-state",
    firstFieldId: "patient-name"
  },
  appointment: {
    panelId: "appointment-form-panel",
    emptyStateId: "appointment-form-empty-state",
    firstFieldId: "appointment-patient-id"
  },
  doctor: {
    panelId: "doctor-form-panel",
    emptyStateId: "doctor-form-empty-state",
    firstFieldId: "doctor-name"
  },
  symptom: {
    panelId: "symptom-form-panel",
    emptyStateId: "symptom-form-empty-state",
    firstFieldId: "symptom-name"
  },
  user: {
    panelId: "user-form-panel",
    emptyStateId: "user-form-empty-state",
    firstFieldId: "user-name"
  }
};

document.addEventListener("DOMContentLoaded", () => {
  applyTheme(state.theme);
  bindLoginEvents();
  bindShellEvents();

  if (state.token && state.user) {
    bootstrapExistingSession();
    return;
  }

  showLogin();
});

function loadStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("triage.user") || "null");
  } catch (error) {
    return null;
  }
}

function bindLoginEvents() {
  document.getElementById("login-form").addEventListener("submit", handleLogin);
}

function bindShellEvents() {
  const bindingErrors = [];

  const bind = (id, eventName, handler) => {
    const element = document.getElementById(id);
    if (!element) {
      bindingErrors.push(`Elemento não encontrado: #${id}`);
      return;
    }

    element.addEventListener(eventName, handler);
  };

  document.getElementById("logout-button").addEventListener("click", handleLogout);

  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => navigate(link.dataset.route));
  });
  document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
    button.addEventListener("click", toggleTheme);
  });

  bind("dashboard-patient-search-form", "submit", (event) => {
    event.preventDefault();
    handleDashboardSearch();
  });
  bind("dashboard-go-triage", "click", () => navigate("triage"));
  bind("dashboard-go-appointments", "click", () => navigate("appointments"));

  bind("patient-filter-form", "submit", handlePatientFilterSubmit);
  bind("patient-filter-reset", "click", resetPatientFilters);
  bind("patient-new-button", "click", openPatientCreateForm);
  bind("patient-cancel-button", "click", closePatientForm);
  bind("patient-form", "submit", handlePatientFormSubmit);
  initializeCustomDatePickers();

  bind("triage-open-patients", "click", () => navigate("patients"));
  bind("triage-open-patient-form", "click", () => {
    navigate("patients");
    openPatientCreateForm();
  });
  bind("triage-patient-id", "change", handleTriagePatientChange);
  bind("triage-reload-symptoms", "click", () => loadSymptomsForTriage());
  bind("triage-symptom-filter-form", "submit", (event) => {
    event.preventDefault();
    loadSymptomsForTriage();
  });
  bind("triage-symptom-filter-reset", "click", resetTriageSymptomFilters);
  bind("triage-consult-button", "click", handleTriageConsult);

  bind("appointment-filter-form", "submit", handleAppointmentFilterSubmit);
  bind("appointment-filter-reset", "click", resetAppointmentFilters);
  bind("appointment-new-button", "click", openAppointmentCreateForm);
  bind("appointment-cancel-button", "click", closeAppointmentForm);
  bind("appointment-form", "submit", handleAppointmentFormSubmit);
  bind("appointment-patient-id", "change", handleAppointmentPatientChange);
  bind("appointment-triage-id", "change", handleAppointmentTriageChange);
  bind("appointment-scheduled-at", "focus", syncAppointmentDateConstraints);
  bind("appointment-scheduled-at", "change", () => {
    hideInlineError("appointment-form-error");
  });
  bind("appointment-filter-from", "change", syncAppointmentDateConstraints);
  bind("appointment-filter-to", "change", syncAppointmentDateConstraints);

  bind("doctor-filter-form", "submit", handleDoctorFilterSubmit);
  bind("doctor-filter-reset", "click", resetDoctorFilters);
  bind("doctor-new-button", "click", openDoctorCreateForm);
  bind("doctor-cancel-button", "click", closeDoctorForm);
  bind("doctor-form", "submit", handleDoctorFormSubmit);

  bind("symptom-filter-form", "submit", handleSymptomFilterSubmit);
  bind("symptom-filter-reset", "click", resetSymptomFilters);
  bind("symptom-new-button", "click", openSymptomCreateForm);
  bind("symptom-cancel-button", "click", closeSymptomForm);
  bind("symptom-form", "submit", handleSymptomFormSubmit);

  bind("user-new-button", "click", openUserCreateForm);
  bind("user-cancel-button", "click", closeUserForm);
  bind("user-form", "submit", handleUserFormSubmit);

  if (bindingErrors.length > 0) {
    console.warn("Falhas de binding ignoradas na inicialização:", bindingErrors);
  }
}

function bindCalendarWheelControls() {
  document.querySelectorAll("[data-calendar-wheel='month']").forEach((input) => {
    input.addEventListener(
      "wheel",
      (event) => {
        if (!input.matches(":focus")) {
          return;
        }

        event.preventDefault();
        shiftCalendarMonth(input, event.deltaY > 0 ? 1 : -1);
      },
      { passive: false }
    );
  });
}

function initializeCustomDatePickers() {
  ensureCustomDatePickerElement();

  document.querySelectorAll("[data-picker-mode]").forEach((input) => {
    input.dataset.isoValue = input.dataset.isoValue || "";
    syncCustomPickerInput(input);

    input.addEventListener("click", () => openCustomDatePicker(input));
    input.addEventListener("focus", () => openCustomDatePicker(input));
    input.addEventListener("input", () => handleCustomPickerTextInput(input));
    input.addEventListener("blur", () => handleCustomPickerTextBlur(input));
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        handleCustomPickerTextBlur(input);
        closeCustomDatePicker();
        return;
      }

      if (event.key === " " || event.key === "ArrowDown") {
        event.preventDefault();
        openCustomDatePicker(input);
      }
    });
  });

  document.addEventListener("click", handleCustomDatePickerDocumentClick);
  document.addEventListener("keydown", handleCustomDatePickerDocumentKeydown);
  window.addEventListener("resize", closeCustomDatePicker);
}

function ensureCustomDatePickerElement() {
  if (document.getElementById("custom-date-picker")) {
    return;
  }

  const picker = document.createElement("div");
  picker.id = "custom-date-picker";
  picker.className = "custom-date-picker is-hidden";
  picker.innerHTML = `
    <div class="custom-date-picker__surface">
      <div class="custom-date-picker__header">
        <button class="button is-small is-light" type="button" data-picker-prev aria-label="Mês anterior">Anterior</button>
        <div class="custom-date-picker__month" data-picker-month></div>
        <button class="button is-small is-light" type="button" data-picker-next aria-label="Próximo mês">Próximo</button>
      </div>
      <div class="custom-date-picker__weekdays" data-picker-weekdays></div>
      <div class="custom-date-picker__days" data-picker-days></div>
      <div class="custom-date-picker__time is-hidden" data-picker-time>
        <div class="custom-date-picker__time-column">
          <p class="custom-date-picker__time-label">Hora</p>
          <div class="custom-date-picker__time-list" data-picker-hours></div>
        </div>
        <div class="custom-date-picker__time-column">
          <p class="custom-date-picker__time-label">Minuto</p>
          <div class="custom-date-picker__time-list" data-picker-minutes></div>
        </div>
      </div>
      <div class="custom-date-picker__footer">
        <button class="button is-small is-light" type="button" data-picker-clear>Limpar</button>
        <button class="button is-small is-light" type="button" data-picker-today>Hoje</button>
        <button class="button is-small is-primary is-hidden" type="button" data-picker-apply>OK</button>
      </div>
    </div>
  `;

  document.body.appendChild(picker);

  picker.addEventListener("mousedown", (event) => {
    event.preventDefault();
  });

  picker.addEventListener("click", (event) => {
    event.stopPropagation();
  });

  picker.querySelector("[data-picker-prev]").addEventListener("click", () => {
    customPickerState.viewDate = createShiftedDate(
      customPickerState.viewDate.getFullYear(),
      customPickerState.viewDate.getMonth() + 1,
      customPickerState.viewDate.getDate(),
      -1,
      customPickerState.viewDate.getHours(),
      customPickerState.viewDate.getMinutes()
    );
    renderCustomDatePicker();
  });

  picker.querySelector("[data-picker-next]").addEventListener("click", () => {
    customPickerState.viewDate = createShiftedDate(
      customPickerState.viewDate.getFullYear(),
      customPickerState.viewDate.getMonth() + 1,
      customPickerState.viewDate.getDate(),
      1,
      customPickerState.viewDate.getHours(),
      customPickerState.viewDate.getMinutes()
    );
    renderCustomDatePicker();
  });

  picker.querySelector("[data-picker-clear]").addEventListener("click", () => {
    const input = getActiveCustomPickerInput();
    if (!input) {
      return;
    }

    setCustomPickerValue(input, "");
    closeCustomDatePicker();
  });

  picker.querySelector("[data-picker-today]").addEventListener("click", () => {
    const input = getActiveCustomPickerInput();
    if (!input) {
      return;
    }

    const now = new Date();
    const selectedDate =
      input.dataset.pickerMode === "datetime"
        ? new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), 0, 0)
        : new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (!isSelectableForInput(input, selectedDate)) {
      return;
    }

    customPickerState.selectedDate = selectedDate;
    customPickerState.viewDate = new Date(selectedDate);

    if (input.dataset.pickerMode === "date") {
      commitCustomPickerSelection(input, true);
      return;
    }

    customPickerState.stage = "time";
    renderCustomDatePicker();
  });

  picker.querySelector("[data-picker-apply]").addEventListener("click", () => {
    const input = getActiveCustomPickerInput();
    if (!input || !customPickerState.selectedDate) {
      return;
    }

    commitCustomPickerSelection(input, true);
  });

  const monthZone = picker.querySelector("[data-picker-month]");
  const daysZone = picker.querySelector("[data-picker-days]");

  [monthZone, daysZone].forEach((element) => {
    element.addEventListener(
      "wheel",
      (event) => {
        event.preventDefault();
        const direction = event.deltaY > 0 ? 1 : -1;
        customPickerState.viewDate = createShiftedDate(
          customPickerState.viewDate.getFullYear(),
          customPickerState.viewDate.getMonth() + 1,
          customPickerState.viewDate.getDate(),
          direction,
          customPickerState.viewDate.getHours(),
          customPickerState.viewDate.getMinutes()
        );
        renderCustomDatePicker();
      },
      { passive: false }
    );
  });
}

function getActiveCustomPickerInput() {
  return customPickerState.activeInputId ? document.getElementById(customPickerState.activeInputId) : null;
}

function openCustomDatePicker(input) {
  const mode = input.dataset.pickerMode || "date";
  const currentValue = getCustomPickerValue(input);
  const baseDate = parsePickerIsoValue(currentValue, mode) || defaultPickerDate(mode);

  customPickerState.activeInputId = input.id;
  customPickerState.mode = mode;
  customPickerState.selectedDate = new Date(baseDate);
  customPickerState.viewDate = new Date(baseDate);
  customPickerState.stage = "date";

  positionCustomDatePicker(input);
  renderCustomDatePicker();
  document.getElementById("custom-date-picker").classList.remove("is-hidden");
}

function closeCustomDatePicker() {
  const picker = document.getElementById("custom-date-picker");
  if (!picker) {
    return;
  }

  picker.classList.add("is-hidden");
  customPickerState.activeInputId = "";
  customPickerState.stage = "date";
}

function positionCustomDatePicker(input) {
  const picker = document.getElementById("custom-date-picker");
  const rect = input.getBoundingClientRect();
  const top = rect.bottom + window.scrollY + 8;
  const left = rect.left + window.scrollX;

  picker.style.top = `${top}px`;
  picker.style.left = `${left}px`;
}

function renderCustomDatePicker() {
  const picker = document.getElementById("custom-date-picker");
  const input = getActiveCustomPickerInput();

  if (!picker || !input || !customPickerState.viewDate) {
    return;
  }

  const monthLabel = picker.querySelector("[data-picker-month]");
  const header = picker.querySelector(".custom-date-picker__header");
  const weekdays = picker.querySelector("[data-picker-weekdays]");
  const days = picker.querySelector("[data-picker-days]");
  const timePanel = picker.querySelector("[data-picker-time]");
  const applyButton = picker.querySelector("[data-picker-apply]");
  const clearButton = picker.querySelector("[data-picker-clear]");
  const todayButton = picker.querySelector("[data-picker-today]");

  monthLabel.textContent = formatMonthYear(customPickerState.viewDate);
  weekdays.innerHTML = ["D", "S", "T", "Q", "Q", "S", "S"]
    .map((weekday) => `<span class="custom-date-picker__weekday">${weekday}</span>`)
    .join("");
  days.innerHTML = buildCustomDatePickerDays(input);

  days.querySelectorAll("[data-picker-day]").forEach((button) => {
    button.addEventListener("click", () => handleCustomDateSelection(Number(button.dataset.pickerDay)));
  });

  const isDateTime = input.dataset.pickerMode === "datetime";
  const showTime = isDateTime && customPickerState.stage === "time";
  header.classList.toggle("is-hidden", showTime);
  monthLabel.classList.toggle("is-hidden", false);
  weekdays.classList.toggle("is-hidden", showTime);
  days.classList.toggle("is-hidden", showTime);
  timePanel.classList.toggle("is-hidden", !showTime);
  applyButton.classList.toggle("is-hidden", !showTime);
  clearButton.classList.toggle("is-hidden", showTime);
  todayButton.classList.toggle("is-hidden", showTime);

  if (showTime) {
    renderCustomDatePickerTime(input);
  }
}

function buildCustomDatePickerDays(input) {
  const year = customPickerState.viewDate.getFullYear();
  const monthIndex = customPickerState.viewDate.getMonth();
  const firstDay = new Date(year, monthIndex, 1).getDay();
  const lastDay = new Date(year, monthIndex + 1, 0).getDate();
  const selectedDate = customPickerState.selectedDate;
  const today = new Date();
  const cells = [];

  for (let index = 0; index < firstDay; index += 1) {
    cells.push(`<span class="custom-date-picker__day-placeholder"></span>`);
  }

  for (let day = 1; day <= lastDay; day += 1) {
    const cellDate = new Date(
      year,
      monthIndex,
      day,
      selectedDate?.getHours() || 0,
      selectedDate?.getMinutes() || 0,
      0,
      0
    );
    const isSelected =
      selectedDate &&
      selectedDate.getFullYear() === year &&
      selectedDate.getMonth() === monthIndex &&
      selectedDate.getDate() === day;
    const isToday =
      today.getFullYear() === year && today.getMonth() === monthIndex && today.getDate() === day;
    const isDisabled = !isSelectableForInput(input, cellDate);

    cells.push(`
      <button
        class="custom-date-picker__day${isSelected ? " is-selected" : ""}${isToday ? " is-today" : ""}"
        type="button"
        data-picker-day="${day}"
        ${isDisabled ? "disabled" : ""}
      >
        ${day}
      </button>
    `);
  }

  return cells.join("");
}

function renderCustomDatePickerTime(input) {
  const picker = document.getElementById("custom-date-picker");
  const hoursContainer = picker.querySelector("[data-picker-hours]");
  const minutesContainer = picker.querySelector("[data-picker-minutes]");
  const selectedDate = customPickerState.selectedDate || defaultPickerDate("datetime");

  hoursContainer.innerHTML = Array.from({ length: 24 }, (_, hour) => {
    const label = String(hour).padStart(2, "0");
    const isSelected = selectedDate.getHours() === hour;
    return `<button class="custom-date-picker__time-option${isSelected ? " is-selected" : ""}" type="button" data-picker-hour="${hour}">${label}</button>`;
  }).join("");

  minutesContainer.innerHTML = Array.from({ length: 60 }, (_, minute) => {
    const label = String(minute).padStart(2, "0");
    const isSelected = selectedDate.getMinutes() === minute;
    return `<button class="custom-date-picker__time-option${isSelected ? " is-selected" : ""}" type="button" data-picker-minute="${minute}">${label}</button>`;
  }).join("");

  hoursContainer.querySelectorAll("[data-picker-hour]").forEach((button) => {
    button.addEventListener("click", () => updateCustomPickerTimePart(input, "hours", Number(button.dataset.pickerHour)));
  });
  minutesContainer.querySelectorAll("[data-picker-minute]").forEach((button) => {
    button.addEventListener("click", () => updateCustomPickerTimePart(input, "minutes", Number(button.dataset.pickerMinute)));
  });

  attachCustomPickerTimeWheel(input, hoursContainer, "hours");
  attachCustomPickerTimeWheel(input, minutesContainer, "minutes");
  scrollSelectedTimeIntoView(hoursContainer);
  scrollSelectedTimeIntoView(minutesContainer);
}

function attachCustomPickerTimeWheel(input, container, part) {
  container.onwheel = (event) => {
    event.preventDefault();
    const direction = event.deltaY > 0 ? 1 : -1;
    const currentValue = part === "hours" ? customPickerState.selectedDate.getHours() : customPickerState.selectedDate.getMinutes();
    const max = part === "hours" ? 23 : 59;
    const nextValue = Math.min(max, Math.max(0, currentValue + direction));
    updateCustomPickerTimePart(input, part, nextValue);
  };
}

function updateCustomPickerTimePart(input, part, value) {
  if (!customPickerState.selectedDate) {
    customPickerState.selectedDate = defaultPickerDate("datetime");
  }

  const candidate = new Date(customPickerState.selectedDate);
  if (part === "hours") {
    candidate.setHours(value);
  } else {
    candidate.setMinutes(value);
  }

  if (!isSelectableForInput(input, candidate)) {
    return;
  }

  customPickerState.selectedDate = candidate;
  renderCustomDatePicker();
}

function handleCustomDateSelection(day) {
  const input = getActiveCustomPickerInput();
  if (!input) {
    return;
  }

  const selectedDate = customPickerState.selectedDate || defaultPickerDate(input.dataset.pickerMode);
  const candidate = new Date(
    customPickerState.viewDate.getFullYear(),
    customPickerState.viewDate.getMonth(),
    day,
    selectedDate.getHours(),
    selectedDate.getMinutes(),
    0,
    0
  );

  if (!isSelectableForInput(input, candidate)) {
    return;
  }

  customPickerState.selectedDate = candidate;

  if (input.dataset.pickerMode === "date") {
    commitCustomPickerSelection(input, true);
    return;
  }

  customPickerState.stage = "time";
  renderCustomDatePicker();
}

function commitCustomPickerSelection(input, shouldClose) {
  const mode = input.dataset.pickerMode || "date";
  const isoValue = mode === "datetime" ? toLocalDateTimeInputValue(customPickerState.selectedDate) : toLocalDateInputValue(customPickerState.selectedDate);

  setCustomPickerValue(input, isoValue);

  if (shouldClose) {
    closeCustomDatePicker();
  } else {
    renderCustomDatePicker();
  }
}

function setCustomPickerValue(input, isoValue) {
  input.dataset.isoValue = isoValue || "";
  input.value = formatCustomPickerDisplayValue(input.dataset.pickerMode || "date", input.dataset.isoValue);
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

function syncCustomPickerInput(input) {
  const isoValue = input.dataset.isoValue || "";
  if (!input.matches(":focus")) {
    input.value = formatCustomPickerDisplayValue(input.dataset.pickerMode || "date", isoValue);
  }
}

function getCustomPickerValue(inputOrId) {
  const input = typeof inputOrId === "string" ? document.getElementById(inputOrId) : inputOrId;
  if (!input) {
    return "";
  }

  return input.dataset.pickerMode ? input.dataset.isoValue || "" : input.value || "";
}

function setCustomPickerFieldValue(id, isoValue) {
  const input = document.getElementById(id);
  if (!input) {
    return;
  }

  if (input.dataset.pickerMode) {
    input.dataset.isoValue = isoValue || "";
    syncCustomPickerInput(input);
    return;
  }

  input.value = isoValue || "";
}

function resetCustomPickerFields(formId) {
  document.querySelectorAll(`#${formId} [data-picker-mode]`).forEach((input) => {
    input.dataset.isoValue = "";
    syncCustomPickerInput(input);
  });
}

function formatCustomPickerDisplayValue(mode, isoValue) {
  const parsed = parsePickerIsoValue(isoValue, mode);
  if (!parsed) {
    return "";
  }

  const day = String(parsed.getDate()).padStart(2, "0");
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const year = parsed.getFullYear();

  if (mode === "datetime") {
    const hours = String(parsed.getHours()).padStart(2, "0");
    const minutes = String(parsed.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }

  return `${day}/${month}/${year}`;
}

function handleCustomPickerTextInput(input) {
  if (!input.dataset.pickerMode) {
    return;
  }

  const masked = applyCustomPickerMask(input.dataset.pickerMode, input.value);
  input.value = masked.displayValue;
  input.dataset.isoValue = masked.isoValue;
}

function handleCustomPickerTextBlur(input) {
  if (!input.dataset.pickerMode) {
    return;
  }

  const masked = applyCustomPickerMask(input.dataset.pickerMode, input.value);
  input.dataset.isoValue = masked.isoValue;
  input.value = masked.isoValue
    ? formatCustomPickerDisplayValue(input.dataset.pickerMode, masked.isoValue)
    : masked.displayValue;
}

function applyCustomPickerMask(mode, rawValue) {
  const digitLimit = mode === "datetime" ? 12 : 8;
  const digits = rawValue.replace(/\D/g, "").slice(0, digitLimit);
  const dayDigits = buildMaskedSegment(digits.slice(0, 2), isValidDayPartial);
  const monthDigits = buildMaskedSegment(digits.slice(2, 4), isValidMonthPartial);
  const yearDigits = digits.slice(4, 8);
  const timeDigits = mode === "datetime" ? digits.slice(8) : "";

  let normalizedDayDigits = dayDigits;
  if (dayDigits.length === 2 && monthDigits.length === 2) {
    const yearForClamp = yearDigits.length === 4 ? Number(yearDigits) : 2000;
    const maxDay = getMaxDayForMonth(Number(monthDigits), yearForClamp);
    const clampedDay = Math.min(Number(dayDigits), maxDay);
    normalizedDayDigits = String(clampedDay).padStart(2, "0");
  }

  const hourDigits = mode === "datetime" ? buildMaskedSegment(timeDigits.slice(0, 2), isValidHourPartial) : "";
  const minuteDigits = mode === "datetime" ? buildMaskedSegment(timeDigits.slice(2, 4), isValidMinutePartial) : "";
  const displayValue = buildMaskedDisplayValue(mode, normalizedDayDigits, monthDigits, yearDigits, hourDigits, minuteDigits);

  if (normalizedDayDigits.length !== 2 || monthDigits.length !== 2 || yearDigits.length !== 4) {
    return {
      displayValue,
      isoValue: ""
    };
  }

  const isoDate = `${yearDigits}-${monthDigits}-${normalizedDayDigits}`;
  if (!parsePickerIsoValue(isoDate, "date")) {
    return {
      displayValue,
      isoValue: ""
    };
  }

  if (mode === "date") {
    return {
      displayValue,
      isoValue: isoDate
    };
  }

  if (hourDigits.length !== 2 || minuteDigits.length !== 2) {
    return {
      displayValue,
      isoValue: ""
    };
  }

  const isoDateTime = `${isoDate}T${hourDigits}:${minuteDigits}`;
  return {
    displayValue,
    isoValue: parsePickerIsoValue(isoDateTime, "datetime") ? isoDateTime : ""
  };
}

function buildMaskedSegment(rawDigits, validator) {
  let accepted = "";

  for (const digit of rawDigits) {
    const proposal = `${accepted}${digit}`;
    if (validator(proposal)) {
      accepted = proposal;
    }
  }

  return accepted;
}

function buildMaskedDisplayValue(mode, dayDigits, monthDigits, yearDigits, hourDigits = "", minuteDigits = "") {
  let displayValue = "";

  if (dayDigits) {
    displayValue += dayDigits;
  }
  if (dayDigits.length === 2 && (monthDigits || yearDigits || hourDigits || minuteDigits)) {
    displayValue += "/";
  }
  if (monthDigits) {
    displayValue += monthDigits;
  }
  if (monthDigits.length === 2 && (yearDigits || hourDigits || minuteDigits)) {
    displayValue += "/";
  }
  if (yearDigits) {
    displayValue += yearDigits;
  }

  if (mode === "datetime" && (hourDigits || minuteDigits)) {
    if (yearDigits.length === 4) {
      displayValue += " ";
    }
    displayValue += hourDigits;
    if (hourDigits.length === 2 && minuteDigits) {
      displayValue += ":";
    }
    if (minuteDigits) {
      displayValue += minuteDigits;
    }
  }

  return displayValue;
}

function isValidDayPartial(value) {
  if (!value) {
    return true;
  }
  if (value.length === 1) {
    return /^[0-3]$/.test(value);
  }
  const numeric = Number(value);
  return numeric >= 1 && numeric <= 31;
}

function isValidMonthPartial(value) {
  if (!value) {
    return true;
  }
  if (value.length === 1) {
    return /^[0-1]$/.test(value);
  }
  const numeric = Number(value);
  return numeric >= 1 && numeric <= 12;
}

function isValidHourPartial(value) {
  if (!value) {
    return true;
  }
  if (value.length === 1) {
    return /^[0-2]$/.test(value);
  }
  const numeric = Number(value);
  return numeric >= 0 && numeric <= 23;
}

function isValidMinutePartial(value) {
  if (!value) {
    return true;
  }
  if (value.length === 1) {
    return /^[0-5]$/.test(value);
  }
  const numeric = Number(value);
  return numeric >= 0 && numeric <= 59;
}

function getMaxDayForMonth(month, year) {
  if (!month || month < 1 || month > 12) {
    return 31;
  }

  return new Date(year, month, 0).getDate();
}

function parseDisplayValueToIso(mode, displayValue) {
  const trimmed = displayValue.trim();
  if (!trimmed) {
    return "";
  }

  if (mode === "date") {
    const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(trimmed);
    if (!match) {
      return "";
    }

    const [, dayText, monthText, yearText] = match;
    const iso = `${yearText}-${monthText}-${dayText}`;
    return parsePickerIsoValue(iso, "date") ? iso : "";
  }

  const match = /^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})$/.exec(trimmed);
  if (!match) {
    return "";
  }

  const [, dayText, monthText, yearText, hourText, minuteText] = match;
  const iso = `${yearText}-${monthText}-${dayText}T${hourText}:${minuteText}`;
  return parsePickerIsoValue(iso, "datetime") ? iso : "";
}

function parsePickerIsoValue(value, mode) {
  if (!value) {
    return null;
  }

  if (mode === "datetime" && !isValidDateTimeInputValue(value)) {
    return null;
  }

  if (mode === "date" && !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const normalized = mode === "date" ? `${value}T00:00` : value;
  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function defaultPickerDate(mode) {
  const now = new Date();
  if (mode === "datetime") {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), 0, 0);
  }

  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function isSelectableForInput(input, date) {
  const minValue = input.min || "";
  const maxValue = input.max || "";
  const mode = input.dataset.pickerMode || "date";
  const currentValue = mode === "datetime" ? toLocalDateTimeInputValue(date) : toLocalDateInputValue(date);

  if (minValue && currentValue < minValue) {
    return false;
  }

  if (maxValue && currentValue > maxValue) {
    return false;
  }

  return true;
}

function formatMonthYear(date) {
  return new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(date);
}

function scrollSelectedTimeIntoView(container) {
  const selected = container.querySelector(".is-selected");
  selected?.scrollIntoView({ block: "nearest" });
}

function handleCustomDatePickerDocumentClick(event) {
  const picker = document.getElementById("custom-date-picker");
  const input = getActiveCustomPickerInput();
  if (!picker || !input || picker.classList.contains("is-hidden")) {
    return;
  }

  if (picker.contains(event.target) || input.contains(event.target)) {
    return;
  }

  closeCustomDatePicker();
}

function handleCustomDatePickerDocumentKeydown(event) {
  if (event.key === "Escape") {
    closeCustomDatePicker();
  }
}

function normalizeTriageStaticCopy() {
  document.querySelectorAll("#route-triage .triage-step").forEach((element, index) => {
    const labels = ["1. Paciente", "2. Sintomas", "3. Resultado", "4. Confirmação"];
    if (labels[index]) {
      element.textContent = labels[index];
    }
  });

  const openPatientFormButton = document.getElementById("triage-open-patient-form");
  if (openPatientFormButton) {
    openPatientFormButton.textContent = "Cadastro rápido";
  }

  const notesTitle = document.querySelector("#route-triage .triage-side-column .box.app-card:last-child .title");
  if (notesTitle) {
    notesTitle.textContent = "Observações da triagem";
  }

  const symptomSeveritySelect = document.getElementById("triage-symptom-severity");
  if (symptomSeveritySelect) {
    const mediumOption = symptomSeveritySelect.querySelector('option[value="MEDIUM"]');
    const criticalOption = symptomSeveritySelect.querySelector('option[value="CRITICAL"]');
    if (mediumOption) {
      mediumOption.textContent = "Média";
    }
    if (criticalOption) {
      criticalOption.textContent = "Crítica";
    }
  }
}

async function initializeApp() {
  normalizeTriageStaticCopy();
  renderUserIdentity();
  applyRoleVisibility();
  syncAppointmentDateConstraints();
  await Promise.all([
    loadDashboardPatients(),
    loadDashboardAppointments(),
    loadAppointments(),
    loadPatients(),
    loadTriages(),
    safeLoadDoctors(DEFAULT_DOCTOR_QUERY),
    safeLoadSymptoms(),
    state.user.role === "ADMIN" ? loadUsers() : Promise.resolve()
  ]);
  await safeLoadSymptomsForTriage();
  renderAppointments();
  renderDashboardAppointments();
  populateAppointmentSelectors();
  renderCapabilityWarnings();
  ["patient", "appointment", "doctor", "symptom", "user"].forEach((formKey) => {
    setFormPanelVisibility(formKey, false, { focus: false });
  });
  navigate(state.route);
}

function setFormPanelVisibility(formKey, visible, options = {}) {
  const config = FORM_PANEL_CONFIG[formKey];
  const panel = document.getElementById(config.panelId);
  const emptyState = document.getElementById(config.emptyStateId);
  const formColumn = panel?.closest(".column");
  const listColumn = formColumn?.previousElementSibling;

  panel.classList.toggle("is-hidden", !visible);
  panel.setAttribute("aria-hidden", String(!visible));
  emptyState?.classList.toggle("is-hidden", true);
  emptyState?.setAttribute("aria-hidden", "true");
  formColumn?.classList.toggle("is-hidden", !visible);
  listColumn?.classList.toggle("form-list-expanded", !visible);

  if (visible && options.focus !== false) {
    requestAnimationFrame(() => {
      const field = document.getElementById(config.firstFieldId);
      field?.focus();
    });
  }
}

async function handleDashboardSearch() {
  try {
    const submitButton = document.getElementById("dashboard-patient-search-button");
    setButtonLoading(submitButton, true, "Buscando...");
    await loadDashboardPatients();
  } catch (error) {
    showFeedback(normalizeErrorMessage(error), "danger");
  } finally {
    setButtonLoading(document.getElementById("dashboard-patient-search-button"), false, "Buscar");
  }
}

async function bootstrapExistingSession() {
  if (state.user.role === "DOCTOR") {
    clearSession();
    showLogin();
    showInlineError(
      "login-error",
      "O perfil DOCTOR não possui rotas suficientes na API atual para operar esta aplicação web."
    );
    return;
  }

  showShell();

  try {
    await initializeApp();
  } catch (error) {
    clearSession();
    showLogin();
    showInlineError("login-error", normalizeErrorMessage(error));
  }
}

function showLogin() {
  document.getElementById("login-view").classList.remove("is-hidden");
  document.getElementById("shell-view").classList.add("is-hidden");
}

function showShell() {
  document.getElementById("login-view").classList.add("is-hidden");
  document.getElementById("shell-view").classList.remove("is-hidden");
}

function renderUserIdentity() {
  document.getElementById("current-user-name").textContent = state.user.name;
  document.getElementById("current-user-role").textContent = labelForRole(state.user.role);
}

function applyRoleVisibility() {
  document.querySelectorAll(".admin-only").forEach((element) => {
    element.classList.toggle("is-hidden", state.user.role !== "ADMIN");
  });
}

function navigate(route) {
  if (state.user?.role !== "ADMIN" && ["doctors", "symptoms", "users"].includes(route)) {
    showFeedback("Você não tem permissão para acessar esta área.", "danger");
    return;
  }

  state.route = route;

  document.querySelectorAll(".route-section").forEach((section) => section.classList.add("is-hidden"));
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.remove("is-active");
    link.removeAttribute("aria-current");
  });

  document.getElementById(`route-${route}`).classList.remove("is-hidden");
  const activeLink = document.querySelector(`[data-route="${route}"]`);
  activeLink?.classList.add("is-active");
  activeLink?.setAttribute("aria-current", "page");
  document.getElementById("page-title").textContent = pageTitle(route);
  document.getElementById("page-subtitle").textContent = pageMeta[route] || "";

  if (route === "dashboard") {
    renderDashboardAppointments();
  }

  requestAnimationFrame(() => {
    document.getElementById("page-title").focus();
  });
}

function pageTitle(route) {
  return {
    dashboard: "Atendimento",
    patients: "Pacientes",
    triage: "Nova triagem",
    appointments: "Agendamentos",
    doctors: "Médicos",
    symptoms: "Sintomas",
    users: "Usuários"
  }[route];
}

async function handleLogin(event) {
  event.preventDefault();
  hideInlineError("login-error");

  const submitButton = event.currentTarget.querySelector('button[type="submit"]');
  const emailInput = document.getElementById("login-email");
  const passwordInput = document.getElementById("login-password");

  if (!emailInput || !passwordInput) {
    showInlineError("login-error", "Não foi possível inicializar o formulário de login.");
    return;
  }

  const payload = {
    email: emailInput.value.trim(),
    password: passwordInput.value
  };

  try {
    setButtonLoading(submitButton, true, "Entrando...");
    const response = await apiRequest("/auth/login", { method: "POST", body: payload, auth: false });

    if (response.data.user.role === "DOCTOR") {
      showInlineError(
        "login-error",
        "O perfil DOCTOR não possui rotas suficientes na API atual para operar esta aplicação web."
      );
      return;
    }

    state.token = response.data.token;
    state.user = response.data.user;
    localStorage.setItem("triage.token", state.token);
    localStorage.setItem("triage.user", JSON.stringify(state.user));
    showShell();
    try {
      await initializeApp();
    } catch (error) {
      clearSession();
      showLogin();
      showInlineError("login-error", normalizeErrorMessage(error));
      return;
    }
    showFeedback(response.message || "Login realizado com sucesso.", "success");
  } catch (error) {
    showInlineError("login-error", normalizeErrorMessage(error));
  } finally {
    setButtonLoading(submitButton, false, "Acessar sistema");
  }
}

function handleLogout() {
  clearSession();
  showLogin();
}

function clearSession() {
  state.token = "";
  state.user = null;
  localStorage.removeItem("triage.token");
  localStorage.removeItem("triage.user");
}

async function loadDashboardPatients() {
  const name = document.getElementById("dashboard-patient-name").value.trim();
  const documentValue = document.getElementById("dashboard-patient-document").value.trim();
  const query = {};

  if (name) {
    query.name = name;
  }

  if (documentValue) {
    query.document = documentValue;
  }

  const response = await apiRequest(`/patients${toQueryString(query)}`);
  state.collections.dashboardPatients = response.data;
  renderDashboardPatients();
}

function renderDashboardPatients() {
  const target = document.getElementById("dashboard-patient-results");
  target.innerHTML = "";

  if (state.collections.dashboardPatients.length === 0) {
    target.innerHTML = `<tr><td colspan="5"><div class="empty-state compact">Nenhum paciente encontrado.</div></td></tr>`;
    return;
  }

  target.innerHTML = state.collections.dashboardPatients
    .map(
      (patient) => `
        <tr>
          <td>${escapeHtml(patient.name)}</td>
          <td>${escapeHtml(patient.document)}</td>
          <td>${escapeHtml(patient.phone)}</td>
          <td>${statusChip(patient.active ? "Ativo" : "Inativo", patient.active ? "active" : "inactive")}</td>
          <td class="has-text-right">
              <button class="button is-small is-primary is-light" type="button" data-dashboard-triage="${patient.id}" aria-label="Atender paciente ${escapeHtml(patient.name)}">
                Atender
              </button>
          </td>
        </tr>
      `
    )
    .join("");

  target.querySelectorAll("[data-dashboard-triage]").forEach((button) => {
    button.addEventListener("click", () => {
      selectPatientForTriage(button.dataset.dashboardTriage);
      navigate("triage");
    });
  });
}

async function loadAppointments(query = {}) {
  const response = await apiRequest(`/appointments${toQueryString(query)}`);
  state.collections.appointments = response.data;
  renderAppointments();
}

async function loadDashboardAppointments() {
  const response = await apiRequest(`/appointments${toQueryString({ scheduledFrom: startOfTodayIso() })}`);
  state.collections.dashboardAppointments = response.data;
  renderDashboardAppointments();
}

function renderDashboardAppointments() {
  const target = document.getElementById("dashboard-appointments-list");
  target.innerHTML = "";

  if (state.collections.dashboardAppointments.length === 0) {
    target.innerHTML = `<div class="empty-state compact">Nenhum agendamento disponivel para exibir.</div>`;
    return;
  }

  target.innerHTML = state.collections.dashboardAppointments
    .slice(0, 6)
    .map((appointment) => {
      const patient = state.collections.patients.find((item) => item.id === appointment.patientId);
      const doctor = state.collections.doctors.find((item) => item.id === appointment.doctorId);

      return `
        <article class="stack-item">
          <div class="is-flex is-justify-content-space-between is-align-items-center mb-2">
            <strong>${escapeHtml(patient?.name || `Paciente #${appointment.patientId}`)}</strong>
            ${statusChip(labelForStatus(appointment.status), appointment.status.toLowerCase())}
          </div>
          <p class="mb-1">${escapeHtml(doctor?.name || `Médico #${appointment.doctorId}`)}</p>
          <p class="has-text-grey is-size-7">${formatDateTime(appointment.scheduledAt)}</p>
        </article>
      `;
    })
    .join("");
}

async function handlePatientFilterSubmit(event) {
  event.preventDefault();
  await loadPatientsFromFilters();
}

async function loadPatientsFromFilters() {
  const query = {};
  const name = document.getElementById("patient-filter-name").value.trim();
  const documentValue = document.getElementById("patient-filter-document").value.trim();
  const active = document.getElementById("patient-filter-active").value;

  if (name) {
    query.name = name;
  }

  if (documentValue) {
    query.document = documentValue;
  }

  if (active) {
    query.active = active;
  }

  await loadPatients(query);
}

async function loadPatients(query = {}) {
  const response = await apiRequest(`/patients${toQueryString(query)}`);
  state.collections.patients = response.data;
  renderPatients();
  renderAppointments();
  renderDashboardAppointments();
  populateTriagePatientSelector();
  populateAppointmentSelectors();
}

function renderPatients() {
  const target = document.getElementById("patients-table-body");
  target.innerHTML = "";

  if (state.collections.patients.length === 0) {
    target.innerHTML = `<tr><td colspan="6"><div class="empty-state compact">Nenhum paciente encontrado.</div></td></tr>`;
    return;
  }

  target.innerHTML = state.collections.patients
    .map(
      (patient) => `
        <tr>
          <td>${escapeHtml(patient.name)}</td>
          <td>${escapeHtml(patient.document)}</td>
          <td>${escapeHtml(patient.birthDate)}</td>
          <td>${escapeHtml(patient.phone)}</td>
          <td>${statusChip(patient.active ? "Ativo" : "Inativo", patient.active ? "active" : "inactive")}</td>
          <td class="has-text-right">
            <div class="buttons is-justify-content-flex-end">
              <button class="button is-small is-light" type="button" data-patient-edit="${patient.id}" aria-label="Editar paciente ${escapeHtml(patient.name)}">Editar</button>
              <button class="button is-small is-primary is-light" type="button" data-patient-triage="${patient.id}" aria-label="Iniciar triagem para paciente ${escapeHtml(patient.name)}">Atender</button>
              <button class="button is-small ${patient.active ? "is-danger is-light" : "is-success is-light"}" type="button" data-patient-toggle="${patient.id}" aria-label="${patient.active ? "Inativar" : "Ativar"} paciente ${escapeHtml(patient.name)}">${patient.active ? "Inativar" : "Ativar"}</button>
            </div>
          </td>
        </tr>
      `
    )
    .join("");

  target.querySelectorAll("[data-patient-edit]").forEach((button) => {
    button.addEventListener("click", () => fillPatientForm(button.dataset.patientEdit));
  });
  target.querySelectorAll("[data-patient-triage]").forEach((button) => {
    button.addEventListener("click", () => {
      selectPatientForTriage(button.dataset.patientTriage);
      navigate("triage");
    });
  });
  target.querySelectorAll("[data-patient-toggle]").forEach((button) => {
    button.addEventListener("click", () => handlePatientStatusToggle(button.dataset.patientToggle));
  });
}

function resetPatientFilters() {
  document.getElementById("patient-filter-form").reset();
  loadPatients();
}

function resetPatientForm() {
  document.getElementById("patient-form").reset();
  resetCustomPickerFields("patient-form");
  document.getElementById("patient-id").value = "";
  document.getElementById("patient-active").checked = true;
  document.getElementById("patient-form-title").textContent = "Cadastrar paciente";
  setFormPanelVisibility("patient", true);
  hideInlineError("patient-form-error");
}

function openPatientCreateForm() {
  resetPatientForm();
  setFormPanelVisibility("patient", true);
}

function closePatientForm() {
  resetPatientForm();
  setFormPanelVisibility("patient", false, { focus: false });
}

function fillPatientForm(id) {
  const patient = state.collections.patients.find((item) => item.id === id);
  if (!patient) {
    return;
  }

  document.getElementById("patient-id").value = patient.id;
  document.getElementById("patient-name").value = patient.name;
  document.getElementById("patient-document").value = patient.document;
  setCustomPickerFieldValue("patient-birthdate", patient.birthDate);
  document.getElementById("patient-phone").value = patient.phone;
  document.getElementById("patient-email").value = patient.email || "";
  document.getElementById("patient-notes").value = patient.notes || "";
  document.getElementById("patient-active").checked = patient.active;
  document.getElementById("patient-form-title").textContent = "Editar paciente";
  hideInlineError("patient-form-error");
  setFormPanelVisibility("patient", true);
}

async function handlePatientFormSubmit(event) {
  event.preventDefault();
  hideInlineError("patient-form-error");

  const id = document.getElementById("patient-id").value;
  const payload = {
    name: document.getElementById("patient-name").value.trim(),
    document: document.getElementById("patient-document").value.trim(),
    birthDate: getCustomPickerValue("patient-birthdate"),
    phone: document.getElementById("patient-phone").value.trim(),
    email: document.getElementById("patient-email").value.trim(),
    notes: document.getElementById("patient-notes").value.trim(),
    active: document.getElementById("patient-active").checked
  };

  try {
    const response = await apiRequest(id ? `/patients/${id}` : "/patients", {
      method: id ? "PUT" : "POST",
      body: payload
    });
    await Promise.all([loadPatients(), loadDashboardPatients()]);
    closePatientForm();
    showFeedback(response.message || "Paciente salvo com sucesso.", "success");
  } catch (error) {
    showInlineError("patient-form-error", normalizeErrorMessage(error));
  }
}

async function handlePatientStatusToggle(id) {
  const patient = state.collections.patients.find((item) => item.id === id);
  if (!patient) {
    return;
  }

  try {
    const response = await apiRequest(`/patients/${id}`, {
      method: "PUT",
      body: {
        active: !patient.active
      }
    });
    await Promise.all([loadPatients(), loadDashboardPatients()]);
    showFeedback(response.message || `Paciente ${patient.active ? "inativado" : "ativado"} com sucesso.`, "success");
  } catch (error) {
    showFeedback(normalizeErrorMessage(error), "danger");
  }
}

function selectPatientForTriage(id) {
  const patient =
    state.collections.patients.find((item) => item.id === id) ||
    state.collections.dashboardPatients.find((item) => item.id === id) ||
    null;

  state.triageDraft.patient = patient;
  state.triageDraft.consultResult = null;
  state.triageDraft.triage = null;
  state.triageDraft.consultPending = false;
  state.triageDraft.consultError = "";
  renderSelectedPatient();
  renderTriageResult();
}

function handleTriagePatientChange(event) {
  const patientId = event.currentTarget.value;

  if (!patientId) {
    state.triageDraft.patient = null;
    state.triageDraft.consultResult = null;
    state.triageDraft.triage = null;
    state.triageDraft.consultPending = false;
    state.triageDraft.consultError = "";
    renderSelectedPatient();
    renderTriageResult();
    return;
  }

  selectPatientForTriage(patientId);
}

function renderSelectedPatient() {
  const target = document.getElementById("triage-selected-patient");
  const patient = state.triageDraft.patient;
  const patientSelect = document.getElementById("triage-patient-id");

  if (!patient) {
    if (patientSelect.value) {
      patientSelect.value = "";
    }
    target.className = "empty-state compact";
    target.textContent = "Selecione um paciente para iniciar a triagem.";
    return;
  }

  if (patientSelect.value !== patient.id) {
    patientSelect.value = patient.id;
  }

  target.className = "stack-item";
  target.innerHTML = `
    <strong>${escapeHtml(patient.name)}</strong>
    <p class="mb-1">${escapeHtml(patient.document)}</p>
    <p class="mb-1">${escapeHtml(patient.phone)}</p>
    <p class="is-size-7 has-text-grey">${patient.active ? "Paciente ativo" : "Paciente inativo"}</p>
  `;
}

async function loadSymptomsForTriage() {
  const query = {};
  const name = document.getElementById("triage-symptom-name").value.trim();
  const severity = document.getElementById("triage-symptom-severity").value;
  const specialty = document.getElementById("triage-symptom-specialty").value.trim();

  if (name) {
    query.name = name;
  }

  if (severity) {
    query.severity = severity;
  }

  if (specialty) {
    query.specialty = specialty;
  }

  const response = await apiRequest(`/symptoms${toQueryString(query)}`);
  state.collections.triageSymptoms = response.data;
  renderTriageSymptoms();
}

async function safeLoadSymptomsForTriage() {
  try {
    await loadSymptomsForTriage();
    state.capabilityWarnings.symptoms = "";
  } catch (error) {
    state.collections.triageSymptoms = [];
    state.capabilityWarnings.symptoms = normalizeErrorMessage(error);
    renderTriageSymptoms();
  }
}

function renderTriageSymptoms() {
  const target = document.getElementById("triage-symptom-list");
  target.innerHTML = "";

  if (state.collections.triageSymptoms.length === 0) {
    target.innerHTML = `<div class="empty-state compact">Nenhum sintoma encontrado para os filtros aplicados.</div>`;
    return;
  }

  target.innerHTML = state.collections.triageSymptoms
    .map((symptom) => {
      const selected = state.triageDraft.symptoms.some((item) => item.id === symptom.id);

      return `
        <label class="choice-card ${selected ? "is-selected" : ""}">
          <div class="is-flex is-justify-content-space-between is-align-items-flex-start">
            <strong>${escapeHtml(symptom.name)}</strong>
            <input type="checkbox" data-symptom-select="${symptom.id}" ${selected ? "checked" : ""} />
          </div>
          <p class="has-text-grey is-size-7">${escapeHtml(symptom.description || "Sem descrição informada.")}</p>
          <div class="tags">
            <span class="tag ${severityTagClass(symptom.severity)}">Severidade ${escapeHtml(labelForSeverity(symptom.severity))}</span>
            <span class="tag is-light">${escapeHtml(symptom.specialty)}</span>
          </div>
        </label>
      `;
    })
    .join("");

  target.querySelectorAll("[data-symptom-select]").forEach((checkbox) => {
    checkbox.addEventListener("change", () => toggleSymptomSelection(checkbox.dataset.symptomSelect));
  });
}

function toggleSymptomSelection(id) {
  const symptom = state.collections.triageSymptoms.find((item) => item.id === id);
  if (!symptom) {
    return;
  }

  const exists = state.triageDraft.symptoms.some((item) => item.id === id);
  state.triageDraft.consultResult = null;
  state.triageDraft.triage = null;
  state.triageDraft.consultPending = false;
  state.triageDraft.consultError = "";

  if (exists) {
    state.triageDraft.symptoms = state.triageDraft.symptoms.filter((item) => item.id !== id);
  } else {
    state.triageDraft.symptoms = [...state.triageDraft.symptoms, symptom];
  }

  renderTriageSymptoms();
  renderTriageResult();
}

function resetTriageSymptomFilters() {
  document.getElementById("triage-symptom-filter-form").reset();
  loadSymptomsForTriage();
}

async function handleTriageConsult() {
  if (!state.triageDraft.patient) {
    showFeedback("Selecione um paciente antes de consultar o especialista.", "warning");
    return;
  }

  if (state.triageDraft.symptoms.length === 0) {
    showFeedback("Selecione pelo menos um sintoma para consultar a triagem.", "warning");
    return;
  }

  const button = document.getElementById("triage-consult-button");
  state.triageDraft.consultResult = null;
  state.triageDraft.triage = null;
  state.triageDraft.consultPending = true;
  state.triageDraft.consultError = "";
  renderTriageResult();

  try {
    setButtonLoading(button, true, "Consultando...");
    const response = await apiRequest("/triages/specialty-consult", {
      method: "POST",
      body: {
        symptomIds: state.triageDraft.symptoms.map((item) => item.id)
      }
    });

    const consultResult = normalizeConsultResult(response.data);
    if (!consultResult) {
      throw {
        error: {
          message: "A API retornou uma consulta sem especialidade ou prioridade validas."
        }
      };
    }

    state.triageDraft.consultResult = consultResult;
    state.triageDraft.consultError = "";
    showFeedback(response.message || "Especialista sugerido com sucesso.", "success");
  } catch (error) {
    state.triageDraft.consultResult = null;
    state.triageDraft.triage = null;
    state.triageDraft.consultError = normalizeErrorMessage(error);
    showFeedback(state.triageDraft.consultError, "danger");
  } finally {
    state.triageDraft.consultPending = false;
    renderTriageResult();
    setButtonLoading(button, false, "Consultar especialista");
  }
}

async function handleTriageCreate() {
  if (!state.triageDraft.patient || !state.triageDraft.consultResult) {
    showFeedback("Consulte o especialista sugerido antes de registrar a triagem.", "warning");
    return;
  }

  try {
    const response = await apiRequest("/triages", {
      method: "POST",
      body: {
        patientId: state.triageDraft.patient.id,
        symptomIds: state.triageDraft.symptoms.map((item) => item.id),
        notes: document.getElementById("triage-notes").value.trim()
      }
    });

    state.triageDraft.triage = response.data;
    await loadTriages();
    renderTriageResult();
    fillAppointmentFromTriage();
    navigate("appointments");
    showFeedback(response.message || "Triagem registrada e pronta para agendamento.", "success");
  } catch (error) {
    showFeedback(normalizeErrorMessage(error), "danger");
  }
}

function renderTriageResult() {
  const target = document.getElementById("triage-result");
  const consultResult = state.triageDraft.consultResult;
  const triage = state.triageDraft.triage;
  const consultPending = state.triageDraft.consultPending;
  const consultError = state.triageDraft.consultError;

  target.removeAttribute("role");

  if (consultPending) {
    target.className = "empty-state compact";
    target.textContent = "Consultando especialista e calculando a prioridade da triagem...";
    return;
  }

  if (consultError) {
    target.className = "notification is-danger is-light";
    target.setAttribute("role", "alert");
    target.textContent = consultError;
    revealTriageResult();
    return;
  }

  if (!consultResult) {
    target.className = "empty-state compact";
    target.textContent = "O especialista sugerido e a prioridade aparecerão aqui após a consulta.";
    return;
  }

  const symptoms = consultResult.symptomsConsidered?.length
    ? consultResult.symptomsConsidered
    : state.triageDraft.symptoms;

  target.className = "";
  target.innerHTML = `
    <div class="result-grid">
      <div class="result-box">
        <p class="eyebrow has-text-primary">Especialista sugerido</p>
        <h4 class="title is-4 mt-2 mb-0">${escapeHtml(consultResult.suggestedSpecialty)}</h4>
        <p class="mt-2 has-text-grey">Consulte a sugestão e confirme o registro da triagem para continuar.</p>
      </div>
      <div class="result-box">
        <p class="eyebrow has-text-primary">Prioridade</p>
        <div class="mt-3">
          <span class="severity-badge ${severityBadgeClass(consultResult.priority)}">Prioridade ${escapeHtml(labelForSeverity(consultResult.priority))}</span>
        </div>
      </div>
      <div class="result-box">
        <p class="eyebrow has-text-primary">Status</p>
        <p class="mt-3">${triage ? "Triagem registrada e pronta para agendamento." : "Sugestao pronta. Revise e registre a triagem para seguir."}</p>
      </div>
    </div>
    <div class="content">
      <p class="has-text-weight-semibold mb-2">Sintomas considerados</p>
      ${
        symptoms.length > 0
          ? `<div class="tags">
              ${symptoms
                .map(
                  (symptom) =>
                    `<span class="tag is-light">${escapeHtml(symptom.name)} - ${escapeHtml(symptom.specialty)}</span>`
                )
                .join("")}
            </div>`
          : `<p class="has-text-grey mb-0">A API não retornou a lista de sintomas, mas a sugestão já está pronta para confirmação.</p>`
      }
    </div>
    ${
      triage
        ? `<div class="buttons mt-4">
            <button id="triage-go-appointment" class="button is-primary" type="button">Agendar consulta</button>
            <button id="triage-reset-flow" class="button is-light" type="button">Nova triagem</button>
          </div>`
        : `<div class="buttons mt-4">
            <button id="triage-result-create" class="button is-primary" type="button">Registrar triagem</button>
          </div>`
    }
  `;

  document.getElementById("triage-result-create")?.addEventListener("click", handleTriageCreate);
  document.getElementById("triage-go-appointment")?.addEventListener("click", () => {
    fillAppointmentFromTriage();
    navigate("appointments");
  });
  document.getElementById("triage-reset-flow")?.addEventListener("click", resetTriageFlow);
  revealTriageResult();
}

function resetTriageFlow() {
  state.triageDraft = {
    patient: null,
    symptoms: [],
    consultResult: null,
    triage: null,
    consultPending: false,
    consultError: ""
  };
  document.getElementById("triage-notes").value = "";
  document.getElementById("triage-patient-id").value = "";
  renderSelectedPatient();
  renderTriageSymptoms();
  renderTriageResult();
}

function revealTriageResult() {
  const target = document.getElementById("triage-result");
  const panel = target.closest(".triage-result-panel");
  const route = document.getElementById("route-triage");
  const topbar = document.querySelector(".topbar");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const behavior = prefersReducedMotion ? "auto" : "smooth";

  requestAnimationFrame(() => {
    if (panel && route) {
      const topbarHeight = topbar?.getBoundingClientRect().height || 0;
      const panelTop = panel.offsetTop;
      const targetScrollTop = Math.max(0, panelTop - Math.min(topbarHeight, 96) - 16);

      panel.scrollTo({ top: 0, behavior });
      route.scrollTo({ top: targetScrollTop, behavior });
    } else if (panel) {
      panel.scrollTo({ top: 0, behavior });
      panel.scrollIntoView({ block: "start", behavior });
    }

    target.focus({ preventScroll: true });
  });
}

function fillAppointmentFromTriage() {
  openAppointmentCreateForm();

  const triage = state.triageDraft.triage;
  const patient = state.triageDraft.patient;
  const specialty = triage?.suggestedSpecialty || state.triageDraft.consultResult?.suggestedSpecialty;
  const triageNotes = document.getElementById("triage-notes")?.value.trim() || "";
  const appointmentPatientSelect = document.getElementById("appointment-patient-id");
  const appointmentTriageSelect = document.getElementById("appointment-triage-id");
  const appointmentDoctorSelect = document.getElementById("appointment-doctor-id");
  const appointmentDateInput = document.getElementById("appointment-scheduled-at");
  const appointmentNotesInput = document.getElementById("appointment-notes");

  populateAppointmentSelectors();

  if (patient) {
    appointmentPatientSelect.value = patient.id;
    handleAppointmentPatientChange();
  }

  if (triage) {
    appointmentTriageSelect.value = triage.id;
    handleAppointmentTriageChange();
  }

  if (specialty) {
    const doctor = state.collections.doctors.find((item) => item.specialty === specialty && item.active);
    if (doctor) {
      appointmentDoctorSelect.value = doctor.id;
    }
  }

  if (!getCustomPickerValue("appointment-scheduled-at")) {
    syncAppointmentDateConstraints();
    setCustomPickerFieldValue("appointment-scheduled-at", nextAvailableAppointmentDateTime());
  }

  if (appointmentNotesInput) {
    appointmentNotesInput.value = triageNotes;
  }
}

async function loadTriages() {
  const response = await apiRequest("/triages");
  state.collections.triages = response.data;
  populateAppointmentSelectors();
}

function populateAppointmentSelectors() {
  const triage = state.collections.triages.find(
    (item) => item.id === document.getElementById("appointment-triage-id").value
  );
  const requiredSpecialty = triage?.suggestedSpecialty;

  populateSelect(
    document.getElementById("appointment-patient-id"),
    state.collections.patients.map((patient) => ({
      value: patient.id,
      label: `${patient.name} - ${patient.document}`
    })),
    "Selecione um paciente"
  );

  populateSelect(
    document.getElementById("appointment-doctor-id"),
    state.collections.doctors
      .filter((doctor) => doctor.active)
      .filter((doctor) => !requiredSpecialty || doctor.specialty === requiredSpecialty)
      .map((doctor) => ({
        value: doctor.id,
        label: `${doctor.name} - ${doctor.specialty}`
      })),
    "Selecione um médico"
  );

  populateAppointmentFilterSelectors();
  handleAppointmentPatientChange();
}

function populateTriagePatientSelector() {
  const patientOptions = state.collections.patients
    .filter((patient) => patient.active)
    .map((patient) => ({
      value: patient.id,
      label: `${patient.name} - ${patient.document}`
    }));

  populateSelect(document.getElementById("triage-patient-id"), patientOptions, "Selecione o paciente", true);

  if (
    state.triageDraft.patient &&
    !patientOptions.some((patientOption) => patientOption.value === state.triageDraft.patient.id)
  ) {
    state.triageDraft.patient = null;
    state.triageDraft.consultResult = null;
    state.triageDraft.triage = null;
    state.triageDraft.consultPending = false;
    state.triageDraft.consultError = "";
    renderSelectedPatient();
    renderTriageResult();
  }
}

function handleAppointmentPatientChange() {
  const patientId = document.getElementById("appointment-patient-id").value;
  const triageOptions = state.collections.triages
    .filter((triage) => !patientId || triage.patientId === patientId)
    .map((triage) => ({
      value: triage.id,
      label: `${triage.id} - ${triage.suggestedSpecialty} - ${labelForSeverity(triage.priority)}`
    }));

  populateSelect(document.getElementById("appointment-triage-id"), triageOptions, "Sem triagem vinculada", true);
}

function handleAppointmentTriageChange() {
  const triageId = document.getElementById("appointment-triage-id").value;
  const triage = state.collections.triages.find((item) => item.id === triageId);
  const patientId = document.getElementById("appointment-patient-id").value;
  const requiredSpecialty = triage?.suggestedSpecialty;

  populateSelect(
    document.getElementById("appointment-doctor-id"),
    state.collections.doctors
      .filter((doctor) => doctor.active)
      .filter((doctor) => !requiredSpecialty || doctor.specialty === requiredSpecialty)
      .map((doctor) => ({
        value: doctor.id,
        label: `${doctor.name} - ${doctor.specialty}`
      })),
    "Selecione um médico",
    true
  );

  if (patientId) {
    document.getElementById("appointment-patient-id").value = patientId;
  }

  if (!triage) {
    return;
  }

  const doctor = state.collections.doctors.find(
    (item) => item.active && item.specialty === triage.suggestedSpecialty
  );
  if (doctor) {
    document.getElementById("appointment-doctor-id").value = doctor.id;
  }
}

async function handleAppointmentFilterSubmit(event) {
  event.preventDefault();
  const query = {};
  const patientId = document.getElementById("appointment-filter-patient-id").value.trim();
  const doctorId = document.getElementById("appointment-filter-doctor-id").value.trim();
  const status = document.getElementById("appointment-filter-status").value.trim();
  const from = getCustomPickerValue("appointment-filter-from");
  const to = getCustomPickerValue("appointment-filter-to");
  const filterError = validateAppointmentFilterRange(from, to);

  if (filterError) {
    showFeedback(filterError, "warning");
    return;
  }

  if (patientId) {
    query.patientId = patientId;
  }
  if (doctorId) {
    query.doctorId = doctorId;
  }
  if (status) {
    query.status = status;
  }
  if (from) {
    query.scheduledFrom = toIsoString(from);
  }
  if (to) {
    query.scheduledTo = toIsoString(to);
  }

  await loadAppointments(query);
}

function renderAppointments() {
  const target = document.getElementById("appointments-table-body");
  target.innerHTML = "";

  if (state.collections.appointments.length === 0) {
    target.innerHTML = `<tr><td colspan="5"><div class="empty-state compact">Nenhum agendamento encontrado.</div></td></tr>`;
    return;
  }

  target.innerHTML = state.collections.appointments
    .map((appointment) => {
      const patient = state.collections.patients.find((item) => item.id === appointment.patientId);
      const doctor = state.collections.doctors.find((item) => item.id === appointment.doctorId);
      return `
        <tr>
          <td>${escapeHtml(patient?.name || appointment.patientId)}</td>
          <td>${escapeHtml(doctor?.name || appointment.doctorId)}</td>
          <td>${formatDateTime(appointment.scheduledAt)}</td>
          <td>${statusChip(labelForStatus(appointment.status), appointment.status.toLowerCase())}</td>
          <td>${appointment.triageId ? "Sim" : "Não"}</td>
        </tr>
      `;
    })
    .join("");
}

function resetAppointmentFilters() {
  document.getElementById("appointment-filter-form").reset();
  resetCustomPickerFields("appointment-filter-form");
  loadAppointments();
}

function resetAppointmentForm() {
  document.getElementById("appointment-form").reset();
  resetCustomPickerFields("appointment-form");
  document.getElementById("appointment-form-title").textContent = "Agendar consulta";
  hideInlineError("appointment-form-error");
  syncAppointmentDateConstraints();
  populateAppointmentSelectors();
}

function openAppointmentCreateForm() {
  resetAppointmentForm();
  setFormPanelVisibility("appointment", true);
}

function closeAppointmentForm() {
  resetAppointmentForm();
  setFormPanelVisibility("appointment", false, { focus: false });
}

async function handleAppointmentFormSubmit(event) {
  event.preventDefault();
  hideInlineError("appointment-form-error");
  syncAppointmentDateConstraints();

  const scheduledAtValue = getCustomPickerValue("appointment-scheduled-at");
  const scheduleError = validateAppointmentDateTime(scheduledAtValue);

  if (scheduleError) {
    showInlineError("appointment-form-error", scheduleError);
    return;
  }

  const payload = {
    patientId: document.getElementById("appointment-patient-id").value,
    doctorId: document.getElementById("appointment-doctor-id").value,
    triageId: document.getElementById("appointment-triage-id").value || undefined,
    scheduledAt: toIsoString(scheduledAtValue),
    notes: document.getElementById("appointment-notes").value.trim()
  };

  try {
    const response = await apiRequest("/appointments", {
      method: "POST",
      body: payload
    });
    await Promise.all([loadAppointments(), loadDashboardAppointments()]);
    closeAppointmentForm();
    showFeedback(response.message || "Consulta agendada com sucesso.", "success");
  } catch (error) {
    showInlineError("appointment-form-error", normalizeErrorMessage(error));
  }
}

async function handleDoctorFilterSubmit(event) {
  event.preventDefault();
  const query = {};
  const name = document.getElementById("doctor-filter-name").value.trim();
  const crm = document.getElementById("doctor-filter-crm").value.trim();
  const specialty = document.getElementById("doctor-filter-specialty").value.trim();
  const includeInactive = document.getElementById("doctor-filter-include-inactive").checked;

  if (name) query.name = name;
  if (crm) query.crm = crm;
  if (specialty) query.specialty = specialty;
  if (includeInactive) query.includeInactive = true;

  await safeLoadDoctors(query);
  renderCapabilityWarnings();
}

async function loadDoctors(query = {}) {
  const response = await apiRequest(`/doctors${toQueryString(query)}`);
  state.collections.doctors = response.data;
  renderDoctors();
  renderAppointments();
  renderDashboardAppointments();
  populateAppointmentSelectors();
}

async function safeLoadDoctors(query = {}) {
  try {
    await loadDoctors(query);
    state.capabilityWarnings.doctors = "";
  } catch (error) {
    state.collections.doctors = [];
    state.capabilityWarnings.doctors = normalizeErrorMessage(error);
    renderDoctors();
    populateAppointmentSelectors();
  }
}

function renderDoctors() {
  const target = document.getElementById("doctors-table-body");
  target.innerHTML = "";

  if (state.collections.doctors.length === 0) {
    target.innerHTML = `<tr><td colspan="5"><div class="empty-state compact">Nenhum médico encontrado.</div></td></tr>`;
    return;
  }

  target.innerHTML = state.collections.doctors
    .map(
      (doctor) => `
        <tr>
          <td>${escapeHtml(doctor.name)}</td>
          <td>${escapeHtml(doctor.crm)}</td>
          <td>${escapeHtml(doctor.specialty)}</td>
          <td>${statusChip(doctor.active ? "Ativo" : "Inativo", doctor.active ? "active" : "inactive")}</td>
          <td class="has-text-right">
            <div class="buttons is-justify-content-flex-end">
              <button class="button is-small is-light" type="button" data-doctor-edit="${doctor.id}" aria-label="Editar médico ${escapeHtml(doctor.name)}">Editar</button>
              <button class="button is-small ${doctor.active ? "is-danger is-light" : "is-success is-light"}" type="button" data-doctor-toggle="${doctor.id}" aria-label="${doctor.active ? "Inativar" : "Ativar"} médico ${escapeHtml(doctor.name)}">${doctor.active ? "Inativar" : "Ativar"}</button>
            </div>
          </td>
        </tr>
      `
    )
    .join("");

  target.querySelectorAll("[data-doctor-edit]").forEach((button) => {
    button.addEventListener("click", () => fillDoctorForm(button.dataset.doctorEdit));
  });
  target.querySelectorAll("[data-doctor-toggle]").forEach((button) => {
    button.addEventListener("click", () => handleDoctorStatusToggle(button.dataset.doctorToggle));
  });
}

function resetDoctorFilters() {
  document.getElementById("doctor-filter-form").reset();
  safeLoadDoctors(DEFAULT_DOCTOR_QUERY);
  renderCapabilityWarnings();
}

function resetDoctorForm() {
  document.getElementById("doctor-form").reset();
  document.getElementById("doctor-id").value = "";
  document.getElementById("doctor-active").checked = true;
  document.getElementById("doctor-form-title").textContent = "Cadastrar médico";
  hideInlineError("doctor-form-error");
}

function openDoctorCreateForm() {
  resetDoctorForm();
  setFormPanelVisibility("doctor", true);
}

function closeDoctorForm() {
  resetDoctorForm();
  setFormPanelVisibility("doctor", false, { focus: false });
}

function fillDoctorForm(id) {
  const doctor = state.collections.doctors.find((item) => item.id === id);
  if (!doctor) return;

  document.getElementById("doctor-id").value = doctor.id;
  document.getElementById("doctor-name").value = doctor.name;
  document.getElementById("doctor-crm").value = doctor.crm;
  document.getElementById("doctor-specialty").value = doctor.specialty;
  document.getElementById("doctor-phone").value = doctor.phone || "";
  document.getElementById("doctor-email").value = doctor.email || "";
  document.getElementById("doctor-active").checked = doctor.active;
  document.getElementById("doctor-form-title").textContent = "Editar médico";
  hideInlineError("doctor-form-error");
  setFormPanelVisibility("doctor", true);
}

async function handleDoctorFormSubmit(event) {
  event.preventDefault();
  hideInlineError("doctor-form-error");

  const id = document.getElementById("doctor-id").value;
  const payload = {
    name: document.getElementById("doctor-name").value.trim(),
    crm: document.getElementById("doctor-crm").value.trim(),
    specialty: document.getElementById("doctor-specialty").value.trim(),
    phone: document.getElementById("doctor-phone").value.trim(),
    email: document.getElementById("doctor-email").value.trim(),
    active: document.getElementById("doctor-active").checked
  };

  try {
    const response = await apiRequest(id ? `/doctors/${id}` : "/doctors", {
      method: id ? "PUT" : "POST",
      body: payload
    });
    await safeLoadDoctors(DEFAULT_DOCTOR_QUERY);
    renderCapabilityWarnings();
    closeDoctorForm();
    showFeedback(response.message || "Médico salvo com sucesso.", "success");
  } catch (error) {
    showInlineError("doctor-form-error", normalizeErrorMessage(error));
  }
}

async function handleDoctorStatusToggle(id) {
  const doctor = state.collections.doctors.find((item) => item.id === id);
  if (!doctor) {
    return;
  }

  try {
    const response = await apiRequest(`/doctors/${id}`, {
      method: "PUT",
      body: {
        active: !doctor.active
      }
    });
    await safeLoadDoctors({ includeInactive: true });
    renderCapabilityWarnings();
    showFeedback(response.message || `Médico ${doctor.active ? "inativado" : "ativado"} com sucesso.`, "success");
  } catch (error) {
    showFeedback(normalizeErrorMessage(error), "danger");
  }
}

async function handleSymptomFilterSubmit(event) {
  event.preventDefault();
  const query = {};
  const name = document.getElementById("symptom-filter-name").value.trim();
  const severity = document.getElementById("symptom-filter-severity").value;
  const specialty = document.getElementById("symptom-filter-specialty").value.trim();
  const includeInactive = document.getElementById("symptom-filter-include-inactive").checked;

  if (name) query.name = name;
  if (severity) query.severity = severity;
  if (specialty) query.specialty = specialty;
  if (includeInactive) query.includeInactive = true;

  await safeLoadSymptoms(query);
  renderCapabilityWarnings();
}

async function loadSymptoms(query = {}) {
  const response = await apiRequest(`/symptoms${toQueryString(query)}`);
  state.collections.symptoms = response.data;
  renderSymptoms();
}

async function safeLoadSymptoms(query = {}) {
  try {
    await loadSymptoms(query);
    state.capabilityWarnings.symptoms = "";
  } catch (error) {
    state.collections.symptoms = [];
    state.capabilityWarnings.symptoms = normalizeErrorMessage(error);
    renderSymptoms();
  }
}

function renderSymptoms() {
  const target = document.getElementById("symptoms-table-body");
  target.innerHTML = "";

  if (state.collections.symptoms.length === 0) {
    target.innerHTML = `<tr><td colspan="5"><div class="empty-state compact">Nenhum sintoma encontrado.</div></td></tr>`;
    return;
  }

  target.innerHTML = state.collections.symptoms
    .map(
      (symptom) => `
        <tr>
          <td>${escapeHtml(symptom.name)}</td>
          <td><span class="tag ${severityTagClass(symptom.severity)}">${escapeHtml(labelForSeverity(symptom.severity))}</span></td>
          <td>${escapeHtml(symptom.specialty)}</td>
          <td>${statusChip(symptom.active ? "Ativo" : "Inativo", symptom.active ? "active" : "inactive")}</td>
          <td class="has-text-right">
            <div class="buttons is-justify-content-flex-end">
              <button class="button is-small is-light" type="button" data-symptom-edit="${symptom.id}" aria-label="Editar sintoma ${escapeHtml(symptom.name)}">Editar</button>
              <button class="button is-small ${symptom.active ? "is-danger is-light" : "is-success is-light"}" type="button" data-symptom-toggle="${symptom.id}" aria-label="${symptom.active ? "Inativar" : "Ativar"} sintoma ${escapeHtml(symptom.name)}">${symptom.active ? "Inativar" : "Ativar"}</button>
            </div>
          </td>
        </tr>
      `
    )
    .join("");

  target.querySelectorAll("[data-symptom-edit]").forEach((button) => {
    button.addEventListener("click", () => fillSymptomForm(button.dataset.symptomEdit));
  });
  target.querySelectorAll("[data-symptom-toggle]").forEach((button) => {
    button.addEventListener("click", () => handleSymptomStatusToggle(button.dataset.symptomToggle));
  });
}

function resetSymptomFilters() {
  document.getElementById("symptom-filter-form").reset();
  safeLoadSymptoms();
  renderCapabilityWarnings();
}

function resetSymptomForm() {
  document.getElementById("symptom-form").reset();
  document.getElementById("symptom-id").value = "";
  document.getElementById("symptom-active").checked = true;
  document.getElementById("symptom-form-title").textContent = "Cadastrar sintoma";
  hideInlineError("symptom-form-error");
}

function openSymptomCreateForm() {
  resetSymptomForm();
  setFormPanelVisibility("symptom", true);
}

function closeSymptomForm() {
  resetSymptomForm();
  setFormPanelVisibility("symptom", false, { focus: false });
}

function fillSymptomForm(id) {
  const symptom = state.collections.symptoms.find((item) => item.id === id);
  if (!symptom) return;

  document.getElementById("symptom-id").value = symptom.id;
  document.getElementById("symptom-name").value = symptom.name;
  document.getElementById("symptom-description").value = symptom.description || "";
  document.getElementById("symptom-severity").value = symptom.severity;
  document.getElementById("symptom-specialty").value = symptom.specialty;
  document.getElementById("symptom-active").checked = symptom.active;
  document.getElementById("symptom-form-title").textContent = "Editar sintoma";
  hideInlineError("symptom-form-error");
  setFormPanelVisibility("symptom", true);
}

async function handleSymptomFormSubmit(event) {
  event.preventDefault();
  hideInlineError("symptom-form-error");

  const id = document.getElementById("symptom-id").value;
  const payload = {
    name: document.getElementById("symptom-name").value.trim(),
    description: document.getElementById("symptom-description").value.trim(),
    severity: document.getElementById("symptom-severity").value,
    specialty: document.getElementById("symptom-specialty").value.trim(),
    active: document.getElementById("symptom-active").checked
  };

  try {
    const response = await apiRequest(id ? `/symptoms/${id}` : "/symptoms", {
      method: id ? "PUT" : "POST",
      body: payload
    });
    await Promise.all([safeLoadSymptoms(), safeLoadSymptomsForTriage()]);
    renderCapabilityWarnings();
    closeSymptomForm();
    showFeedback(response.message || "Sintoma salvo com sucesso.", "success");
  } catch (error) {
    showInlineError("symptom-form-error", normalizeErrorMessage(error));
  }
}

async function handleSymptomStatusToggle(id) {
  const symptom = state.collections.symptoms.find((item) => item.id === id);
  if (!symptom) {
    return;
  }

  try {
    const response = await apiRequest(`/symptoms/${id}`, {
      method: "PUT",
      body: {
        active: !symptom.active
      }
    });
    await Promise.all([safeLoadSymptoms({ includeInactive: true }), safeLoadSymptomsForTriage()]);
    renderCapabilityWarnings();
    showFeedback(response.message || `Sintoma ${symptom.active ? "inativado" : "ativado"} com sucesso.`, "success");
  } catch (error) {
    showFeedback(normalizeErrorMessage(error), "danger");
  }
}

async function loadUsers() {
  const response = await apiRequest("/users");
  state.collections.users = response.data;
  renderUsers();
}

function renderUsers() {
  const target = document.getElementById("users-table-body");
  target.innerHTML = "";

  if (state.collections.users.length === 0) {
    target.innerHTML = `<tr><td colspan="5"><div class="empty-state compact">Nenhum usuário encontrado.</div></td></tr>`;
    return;
  }

  target.innerHTML = state.collections.users
    .map(
      (user) => `
        <tr>
          <td>${escapeHtml(user.name)}</td>
          <td>${escapeHtml(user.email)}</td>
          <td>${escapeHtml(labelForRole(user.role))}</td>
          <td>${statusChip(user.active ? "Ativo" : "Inativo", user.active ? "active" : "inactive")}</td>
          <td class="has-text-right">
            <div class="buttons is-justify-content-flex-end">
              <button class="button is-small is-light" type="button" data-user-edit="${user.id}" aria-label="Editar usuário ${escapeHtml(user.name)}">Editar</button>
              <button class="button is-small ${user.active ? "is-danger is-light" : "is-success is-light"}" type="button" data-user-toggle="${user.id}" aria-label="${user.active ? "Inativar" : "Ativar"} usuário ${escapeHtml(user.name)}">${user.active ? "Inativar" : "Ativar"}</button>
            </div>
          </td>
        </tr>
      `
    )
    .join("");

  target.querySelectorAll("[data-user-edit]").forEach((button) => {
    button.addEventListener("click", () => fillUserForm(button.dataset.userEdit));
  });
  target.querySelectorAll("[data-user-toggle]").forEach((button) => {
    button.addEventListener("click", () => handleUserStatusToggle(button.dataset.userToggle));
  });
}

function resetUserForm() {
  document.getElementById("user-form").reset();
  document.getElementById("user-id").value = "";
  document.getElementById("user-active").checked = true;
  document.getElementById("user-form-title").textContent = "Cadastrar usuário";
  hideInlineError("user-form-error");
}

function openUserCreateForm() {
  resetUserForm();
  setFormPanelVisibility("user", true);
}

function closeUserForm() {
  resetUserForm();
  setFormPanelVisibility("user", false, { focus: false });
}

function fillUserForm(id) {
  const user = state.collections.users.find((item) => item.id === id);
  if (!user) return;

  document.getElementById("user-id").value = user.id;
  document.getElementById("user-name").value = user.name;
  document.getElementById("user-email").value = user.email;
  document.getElementById("user-role").value = user.role;
  document.getElementById("user-password").value = "";
  document.getElementById("user-active").checked = user.active;
  document.getElementById("user-form-title").textContent = "Editar usuário";
  hideInlineError("user-form-error");
  setFormPanelVisibility("user", true);
}

async function handleUserFormSubmit(event) {
  event.preventDefault();
  hideInlineError("user-form-error");

  const id = document.getElementById("user-id").value;
  const isCurrentUser = Boolean(id && id === state.user?.id);
  const payload = {
    name: document.getElementById("user-name").value.trim(),
    email: document.getElementById("user-email").value.trim(),
    role: document.getElementById("user-role").value,
    active: document.getElementById("user-active").checked
  };
  const password = document.getElementById("user-password").value;
  if (!id && !password) {
    showInlineError("user-form-error", "Informe uma senha para criar o usuário.");
    return;
  }
  if (password) {
    payload.password = password;
  }

  try {
    const response = await apiRequest(id ? `/users/${id}` : "/users", {
      method: id ? "PUT" : "POST",
      body: payload
    });

    if (isCurrentUser) {
      state.user = response.data;
      localStorage.setItem("triage.user", JSON.stringify(state.user));
      renderUserIdentity();
      applyRoleVisibility();

      if (!response.data.active) {
        clearSession();
        showLogin();
        showInlineError("login-error", "Seu usuário foi inativado. Faça login com um perfil ativo.");
        return;
      }

      if (response.data.role !== "ADMIN") {
        closeUserForm();
        navigate("dashboard");
        showFeedback("Seu perfil foi atualizado. O acesso administrativo desta sessao foi encerrado.", "warning");
        return;
      }
    }

    await loadUsers();
    closeUserForm();
    showFeedback(response.message || "Usuário salvo com sucesso.", "success");
  } catch (error) {
    showInlineError("user-form-error", normalizeErrorMessage(error));
  }
}

async function handleUserStatusToggle(id) {
  const user = state.collections.users.find((item) => item.id === id);
  if (!user) {
    return;
  }

  try {
    const response = await apiRequest(`/users/${id}`, {
      method: "PUT",
      body: {
        active: !user.active
      }
    });

    if (id === state.user?.id) {
      clearSession();
      showLogin();
      showInlineError("login-error", response.message || `Seu usuário foi ${user.active ? "inativado" : "ativado"}. Faça login novamente.`);
      return;
    }

    await loadUsers();
    showFeedback(response.message || `Usuário ${user.active ? "inativado" : "ativado"} com sucesso.`, "success");
  } catch (error) {
    showFeedback(normalizeErrorMessage(error), "danger");
  }
}

async function apiRequest(path, options = {}) {
  const { method = "GET", body, auth = true } = options;
  const requestOptions = {
    method,
    headers: {
      "Content-Type": "application/json"
    }
  };

  if (auth && state.token) {
    requestOptions.headers.Authorization = `Bearer ${state.token}`;
  }

  if (body !== undefined) {
    requestOptions.body = JSON.stringify(body);
  }

  const response = await fetch(`/web-api${path}`, requestOptions);
  const data = await response.json().catch(() => ({
    success: false,
    error: {
      message: "Resposta invalida do servidor."
    }
  }));

  if (!response.ok) {
    if (isSessionError(data)) {
      clearSession();
      showLogin();
      showInlineError("login-error", normalizeErrorMessage(data));
    }
    throw data;
  }

  return data;
}

function isSessionError(error) {
  return ["MISSING_TOKEN", "INVALID_TOKEN", "INVALID_TOKEN_USER"].includes(error?.error?.code);
}

function populateSelect(selectElement, options, placeholder, keepEmpty = false) {
  const currentValue = selectElement.value;
  selectElement.innerHTML = "";

  const placeholderOption = document.createElement("option");
  placeholderOption.value = "";
  placeholderOption.textContent = placeholder;
  selectElement.appendChild(placeholderOption);

  options.forEach((option) => {
    const element = document.createElement("option");
    element.value = option.value;
    element.textContent = option.label;
    selectElement.appendChild(element);
  });

  if (keepEmpty) {
    selectElement.value = currentValue;
  } else if (currentValue && options.some((option) => option.value === currentValue)) {
    selectElement.value = currentValue;
  }
}

function showFeedback(message, tone = "success") {
  const element = document.getElementById("global-feedback");
  element.className = `notification is-${tone} is-light`;
  element.textContent = message;
  element.classList.remove("is-hidden");
  window.clearTimeout(showFeedback.timeoutId);
  showFeedback.timeoutId = window.setTimeout(() => {
    element.classList.add("is-hidden");
  }, 4500);
}

function showInlineError(id, message) {
  const element = document.getElementById(id);
  element.textContent = message;
  element.classList.remove("is-hidden");
}

function hideInlineError(id) {
  document.getElementById(id).classList.add("is-hidden");
}

function loadStoredTheme() {
  const savedTheme = localStorage.getItem("triage.theme");
  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme) {
  state.theme = theme;
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("triage.theme", theme);
  updateThemeToggleLabels();
}

function toggleTheme() {
  applyTheme(state.theme === "dark" ? "light" : "dark");
}

function updateThemeToggleLabels() {
  document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
    button.textContent = state.theme === "dark" ? "Usar modo claro" : "Usar modo noturno";
    button.setAttribute(
      "aria-label",
      state.theme === "dark" ? "Alternar para modo claro" : "Alternar para modo noturno"
    );
  });
}

function normalizeErrorMessage(error) {
  const details = error?.error?.details;
  const baseMessage = error?.error?.message || error?.message || "Não foi possível concluir a operação.";

  if (Array.isArray(details) && details.length > 0) {
    return `${baseMessage} Detalhes: ${details.join(", ")}.`;
  }

  if (details && typeof details === "object") {
    const compactDetails = Object.entries(details)
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ");

    if (compactDetails) {
      return `${baseMessage} Detalhes: ${compactDetails}.`;
    }
  }

  return baseMessage;
}

function setButtonLoading(button, isLoading, label) {
  if (!button) {
    return;
  }

  button.disabled = isLoading;
  button.classList.toggle("is-loading", isLoading);
  button.textContent = label;
}

function syncAppointmentDateConstraints() {
  const patientBirthdateField = document.getElementById("patient-birthdate");
  const scheduledAtField = document.getElementById("appointment-scheduled-at");
  const filterFromField = document.getElementById("appointment-filter-from");
  const filterToField = document.getElementById("appointment-filter-to");
  const minimumDateTime = currentLocalDateTimeValue();

  if (patientBirthdateField) {
    patientBirthdateField.max = toLocalDateInputValue(new Date());
  }

  if (scheduledAtField) {
    scheduledAtField.min = minimumDateTime;
    scheduledAtField.step = "60";
  }

  if (filterFromField) {
    filterFromField.max = getCustomPickerValue("appointment-filter-to") || "";
    filterFromField.step = "60";
  }

  if (filterToField) {
    filterToField.min = getCustomPickerValue("appointment-filter-from") || "";
    filterToField.step = "60";
  }
}

function nextAvailableAppointmentDateTime() {
  const scheduledAt = new Date();
  scheduledAt.setMinutes(0, 0, 0);
  scheduledAt.setHours(scheduledAt.getHours() + 1);

  return toLocalDateTimeInputValue(scheduledAt);
}

function currentLocalDateTimeValue() {
  const current = new Date();
  current.setSeconds(0, 0);
  return toLocalDateTimeInputValue(current);
}

function shiftCalendarMonth(input, monthOffset) {
  if (!input?.value) {
    return;
  }

  if (input.type === "date") {
    const [yearText, monthText, dayText] = input.value.split("-");
    const year = Number(yearText);
    const month = Number(monthText);
    const day = Number(dayText);
    if ([year, month, day].some((part) => Number.isNaN(part))) {
      return;
    }

    input.value = toLocalDateInputValue(createShiftedDate(year, month, day, monthOffset));
    input.dispatchEvent(new Event("change", { bubbles: true }));
    return;
  }

  if (input.type === "datetime-local") {
    const [datePart, timePart = "00:00"] = input.value.split("T");
    const [yearText, monthText, dayText] = datePart.split("-");
    const [hoursText = "00", minutesText = "00"] = timePart.split(":");
    const year = Number(yearText);
    const month = Number(monthText);
    const day = Number(dayText);
    const hours = Number(hoursText);
    const minutes = Number(minutesText);

    if ([year, month, day, hours, minutes].some((part) => Number.isNaN(part))) {
      return;
    }

    input.value = toLocalDateTimeInputValue(createShiftedDate(year, month, day, monthOffset, hours, minutes));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }
}

function createShiftedDate(year, month, day, monthOffset, hours = 0, minutes = 0) {
  const shiftedMonthIndex = month - 1 + monthOffset;
  const targetYear = year + Math.floor(shiftedMonthIndex / 12);
  const normalizedMonthIndex = ((shiftedMonthIndex % 12) + 12) % 12;
  const lastDayOfTargetMonth = new Date(targetYear, normalizedMonthIndex + 1, 0).getDate();
  const safeDay = Math.min(day, lastDayOfTargetMonth);

  return new Date(targetYear, normalizedMonthIndex, safeDay, hours, minutes, 0, 0);
}

function toLocalDateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function toLocalDateTimeInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function validateAppointmentDateTime(value) {
  if (!value) {
    return "Selecione a data e a hora do agendamento.";
  }

  if (!isValidDateTimeInputValue(value)) {
    return "Informe uma data e hora válida entre 00 e 23 horas e 00 e 59 minutos.";
  }

  const scheduledAt = new Date(value);
  if (Number.isNaN(scheduledAt.getTime())) {
    return "Informe uma data e hora validas para o agendamento.";
  }

  if (scheduledAt.getTime() < Date.now()) {
    return "Selecione uma data e hora futuras para o agendamento.";
  }

  return "";
}

function validateAppointmentFilterRange(from, to) {
  if (!from || !to) {
    return "";
  }

  if (!isValidDateTimeInputValue(from) || !isValidDateTimeInputValue(to)) {
    return "Revise o intervalo informado. As horas devem ir de 00 a 23 e os minutos de 00 a 59.";
  }

  const fromDate = new Date(from);
  const toDate = new Date(to);

  if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
    return "Revise o intervalo de datas informado nos filtros.";
  }

  if (fromDate.getTime() > toDate.getTime()) {
    return "O filtro 'De' não pode ser maior que o filtro 'Até'.";
  }

  return "";
}

function isValidDateTimeInputValue(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) {
    return false;
  }

  const [, yearText, monthText, dayText, hourText, minuteText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const hour = Number(hourText);
  const minute = Number(minuteText);

  if (month < 1 || month > 12 || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return false;
  }

  const date = new Date(year, month - 1, day, hour, minute, 0, 0);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day &&
    date.getHours() === hour &&
    date.getMinutes() === minute
  );
}

function normalizeConsultResult(payload) {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const suggestedSpecialty = typeof payload.suggestedSpecialty === "string" ? payload.suggestedSpecialty.trim() : "";
  const priority = typeof payload.priority === "string" ? payload.priority.trim().toUpperCase() : "";
  const symptomsSource = Array.isArray(payload.symptomsConsidered)
    ? payload.symptomsConsidered
    : Array.isArray(payload.symptoms)
      ? payload.symptoms
      : state.triageDraft.symptoms;

  if (!suggestedSpecialty || !priority) {
    return null;
  }

  return {
    suggestedSpecialty,
    priority,
    symptomsConsidered: symptomsSource.filter(Boolean)
  };
}

function renderCapabilityWarnings() {
  renderCapabilityWarning(
    "triage-catalog-warning",
    state.capabilityWarnings.symptoms
      ? `Catálogo de sintomas indisponível para este perfil. Detalhe: ${state.capabilityWarnings.symptoms}`
      : ""
  );
  renderCapabilityWarning(
    "appointment-catalog-warning",
    state.capabilityWarnings.doctors
      ? `Catálogo de médicos indisponível para este perfil. Detalhe: ${state.capabilityWarnings.doctors}`
      : ""
  );
}

function renderCapabilityWarning(id, message) {
  const element = document.getElementById(id);

  if (!message) {
    element.classList.add("is-hidden");
    element.textContent = "";
    return;
  }

  element.textContent = message;
  element.classList.remove("is-hidden");
}

function toQueryString(query) {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, value);
    }
  });

  const serialized = params.toString();
  return serialized ? `?${serialized}` : "";
}

function statusChip(label, tone) {
  return `<span class="status-chip status-${escapeHtml(tone)}">${escapeHtml(label)}</span>`;
}

function severityTagClass(severity) {
  return severityBadgeClass(severity);
}

function severityBadgeClass(severity) {
  return {
    LOW: "severity-low",
    MEDIUM: "severity-medium",
    HIGH: "severity-high",
    CRITICAL: "severity-critical"
  }[severity] || "severity-medium";
}

function labelForRole(role) {
  return {
    ADMIN: "Administrador",
    RECEPTIONIST: "Recepção",
    DOCTOR: "Médico"
  }[role] || role;
}

function labelForSeverity(severity) {
  return {
    LOW: "Baixa",
    MEDIUM: "Media",
    HIGH: "Alta",
    CRITICAL: "Critica"
  }[severity] || severity;
}

function labelForStatus(status) {
  return {
    SCHEDULED: "Agendado"
  }[status] || status;
}

function populateAppointmentFilterSelectors() {
  populateSelect(
    document.getElementById("appointment-filter-patient-id"),
    state.collections.patients.map((patient) => ({
      value: patient.id,
      label: `${patient.name} - ${patient.document}`
    })),
    "Todos",
    true
  );

  populateSelect(
    document.getElementById("appointment-filter-doctor-id"),
    state.collections.doctors.map((doctor) => ({
      value: doctor.id,
      label: `${doctor.name} - ${doctor.specialty}`
    })),
    "Todos",
    true
  );
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDateTime(value) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  });
}

function toIsoString(value) {
  return value ? new Date(value).toISOString() : "";
}

function startOfTodayIso() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
}

function endOfTodayIso() {
  const date = new Date();
  date.setHours(23, 59, 59, 999);
  return date.toISOString();
}

async function loadDashboardAppointments() {
  const response = await apiRequest(
    `/appointments${toQueryString({ scheduledFrom: startOfTodayIso(), scheduledTo: endOfTodayIso() })}`
  );
  state.collections.dashboardAppointments = response.data;
  renderDashboardAppointments();
}

function renderDashboardAppointments() {
  const target = document.getElementById("dashboard-appointments-list");
  target.innerHTML = "";

  const appointmentsToday = [...state.collections.dashboardAppointments].sort(
    (left, right) => new Date(left.scheduledAt).getTime() - new Date(right.scheduledAt).getTime()
  );

  if (appointmentsToday.length === 0) {
    target.innerHTML = `<div class="empty-state compact">Nenhum agendamento para hoje.</div>`;
    return;
  }

  target.innerHTML = appointmentsToday
    .slice(0, 6)
    .map((appointment) => {
      const patient = state.collections.patients.find((item) => item.id === appointment.patientId);
      const doctor = state.collections.doctors.find((item) => item.id === appointment.doctorId);

      return `
        <article class="stack-item">
          <div class="is-flex is-justify-content-space-between is-align-items-center mb-2">
            <strong>${escapeHtml(patient?.name || `Paciente #${appointment.patientId}`)}</strong>
            ${statusChip(labelForStatus(appointment.status), appointment.status.toLowerCase())}
          </div>
          <p class="mb-1">${escapeHtml(doctor?.name || `Médico #${appointment.doctorId}`)}</p>
          <p class="has-text-grey is-size-7">${formatDateTime(appointment.scheduledAt)}</p>
        </article>
      `;
    })
    .join("");
}

function normalizeTriageStaticCopy() {
  document.querySelectorAll("#route-triage .triage-step").forEach((element, index) => {
    const labels = ["1. Paciente", "2. Sintomas", "3. Resultado", "4. Confirma\u00e7\u00e3o"];
    if (labels[index]) {
      element.textContent = labels[index];
    }
  });

  const openPatientFormButton = document.getElementById("triage-open-patient-form");
  if (openPatientFormButton) {
    openPatientFormButton.textContent = "Cadastro r\u00e1pido";
  }

  const notesTitle = document.querySelector("#route-triage .triage-side-column .box.app-card:last-child .title");
  if (notesTitle) {
    notesTitle.textContent = "Observa\u00e7\u00f5es da triagem";
  }

  const symptomSeveritySelect = document.getElementById("triage-symptom-severity");
  if (symptomSeveritySelect) {
    const mediumOption = symptomSeveritySelect.querySelector('option[value="MEDIUM"]');
    const criticalOption = symptomSeveritySelect.querySelector('option[value="CRITICAL"]');
    if (mediumOption) {
      mediumOption.textContent = "M\u00e9dia";
    }
    if (criticalOption) {
      criticalOption.textContent = "Cr\u00edtica";
    }
  }
}

function renderSelectedPatient() {
  const target = document.getElementById("triage-selected-patient");
  const patient = state.triageDraft.patient;
  const patientSelect = document.getElementById("triage-patient-id");

  if (!patient) {
    if (patientSelect.value) {
      patientSelect.value = "";
    }
    target.className = "empty-state compact";
    target.textContent = "Selecione um paciente para iniciar a triagem.";
    return;
  }

  if (patientSelect.value !== patient.id) {
    patientSelect.value = patient.id;
  }

  target.className = "stack-item triage-patient-summary";
  target.innerHTML = `
    <strong class="triage-patient-summary__name">${escapeHtml(patient.name)}</strong>
    <p class="mb-1"><span class="has-text-weight-semibold">Documento:</span> ${escapeHtml(patient.document)}</p>
    <p class="mb-1"><span class="has-text-weight-semibold">Telefone:</span> ${escapeHtml(patient.phone)}</p>
    <p class="is-size-7 has-text-grey">${patient.active ? "Paciente ativo" : "Paciente inativo"}</p>
  `;
}

function renderTriageSymptoms() {
  const target = document.getElementById("triage-symptom-list");
  target.innerHTML = "";

  if (state.collections.triageSymptoms.length === 0) {
    target.innerHTML = `<div class="empty-state compact">Nenhum sintoma encontrado para os filtros aplicados.</div>`;
    return;
  }

  target.innerHTML = state.collections.triageSymptoms
    .map((symptom) => {
      const selected = state.triageDraft.symptoms.some((item) => item.id === symptom.id);

      return `
        <label class="choice-card ${selected ? "is-selected" : ""}">
          <div class="is-flex is-justify-content-space-between is-align-items-flex-start">
            <strong>${escapeHtml(symptom.name)}</strong>
            <input type="checkbox" data-symptom-select="${symptom.id}" ${selected ? "checked" : ""} />
          </div>
          <p class="has-text-grey is-size-7">${escapeHtml(symptom.description || "Sem descri\u00e7\u00e3o informada.")}</p>
          <div class="tags">
            <span class="tag ${severityTagClass(symptom.severity)}">Severidade ${escapeHtml(labelForSeverity(symptom.severity))}</span>
            <span class="tag is-light">${escapeHtml(symptom.specialty)}</span>
          </div>
        </label>
      `;
    })
    .join("");

  target.querySelectorAll("[data-symptom-select]").forEach((checkbox) => {
    checkbox.addEventListener("change", () => toggleSymptomSelection(checkbox.dataset.symptomSelect));
  });
}

function renderTriageResult() {
  const target = document.getElementById("triage-result");
  const consultResult = state.triageDraft.consultResult;
  const triage = state.triageDraft.triage;
  const consultPending = state.triageDraft.consultPending;
  const consultError = state.triageDraft.consultError;

  target.removeAttribute("role");

  if (consultPending) {
    target.className = "empty-state compact";
    target.textContent = "Consultando especialista e calculando a prioridade da triagem...";
    return;
  }

  if (consultError) {
    target.className = "notification is-danger is-light";
    target.setAttribute("role", "alert");
    target.textContent = consultError;
    revealTriageResult();
    return;
  }

  if (!consultResult) {
    target.className = "empty-state compact";
    target.textContent = "O especialista sugerido e a prioridade aparecer\u00e3o aqui ap\u00f3s a consulta.";
    return;
  }

  const symptoms = consultResult.symptomsConsidered?.length
    ? consultResult.symptomsConsidered
    : state.triageDraft.symptoms;

  target.className = "";
  target.innerHTML = `
    <div class="result-grid">
      <div class="result-box">
        <p class="eyebrow has-text-primary">Especialista sugerido</p>
        <h4 class="title is-4 mt-2 mb-0">${escapeHtml(consultResult.suggestedSpecialty)}</h4>
        <p class="mt-2 has-text-grey">Consulte a sugest\u00e3o e confirme o registro da triagem para continuar.</p>
      </div>
      <div class="result-box">
        <p class="eyebrow has-text-primary">Prioridade</p>
        <div class="mt-3">
          <span class="severity-badge ${severityBadgeClass(consultResult.priority)}">Prioridade ${escapeHtml(labelForSeverity(consultResult.priority))}</span>
        </div>
      </div>
      <div class="result-box">
        <p class="eyebrow has-text-primary">Status</p>
        <p class="mt-3">${triage ? "Triagem registrada e pronta para agendamento." : "Sugest\u00e3o pronta. Revise e registre a triagem para seguir."}</p>
      </div>
    </div>
    <div class="content triage-result-details">
      <p class="has-text-weight-semibold mb-2">Sintomas considerados</p>
      ${
        symptoms.length > 0
          ? `<div class="table-container result-table-container">
              <table class="table is-fullwidth is-hoverable result-table">
                <thead>
                  <tr>
                    <th>Sintoma</th>
                    <th>Especialidade</th>
                    <th>Severidade</th>
                  </tr>
                </thead>
                <tbody>
                  ${symptoms
                    .map(
                      (symptom) => `
                        <tr>
                          <td>${escapeHtml(symptom.name || "-")}</td>
                          <td>${escapeHtml(symptom.specialty || "-")}</td>
                          <td>${escapeHtml(labelForSeverity(symptom.severity || consultResult.priority))}</td>
                        </tr>
                      `
                    )
                    .join("")}
                </tbody>
              </table>
            </div>`
          : `<p class="has-text-grey mb-0">A API n\u00e3o retornou a lista de sintomas, mas a sugest\u00e3o j\u00e1 est\u00e1 pronta para confirma\u00e7\u00e3o.</p>`
      }
    </div>
    ${
      triage
        ? `<div class="buttons mt-4">
            <button id="triage-go-appointment" class="button is-primary" type="button">Agendar consulta</button>
            <button id="triage-reset-flow" class="button is-light" type="button">Nova triagem</button>
          </div>`
        : `<div class="buttons mt-4">
            <button id="triage-result-create" class="button is-primary" type="button">Registrar triagem</button>
          </div>`
    }
  `;

  document.getElementById("triage-result-create")?.addEventListener("click", handleTriageCreate);
  document.getElementById("triage-go-appointment")?.addEventListener("click", () => {
    fillAppointmentFromTriage();
    navigate("appointments");
  });
  document.getElementById("triage-reset-flow")?.addEventListener("click", resetTriageFlow);
  revealTriageResult();
}

function renderCapabilityWarnings() {
  renderCapabilityWarning(
    "triage-catalog-warning",
    state.capabilityWarnings.symptoms
      ? `Cat\u00e1logo de sintomas indispon\u00edvel para este perfil. Detalhe: ${state.capabilityWarnings.symptoms}`
      : ""
  );
  renderCapabilityWarning(
    "appointment-catalog-warning",
    state.capabilityWarnings.doctors
      ? `Cat\u00e1logo de m\u00e9dicos indispon\u00edvel para este perfil. Detalhe: ${state.capabilityWarnings.doctors}`
      : ""
  );
}

function labelForRole(role) {
  return {
    ADMIN: "Administrador",
    RECEPTIONIST: "Recep\u00e7\u00e3o",
    DOCTOR: "M\u00e9dico"
  }[role] || role;
}

function labelForSeverity(severity) {
  return {
    LOW: "Baixa",
    MEDIUM: "M\u00e9dia",
    HIGH: "Alta",
    CRITICAL: "Cr\u00edtica"
  }[severity] || severity;
}

function resetFiltersOnRouteLeave(previousRoute, nextRoute) {
  if (!previousRoute || previousRoute === nextRoute) {
    return;
  }

  if (previousRoute === "patients") {
    document.getElementById("patient-filter-form")?.reset();
    loadPatients();
    return;
  }

  if (previousRoute === "triage") {
    document.getElementById("triage-symptom-filter-form")?.reset();
    safeLoadSymptomsForTriage();
    return;
  }

  if (previousRoute === "appointments") {
    document.getElementById("appointment-filter-form")?.reset();
    resetCustomPickerFields("appointment-filter-form");
    loadAppointments();
    return;
  }

  if (previousRoute === "doctors") {
    document.getElementById("doctor-filter-form")?.reset();
    safeLoadDoctors(DEFAULT_DOCTOR_QUERY);
    renderCapabilityWarnings();
    return;
  }

  if (previousRoute === "symptoms") {
    document.getElementById("symptom-filter-form")?.reset();
    safeLoadSymptoms();
  }
}

function navigate(route) {
  if (state.user?.role !== "ADMIN" && ["doctors", "symptoms", "users"].includes(route)) {
    showFeedback("Voc\u00ea n\u00e3o tem permiss\u00e3o para acessar esta \u00e1rea.", "danger");
    return;
  }

  const previousRoute = state.route;
  resetFiltersOnRouteLeave(previousRoute, route);
  state.route = route;

  document.querySelectorAll(".route-section").forEach((section) => section.classList.add("is-hidden"));
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.remove("is-active");
    link.removeAttribute("aria-current");
  });

  document.getElementById(`route-${route}`).classList.remove("is-hidden");

  const mainContent = document.getElementById("main-content");
  if (mainContent) {
    mainContent.classList.toggle("is-triage-route", route === "triage");
    mainContent.scrollTo({ top: 0, behavior: "auto" });
  }

  const activeLink = document.querySelector(`[data-route="${route}"]`);
  activeLink?.classList.add("is-active");
  activeLink?.setAttribute("aria-current", "page");
  document.getElementById("page-title").textContent = pageTitle(route);
  document.getElementById("page-subtitle").textContent = pageMeta[route] || "";

  if (route === "dashboard") {
    renderDashboardAppointments();
  }

  requestAnimationFrame(() => {
    document.getElementById("page-title").focus();
  });
}

function revealTriageResult() {
  const target = document.getElementById("triage-result");
  const panel = target.closest(".triage-result-panel");
  const mainContent = document.getElementById("main-content");
  const topbar = document.querySelector(".topbar");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const behavior = prefersReducedMotion ? "auto" : "smooth";

  requestAnimationFrame(() => {
    if (panel) {
      panel.scrollTo({ top: 0, behavior });
    }

    if (panel && mainContent) {
      const mainRect = mainContent.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      const topbarHeight = topbar?.getBoundingClientRect().height || 0;
      const visibleOffset = Math.min(topbarHeight, 96) + 16;
      const delta = panelRect.top - mainRect.top - visibleOffset;
      const nextTop = Math.max(0, mainContent.scrollTop + delta);
      mainContent.scrollTo({ top: nextTop, behavior });
    } else if (panel) {
      panel.scrollIntoView({ block: "start", behavior });
    }

    target.focus({ preventScroll: true });
  });
}

function renderSelectedPatient() {
  const target = document.getElementById("triage-selected-patient");
  const patient = state.triageDraft.patient;
  const patientSelect = document.getElementById("triage-patient-id");

  if (!patient) {
    if (patientSelect.value) {
      patientSelect.value = "";
    }
    target.className = "empty-state compact";
    target.textContent = "Selecione um paciente para iniciar a triagem.";
    return;
  }

  if (patientSelect.value !== patient.id) {
    patientSelect.value = patient.id;
  }

  target.className = "stack-item triage-patient-summary";
  target.innerHTML = `
    <strong class="triage-patient-summary__name">${escapeHtml(patient.name)}</strong>
    <p class="mb-1"><span class="has-text-weight-semibold">Documento:</span> ${escapeHtml(patient.document)}</p>
    <p class="mb-1"><span class="has-text-weight-semibold">Telefone:</span> ${escapeHtml(patient.phone)}</p>
    <p class="is-size-7 has-text-grey">${patient.active ? "Paciente ativo" : "Paciente inativo"}</p>
  `;
}

function renderTriageSymptoms() {
  const target = document.getElementById("triage-symptom-list");
  target.innerHTML = "";

  if (state.collections.triageSymptoms.length === 0) {
    target.innerHTML = `<div class="empty-state compact">Nenhum sintoma encontrado para os filtros aplicados.</div>`;
    return;
  }

  target.innerHTML = state.collections.triageSymptoms
    .map((symptom) => {
      const selected = state.triageDraft.symptoms.some((item) => item.id === symptom.id);

      return `
        <label class="choice-card ${selected ? "is-selected" : ""}">
          <div class="is-flex is-justify-content-space-between is-align-items-flex-start">
            <strong>${escapeHtml(symptom.name)}</strong>
            <input type="checkbox" data-symptom-select="${symptom.id}" ${selected ? "checked" : ""} />
          </div>
          <p class="has-text-grey is-size-7">${escapeHtml(symptom.description || "Sem descrição informada.")}</p>
          <div class="tags">
            <span class="tag ${severityTagClass(symptom.severity)}">Severidade ${escapeHtml(labelForSeverity(symptom.severity))}</span>
            <span class="tag is-light">${escapeHtml(symptom.specialty)}</span>
          </div>
        </label>
      `;
    })
    .join("");

  target.querySelectorAll("[data-symptom-select]").forEach((checkbox) => {
    checkbox.addEventListener("change", () => toggleSymptomSelection(checkbox.dataset.symptomSelect));
  });
}

function renderTriageResult() {
  const target = document.getElementById("triage-result");
  const consultResult = state.triageDraft.consultResult;
  const triage = state.triageDraft.triage;
  const consultPending = state.triageDraft.consultPending;
  const consultError = state.triageDraft.consultError;

  target.removeAttribute("role");

  if (consultPending) {
    target.className = "empty-state compact";
    target.textContent = "Consultando especialista e calculando a prioridade da triagem...";
    return;
  }

  if (consultError) {
    target.className = "notification is-danger is-light";
    target.setAttribute("role", "alert");
    target.textContent = consultError;
    revealTriageResult();
    return;
  }

  if (!consultResult) {
    target.className = "empty-state compact";
    target.textContent = "O especialista sugerido e a prioridade aparecerão aqui após a consulta.";
    return;
  }

  const symptoms = consultResult.symptomsConsidered?.length
    ? consultResult.symptomsConsidered
    : state.triageDraft.symptoms;

  target.className = "";
  target.innerHTML = `
    <div class="result-grid">
      <div class="result-box">
        <p class="eyebrow has-text-primary">Especialista sugerido</p>
        <h4 class="title is-4 mt-2 mb-0">${escapeHtml(consultResult.suggestedSpecialty)}</h4>
        <p class="mt-2 has-text-grey">Consulte a sugestão e confirme o registro da triagem para continuar.</p>
      </div>
      <div class="result-box">
        <p class="eyebrow has-text-primary">Prioridade</p>
        <div class="mt-3">
          <span class="severity-badge ${severityBadgeClass(consultResult.priority)}">Prioridade ${escapeHtml(labelForSeverity(consultResult.priority))}</span>
        </div>
      </div>
      <div class="result-box">
        <p class="eyebrow has-text-primary">Status</p>
        <p class="mt-3">${triage ? "Triagem registrada e pronta para agendamento." : "Sugestão pronta. Revise e registre a triagem para seguir."}</p>
      </div>
    </div>
    <div class="content triage-result-details">
      <p class="has-text-weight-semibold mb-2">Sintomas considerados</p>
      ${
        symptoms.length > 0
          ? `<div class="table-container result-table-container">
              <table class="table is-fullwidth is-hoverable result-table">
                <thead>
                  <tr>
                    <th>Sintoma</th>
                    <th>Especialidade</th>
                    <th>Severidade</th>
                  </tr>
                </thead>
                <tbody>
                  ${symptoms
                    .map(
                      (symptom) => `
                        <tr>
                          <td>${escapeHtml(symptom.name || "-")}</td>
                          <td>${escapeHtml(symptom.specialty || "-")}</td>
                          <td>${escapeHtml(labelForSeverity(symptom.severity || consultResult.priority))}</td>
                        </tr>
                      `
                    )
                    .join("")}
                </tbody>
              </table>
            </div>`
          : `<p class="has-text-grey mb-0">A API não retornou a lista de sintomas, mas a sugestão já está pronta para confirmação.</p>`
      }
    </div>
    ${
      triage
        ? `<div class="buttons mt-4">
            <button id="triage-go-appointment" class="button is-primary" type="button">Agendar consulta</button>
            <button id="triage-reset-flow" class="button is-light" type="button">Nova triagem</button>
          </div>`
        : `<div class="buttons mt-4">
            <button id="triage-result-create" class="button is-primary" type="button">Registrar triagem</button>
          </div>`
    }
  `;

  document.getElementById("triage-result-create")?.addEventListener("click", handleTriageCreate);
  document.getElementById("triage-go-appointment")?.addEventListener("click", () => {
    fillAppointmentFromTriage();
    navigate("appointments");
  });
  document.getElementById("triage-reset-flow")?.addEventListener("click", resetTriageFlow);
  revealTriageResult();
}

function renderCapabilityWarnings() {
  renderCapabilityWarning(
    "triage-catalog-warning",
    state.capabilityWarnings.symptoms
      ? `Catálogo de sintomas indisponível para este perfil. Detalhe: ${state.capabilityWarnings.symptoms}`
      : ""
  );
  renderCapabilityWarning(
    "appointment-catalog-warning",
    state.capabilityWarnings.doctors
      ? `Catálogo de médicos indisponível para este perfil. Detalhe: ${state.capabilityWarnings.doctors}`
      : ""
  );
}

function labelForRole(role) {
  return {
    ADMIN: "Administrador",
    RECEPTIONIST: "Recepção",
    DOCTOR: "Médico"
  }[role] || role;
}

function labelForSeverity(severity) {
  return {
    LOW: "Baixa",
    MEDIUM: "Média",
    HIGH: "Alta",
    CRITICAL: "Crítica"
  }[severity] || severity;
}
