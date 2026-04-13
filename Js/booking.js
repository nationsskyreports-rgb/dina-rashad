/* ===================================
   DINA RASHAD - INTERPRETER PWA
   Booking System JavaScript
   =================================== */

document.addEventListener('DOMContentLoaded', function() {
    initBookingForm();
    initCalendarPicker();
    initTimeSlots();
});

/* ===================================
   BOOKING FORM INITIALIZATION
   =================================== */
function initBookingForm() {
    const bookingForm = document.getElementById('bookingForm');
    
    if (bookingForm) {
        bookingForm.addEventListener('submit', handleBookingSubmit);
        
        const inputs = bookingForm.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => validateField(input));
            input.addEventListener('input', () => {
                if (input.classList.contains('error')) {
                    validateField(input);
                }
            });
        });
    }
}

/* ===================================
   CALENDAR PICKER
   =================================== */
function initCalendarPicker() {
    const calendarContainer = document.querySelector('.calendar-container');
    if (!calendarContainer) return;

    let currentDisplayDate = new Date();

    renderCalendar(currentDisplayDate);

    const prevMonth = document.getElementById('prevMonth');
    const nextMonth = document.getElementById('nextMonth');

    if (prevMonth) {
        prevMonth.addEventListener('click', () => {
            // منع الرجوع لشهر قبل الحالي
            const now = new Date();
            if (
                currentDisplayDate.getFullYear() === now.getFullYear() &&
                currentDisplayDate.getMonth() === now.getMonth()
            ) return;
            currentDisplayDate.setMonth(currentDisplayDate.getMonth() - 1);
            renderCalendar(currentDisplayDate);
        });
    }

    if (nextMonth) {
        nextMonth.addEventListener('click', () => {
            currentDisplayDate.setMonth(currentDisplayDate.getMonth() + 1);
            renderCalendar(currentDisplayDate);
        });
    }
}

