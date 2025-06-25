document.getElementById('reset-password-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (newPassword !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    fetch('http://localhost:3000/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        if (data.message.includes('Password has been reset')) {
            window.location.href = 'login.html';
        }
    })
    .catch(error => console.error('Error:', error));
});