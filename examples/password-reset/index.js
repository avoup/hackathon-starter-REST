const form = document.querySelector('form');
const submitBtn = document.querySelector('#submit');
const ul = document.querySelector('ul');

submitBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const urlSearchParams = new URLSearchParams(window.location.search);
    const token = Object.fromEntries(urlSearchParams.entries()).token;
    const formData = new FormData(form);
    formData.append('token', token)

    const xhr = new XMLHttpRequest();
    xhr.open("POST", 'http://localhost:8080/auth/reset', true);
    xhr.setRequestHeader('Content-Type', 'application/vnd.api+json');
    xhr.onload = function () {
        if (xhr.status >= 400) {
            const data = JSON.parse(this.responseText);
            ul.innerHTML = '';
            for (const error of data.errors) {
                ul.innerHTML += `<li>Title: ${error.title}, details: ${error.detail}</li>`
            }
        } else {
            ul.innerHTML = `<li>Title: success</li>`
        }
    }
    xhr.send(JSON.stringify({
        "data": {
            "attributes": {
                "password": formData.get('password'),
                "confirmPassword": formData.get('confirmPassword'),
                "token": formData.get('token')
            }
        }
    }));

    form.reset()

})