function renderCalendar(date) {
    const calendarGrid = document.getElementById('calendarGrid');
    const currentMonthDisplay = document.getElementById('currentMonth');
    if (!calendarGrid) return;

    const year = date.getFullYear();
    const month = date.getMonth();

    if (currentMonthDisplay) {
        const monthNames = [
            'January','February','March','April','May','June',
            'July','August','September','October','November','December'
        ];
        currentMonthDisplay.textContent = `${monthNames[month]} ${year}`;
    }

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let calendarHTML = '';

    ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].forEach(day => {
        calendarHTML += `<div class="calendar-day-header">${day}</div>`;
    });

    for (let i = 0; i < firstDay; i++) {
        calendarHTML += `<div class="calendar-day empty"></div>`;
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const cellDate = new Date(year, month, day);
        cellDate.setHours(0, 0, 0, 0);
        const isPast = cellDate < today;
        const isToday = cellDate.getTime() === today.getTime();
        const dateStr = `${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
        const isSelected = document.getElementById('bookingDate')?.value === dateStr;

        let classes = 'calendar-day';
        if (isPast)     classes += ' past';
        if (isToday)    classes += ' today';
        if (isSelected) classes += ' selected';

        calendarHTML += `
            <div class="${classes}" data-date="${dateStr}" ${isPast ? '' : ''}>
                ${day}
            </div>
        `;
    }

    calendarGrid.innerHTML = calendarHTML;

    calendarGrid.querySelectorAll('.calendar-day:not(.empty):not(.past)').forEach(dayEl => {
        dayEl.addEventListener('click', function() {
            selectDate(this.dataset.date);
        });
    });
}

function selectDate(dateString) {
    const dateInput = document.getElementById('bookingDate');
    const timeSlotContainer = document.querySelector('.time-slots-container');
    const selectedDateDisplay = document.getElementById('selectedDateDisplay');

    if (dateInput) dateInput.value = dateString;

    // reset وقت سابق
    const timeInput = document.getElementById('bookingTime');
    if (timeInput) timeInput.value = '';
    document.querySelectorAll('.time-slot-btn.selected').forEach(b => b.classList.remove('selected'));

    document.querySelectorAll('.calendar-day.selected').forEach(el => el.classList.remove('selected'));
    const selectedDay = document.querySelector(`[data-date="${dateString}"]`);
    if (selectedDay) selectedDay.classList.add('selected');

    if (timeSlotContainer) {
        timeSlotContainer.style.display = 'block';
        setTimeout(() => timeSlotContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
    }

    if (selectedDateDisplay) {
        // ✅ FIX: إضافة timezone offset عشان التاريخ ميتغيرش
        const [y, m, d] = dateString.split('-').map(Number);
        const date = new Date(y, m - 1, d);
        selectedDateDisplay.textContent = '📅 ' + date.toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
        selectedDateDisplay.style.display = 'block'; // ✅ FIX: كانت مش بتتعرض
    }
}

/* ===================================
   TIME SLOTS
   =================================== */

// ✅ FIX: الدالة دي كانت مش موجودة خالص - ده أصل المشكلة
function getTimeSlots() {
    const slots = [];
    // من 7 الصبح لـ 8 بالليل، كل 30 دقيقة
    for (let h = 7; h <= 20; h++) {
        slots.push(`${String(h).padStart(2,'0')}:00`);
        if (h < 20) slots.push(`${String(h).padStart(2,'0')}:30`);
    }
    return slots;
}

function initTimeSlots() {
    const timeSlotsContainer = document.getElementById('timeSlots');
    if (!timeSlotsContainer) return;

    const slots = getTimeSlots();
    let slotsHTML = '';

    slots.forEach(slot => {
        slotsHTML += `
            <button type="button"
                    class="time-slot-btn"
                    data-time="${slot}"
                    onclick="selectTimeSlot(this)">
                ${formatTime12Hour(slot)}
            </button>
        `;
    });

    timeSlotsContainer.innerHTML = slotsHTML;
}

function selectTimeSlot(button) {
    const timeInput = document.getElementById('bookingTime');

    document.querySelectorAll('.time-slot-btn.selected').forEach(btn => {
        btn.classList.remove('selected');
    });

    button.classList.add('selected');

    if (timeInput) {
        timeInput.value = formatTime12Hour(button.dataset.time);
    }
}

function formatTime24To12(time24) {
    const [hours, minutes] = time24.split(':').map(Number);
    const ampm = hours < 12 ? 'AM' : 'PM';
    const hour12 = hours % 12 || 12;
    return `${hour12}:${String(minutes).padStart(2,'0')} ${ampm}`;
}

const formatTime12Hour = formatTime24To12;

/* ===================================
   FORM VALIDATION & SUBMISSION
   =================================== */
function validateField(input) {
    const value = input.value.trim();
    let isValid = true;
    let message = '';

    switch (input.type) {
        case 'text':
            if (input.required && !value) {
                isValid = false; message = 'This field is required';
            } else if (value && value.length < 2) {
                isValid = false; message = 'Please enter at least 2 characters';
            }
            break;
        case 'email':
            if (value && !isValidEmail(value)) {
                isValid = false; message = 'Please enter a valid email address';
            }
            break;
        case 'tel':
            if (input.required && !value) {
                isValid = false; message = 'Phone number is required';
            } else if (value && !isValidPhone(value)) {
                isValid = false; message = 'Please enter a valid phone number';
            }
            break;
        case 'select-one':
            if (input.required && !value) {
                isValid = false; message = 'Please select an option';
            }
            break;
    }

    if (!isValid) showError(input, message);
    else clearError(input);

    return isValid;
}

function validateForm(form) {
    const inputs = form.querySelectorAll('input[required], select[required]');
    let isFormValid = true;
    inputs.forEach(input => {
        if (!validateField(input)) isFormValid = false;
    });
    return isFormValid;
}

function handleBookingSubmit(e) {
    e.preventDefault();
    const form = e.target;

    if (!validateForm(form)) {
        showNotification('Please fill in all required fields correctly.', 'error');
        return;
    }

    const dateVal  = form.querySelector('#bookingDate')?.value;
    const timeVal  = form.querySelector('#bookingTime')?.value;

    if (!dateVal) { showNotification('Please select a date.', 'error'); return; }
    if (!timeVal) { showNotification('Please select a time slot.', 'error'); return; }

    const formData = {
        name:      form.querySelector('#bookingName')?.value,
        email:     form.querySelector('#bookingEmail')?.value,
        phone:     form.querySelector('#bookingPhone')?.value,
        date:      dateVal,
        time:      timeVal,
        eventType: form.querySelector('#eventType')?.options[form.querySelector('#eventType').selectedIndex]?.text,
        duration:  form.querySelector('#duration')?.value,
        location:  form.querySelector('#eventLocation')?.value,
        message:   form.querySelector('#bookingMessage')?.value
    };

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    submitBtn.disabled = true;

    setTimeout(() => {
        openWhatsApp(formData);
        showNotification('🎉 Opening WhatsApp to complete your booking...', 'success', 5000);
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }, 800);
}

/* ===================================
   WHATSAPP MESSAGE BUILDER
   =================================== */
function openWhatsApp(data) {
    const [y, m, d] = data.date.split('-').map(Number);
    const dateFormatted = new Date(y, m - 1, d).toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    const lines = [
        '📅 *New Booking Request*',
        '',
        `👤 *Name:* ${data.name || '-'}`,
        `📞 *Phone:* ${data.phone || '-'}`,
        data.email    ? `📧 *Email:* ${data.email}`         : '',
        '',
        `🎙️ *Event Type:* ${data.eventType || '-'}`,
        data.duration ? `⏱️ *Duration:* ${data.duration}`  : '',
        `📆 *Date:* ${dateFormatted}`,
        `🕐 *Time:* ${data.time}`,
        data.location ? `📍 *Location:* ${data.location}` : '',
        data.message  ? `\n💬 *Notes:* ${data.message}`   : ''
    ].filter(Boolean).join('\n');

    window.open('https://wa.me/201011160627?text=' + encodeURIComponent(lines), '_blank');
}

/* ===================================
   HELPERS
   =================================== */
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
    return /^[\+]?[\d\s\-\(\)]{7,15}$/.test(phone);
}

function showError(input, message) {
    input.classList.add('error');
    let errEl = input.parentElement.querySelector('.field-error');
    if (!errEl) {
        errEl = document.createElement('span');
        errEl.className = 'field-error';
        input.parentElement.appendChild(errEl);
    }
    errEl.textContent = message;
}

function clearError(input) {
    input.classList.remove('error');
    const errEl = input.parentElement.querySelector('.field-error');
    if (errEl) errEl.remove();
}

/* ===================================
   CSS للـ time slots - الصقها في style.css
   =================================== */
/*
.time-slots-container { margin-top: 1.5rem; }

.time-slots {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 0.5rem;
    margin-top: 0.5rem;
}

.time-slot-btn {
    padding: 10px 8px;
    border: 2px solid var(--gray-200);
    border-radius: var(--radius-md);
    background: var(--white);
    color: var(--gray-700);
    font-size: var(--font-size-sm);
    font-weight: 500;
    font-family: inherit;
    cursor: pointer;
    transition: all var(--transition-fast);
    text-align: center;
}

.time-slot-btn:hover {
    border-color: var(--primary-400);
    background: var(--primary-50);
    color: var(--primary-700);
}

.time-slot-btn.selected {
    border-color: var(--primary-600);
    background: var(--primary-600);
    color: var(--white);
    font-weight: 700;
}
*/

// Export
window.selectTimeSlot = selectTimeSlot;
window.selectDate = selectDate;
