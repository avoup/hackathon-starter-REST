const googleButton = document.getElementById('google');
const ul = document.querySelector('ul')

googleButton.addEventListener('click', (e) => {
    e.preventDefault();

    let url = 'http://localhost:8080' + googleButton.getAttribute('href');
    let width = 500, height = 770;
    if (url.indexOf('/auth/google') === 0) {
        width = 470; height = 780;
    }
    let w = window.outerWidth - width, h = window.outerHeight - height;
    let left = Math.round(window.screenX + (w / 2));
    let top = Math.round(window.screenY + (h / 2.5));

    open(url, 'Login',
        'width=' + width + ',height=' + height + ',left=' + left + ',top=' + top +
        ',toolbar=0,scrollbars=0,status=0,resizable=0,location=0,menuBar=0');

    const onMessage = (e) => {
        const data = e.data;
        console.log(data)

        ul.innerHTML = '';
        if (data.code >= 400) {
            for (const error of data.errors) {
                ul.innerHTML = ul.innerHTML + `<li><strong>title:</strong> ${error.title}, <strong>status code:</strong> ${data.code}, <strong>details:</strong> ${error.detail}</li>`;
            }
        } else {
            ul.innerHTML = `<li><strong>title:</strong> success, <strong>jwt token:</strong> ${data.data.id}, <strong>expires in:</strong> ${data.data.attributes.expiresIn}</li>`;
        }
    }
    window.addEventListener('message', onMessage, {once: true})

})
