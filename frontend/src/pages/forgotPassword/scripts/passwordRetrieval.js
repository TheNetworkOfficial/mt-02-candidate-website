document.getElementById('forgot-password-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value;

    fetch('http://localhost:3000/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        if (data.message.includes('An email has been sent')) {
            window.location.href = 'login.html';
        }
    })
    .catch(error => console.error('Error:', error));
});