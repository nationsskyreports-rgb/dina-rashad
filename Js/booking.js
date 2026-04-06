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
        
        // Real-time validation
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
    const dateInput = document.getElementById('bookingDate');
    const calendarContainer = document.querySelector('.calendar-container');
    
    if (!dateInput || !calendarContainer) return;
    
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
    
    // Custom calendar functionality
    renderCalendar(new Date());
    
    // Month navigation
    const prevMonth = document.getElementById('prevMonth');
    const nextMonth = document.getElementById('nextMonth');
    
    if (prevMonth) {
        prevMonth.addEventListener('click', () => {
            const currentDate = new Date(dateInput.value || Date.now());
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar(currentDate);
        });
    }
    
    if (nextMonth) {
        nextMonth.addEventListener('click', () => {
            const currentDate = new Date(dateInput.value || Date.now());
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar(currentDate);
        });
    }
}

// Render calendar for a specific month
function renderCalendar(date) {
    const calendarGrid = document.getElementById('calendarGrid');
    const currentMonthDisplay = document.getElementById('currentMonth');
    
    if (!calendarGrid) return;
    
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // Update month display
    if (currentMonthDisplay) {
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        currentMonthDisplay.textContent = `${monthNames[month]} ${year}`;
    }
    
    // Get first day of month and total days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let calendarHTML = '';
    
    // Day headers
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayHeaders.forEach(day => {
        calendarHTML += `<div class="calendar-day-header">${day}</div>`;
    });
    
    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
        calendarHTML += `<div class="calendar-day empty"></div>`;
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = new Date(year, month, day);
        const isPast = currentDate < today;
        const isToday = currentDate.getTime() === today.getTime();
        const isSelected = document.getElementById('bookingDate')?.value === 
                          `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        let classes = 'calendar-day';
        if (isPast) classes += ' past';
        if (isToday) classes += ' today';
        if (isSelected) classes += ' selected';
        
        calendarHTML += `
            <div class="${classes}" 
                 data-date="${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}"
                 ${isPast ? 'disabled' : ''}>
                ${day}
            </div>
        `;
    }
    
    calendarGrid.innerHTML = calendarHTML;
    
    // Add click handlers to selectable days
    const dayElements = calendarGrid.querySelectorAll('.calendar-day:not(.empty):not(.past)');
    dayElements.forEach(dayEl => {
        dayEl.addEventListener('click', function() {
            selectDate(this.dataset.date);
        });
    });
}

// Select a date
function selectDate(dateString) {
    const dateInput = document.getElementById('bookingDate');
    const timeSlotContainer = document.querySelector('.time-slots-container');
    
    if (dateInput) {
        dateInput.value = dateString;
    }
    
    // Update visual selection
    document.querySelectorAll('.calendar-day.selected').forEach(el => {
        el.classList.remove('selected');
    });
    
    const selectedDay = document.querySelector(`[data-date="${dateString}"]`);
    if (selectedDay) {
        selectedDay.classList.add('selected');
    }
    
    // Show time slots
    if (timeSlotContainer) {
        timeSlotContainer.style.display = 'block';
        timeSlotContainer.classList.add('fade-in');
    }
    
    // Update selected date display
    const selectedDateDisplay = document.getElementById('selectedDateDisplay');
    if (selectedDateDisplay) {
        const date = new Date(dateString);
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        selectedDateDisplay.textContent = `Selected: ${date.toLocaleDateString('en-US', options)}`;
    }
}

/* ===================================
   TIME SLOTS
   =================================== */
function initTimeSlots() {
    const timeSlotsContainer = document.getElementById('timeSlots');
    
    if (!timeSlotsContainer) return;
    
    const slots = getTimeSlots();
    
    let slotsHTML = '<div class="time-slots-grid">';
    
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
    
    slotsHTML += '</div>';
    timeSlotsContainer.innerHTML = slotsHTML;
}

// Select a time slot
function selectTimeSlot(button) {
    const timeInput = document.getElementById('bookingTime');
    
    // Remove previous selection
    document.querySelectorAll('.time-slot-btn.selected').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // Add selection to clicked button
    button.classList.add('selected');
    
    // Update hidden input
    if (timeInput) {
        timeInput.value = button.dataset.time;
    }
}

// Format 24h time to 12h format
function formatTime24To12(time24) {
    const [hours, minutes] = time24.split(':');
    const hour12 = hours % 12 || 12;
    const ampm = hours < 12 ? 'AM' : 'PM';
    return `${hour12}:${minutes} ${ampm}`;
}

// Alias for consistency
const formatTime12Hour = formatTime24To12;

/* ===================================
   FORM VALIDATION & SUBMISSION
   =================================== */

// Validate individual field
function validateField(input) {
    const value = input.value.trim();
    let isValid = true;
    let message = '';
    
    switch (input.type) {
        case 'text':
            if (input.required && !value) {
                isValid = false;
                message = 'This field is required';
            } else if (value.length < 2) {
                isValid = false;
                message = 'Please enter at least 2 characters';
            }
            break;
            
        case 'email':
            if (input.required && !value) {
                isValid = false;
                message = 'Email is required';
            } else if (value && !isValidEmail(value)) {
                isValid = false;
                message = 'Please enter a valid email address';
            }
            break;
            
        case 'tel':
            if (input.required && !value) {
                isValid = false;
                message = 'Phone number is required';
            } else if (value && !isValidPhone(value)) {
                isValid = false;
                message = 'Please enter a valid phone number';
            }
            break;
            
        case 'date':
            if (input.required && !value) {
                isValid = false;
                message = 'Please select a date';
            } else if (value && isPastDate(new Date(value))) {
                isValid = false;
                message = 'Please select a future date';
            }
            break;
            
        case 'select-one':
            if (input.required && !value) {
                isValid = false;
                message = 'Please select an option';
            }
            break;
            
        case 'textarea':
            if (input.required && !value) {
                isValid = false;
                message = 'This field is required';
            }
            break;
    }
    
    if (!isValid) {
        showError(input, message);
    } else {
        clearError(input);
    }
    
    return isValid;
}

// Validate entire form
function validateForm(form) {
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    let isFormValid = true;
    
    inputs.forEach(input => {
        if (!validateField(input)) {
            isFormValid = false;
        }
    });
    
    return isFormValid;
}

// Handle form submission
function handleBookingSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    
    // Validate form
    if (!validateForm(form)) {
        showNotification('Please fill in all required fields correctly.', 'error');
        return;
    }
    
    // Collect form data
    const formData = {
        name: form.querySelector('#bookingName')?.value,
        email: form.querySelector('#bookingEmail')?.value,
        phone: form.querySelector('#bookingPhone')?.value,
        date: form.querySelector('#bookingDate')?.value,
        time: form.querySelector('#bookingTime')?.value,
        eventType: form.querySelector('#eventType')?.value,
        duration: form.querySelector('#duration')?.value,
        message: form.querySelector('#bookingMessage')?.value
    };
    
    // Check required fields
    if (!formData.name || !formData.phone || !formData.date || !formData.time || !formData.eventType) {
        showNotification('Please fill in all required fields.', 'error');
        return;
    }
    
    // Save to localStorage as backup
    saveToStorage('pending_booking', formData);
    
    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    submitBtn.disabled = true;
    
    // Simulate brief delay for UX
    setTimeout(() => {
        // Open WhatsApp with pre-filled message
        openWhatsApp(formData);
        
        // Show success notification
        showNotification('🎉 Great! Opening WhatsApp to complete your booking...', 'success', 5000);
        
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
        // Optional: Reset form
        // form.reset();
    }, 800);
}

/* ===================================
   EVENT TYPE SELECTION
   =================================== */

// Initialize event type cards (if using card-based selection)
function initEventTypeSelection() {
    const eventTypeCards = document.querySelectorAll('.event-type-card');
    
    eventTypeCards.forEach(card => {
        card.addEventListener('click', function() {
            // Remove selection from other cards
            eventTypeCards.forEach(c => c.classList.remove('selected'));
            
            // Add selection to this card
            this.classList.add('selected');
            
            // Update hidden input
            const input = document.getElementById('eventType');
            if (input) {
                input.value = this.dataset.type;
            }
        });
    });
}

/* ===================================
   UTILITY FUNCTIONS FOR BOOKING
   =================================== */

// Calculate estimated price (placeholder - actual pricing via WhatsApp)
function calculateEstimate(eventType, duration) {
    // This is just a placeholder - actual pricing discussed on WhatsApp
    const baseRates = {
        'simultaneous': 150,
        'consecutive': 100,
        'remote': 120,
        'media': 180
    };
    
    const rate = baseRates[eventType] || 100;
    const hours = parseInt(duration) || 1;
    
    return rate * hours;
}

// Format duration display
function formatDuration(hours) {
    if (hours < 1) return `${Math.round(hours * 60)} minutes`;
    if (hours === 1) return '1 hour';
    return `${hours} hours`;
}

// Export functions
window.selectTimeSlot = selectTimeSlot;
window.selectDate = selectDate;