document.querySelector('.back-btn').addEventListener('click', function(event) {
    
    event.preventDefault();

    if (window.history.length > 1) {

        const referrer = document.referrer;

        if (referrer) {
            try {
                const referrerUrl = new URL(referrer);

                if (referrerUrl.origin === window.location.origin) {
                    window.history.back();
                    return;
                }
            } catch (e) {}
        }

    }

    window.location.href = 'index.html';

});