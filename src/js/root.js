// Root Component Loader
(function() {
    // Load the root component HTML
    fetch('src/components/root.html')
        .then(response => response.text())
        .then(html => {
            const rootContainer = document.getElementById('rootContainer');
            if (rootContainer) {
                rootContainer.innerHTML = html;
            }
        })
        .catch(error => {
            console.error('Error loading root component:', error);
        });
})();

// Made with Bob
