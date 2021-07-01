const google = document.getElementById('google');

google.addEventListener('click', (e) => {
    e.preventDefault();
    
    let url = 'http://localhost:8080' + google.getAttribute('href');
    let width = 500, height = 370;
    if (url.indexOf('/auth/google') === 0) {
        width = 470; height = 580;
    }
    let w = window.outerWidth - width, h = window.outerHeight - height;
    let left = Math.round(window.screenX + (w / 2));
    let top = Math.round(window.screenY + (h / 2.5));
    
    const popup = open(url, 'Login',
        'width=' + width + ',height=' + height + ',left=' + left + ',top=' + top +
        ',toolbar=0,scrollbars=0,status=0,resizable=0,location=0,menuBar=0');

    window.addEventListener('message', (e)=> {
        console.log('auth response: ', e.data)
    })

})
