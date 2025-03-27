// JavaScript Code
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('#updateLimitForm form');
    const input = document.getElementById('update');
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    form.appendChild(errorMessage);

    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    form.appendChild(successMessage);

    // Load saved limit if exists
    const savedLimit = localStorage.getItem('customerLimit');
    if (savedLimit) {
        input.value = savedLimit;
        showSuccessMessage(`Limit set to ${savedLimit}`);
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMessage.style.display = 'none';
        successMessage.style.display = 'none';

        const newLimit = parseInt(input.value.trim());

        if (isNaN(newLimit)){
            showErrorMessage('Please enter a valid number');
            return;
        }

        if (newLimit <= 0) {
            showErrorMessage('Limit must be greater than 0');
            return;
        }

        try {
            // Save to localStorage or your database
            localStorage.setItem('customerLimit', newLimit);
            
            // Show success message WITH redirection flag
            showSuccessMessage(`Limit successfully updated to ${newLimit}, true`);
            
        } catch (error) {
            showErrorMessage('Failed to update limit');
        }
    });
        input.value = '';

    function showErrorMessage(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 3000);
    }

    function showSuccessMessage(message) {
        successMessage.innerHTML = `${message}`;
        successMessage.style.display = 'block';
        setTimeout(() => {
            successMessage.style.display = 'none';
        }, 3000);
    }
});