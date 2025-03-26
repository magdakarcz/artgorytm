// Attach event listeners to all help icons, text, and close buttons
document.addEventListener('DOMContentLoaded', () => {
    const helpIcons = document.querySelectorAll('.help-icon, .help-text');
    const closeButtons = document.querySelectorAll('.close-button');
    const overlayId = 'overlay';

    // Show the help box
    helpIcons.forEach(element => {
        element.addEventListener('click', () => {
            const helpId = element.getAttribute('data-help');
            const helpBox = document.querySelector(`.help-box[data-help-box="${helpId}"]`);
            if (helpBox) {
                helpBox.style.display = 'block';
                addOverlay(helpBox);
            }
        });
    });

    // Close the help box
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const helpId = button.getAttribute('data-help-close');
            const helpBox = document.querySelector(`.help-box[data-help-box="${helpId}"]`);
            if (helpBox) {
                helpBox.style.display = 'none';
                removeOverlay();
            }
        });
    });

    // Add overlay and ensure it doesn’t close the box when clicked inside
    function addOverlay(helpBox) {
        if (!document.getElementById(overlayId)) {
            const overlay = document.createElement('div');
            overlay.id = overlayId;
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                z-index: 99;
            `;
            overlay.addEventListener('click', () => {
                // Close the help box and remove the overlay when clicking outside
                helpBox.style.display = 'none';
                removeOverlay();
            });

            // Prevent closing when clicking inside the help box
            helpBox.addEventListener('click', event => {
                event.stopPropagation();
            });

            document.body.appendChild(overlay);
        }
    }

    // Remove overlay
    function removeOverlay() {
        const overlay = document.getElementById(overlayId);
        if (overlay) overlay.remove();
    }
});


