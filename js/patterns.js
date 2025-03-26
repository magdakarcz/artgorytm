
document.addEventListener("DOMContentLoaded", function () {
    const modal = document.getElementById("helpModal");
    const pages = document.querySelectorAll(".modal-page");
    const prevButton = document.getElementById("prevButton");
    const nextButton = document.getElementById("nextButton");
    const closeModalButton = document.getElementById("closeModal");
    const dontShowAgainCheckbox = document.getElementById("dontShowAgain");
    const helpIcon = document.getElementById("helpIcon");

    let currentPage = 0;

    // Show modal if the user hasn't checked "Don't show again"
    if (!localStorage.getItem("dontShowHelpModal")) {
        setTimeout(() => {
            modal.style.display = "flex";
            setTimeout(() => {
                modal.classList.add("active");
            }, 10);
        }, 100);
        showPage(currentPage);
    }

    // Navigation logic
    prevButton.addEventListener("click", () => {
        if (currentPage > 0) {
            hidePage(currentPage);
            currentPage--;
            setTimeout(() => showPage(currentPage), 500); // Match the transition duration
        }
    });

    nextButton.addEventListener("click", () => {
        if (currentPage < pages.length - 1) {
            hidePage(currentPage);
            currentPage++;
            setTimeout(() => showPage(currentPage), 500); // Match the transition duration
        }
    });

    // Close modal logic
    closeModalButton.addEventListener("click", () => {
        modal.classList.remove("active");
        setTimeout(() => {
            modal.style.display = "none";
        }, 300); // Match the duration of the opacity transition
        if (dontShowAgainCheckbox.checked) {
            localStorage.setItem("dontShowHelpModal", "true");
        }
    });

    // Reopen modal when help icon is clicked
    helpIcon.addEventListener("click", () => {
        modal.style.display = "flex";
        setTimeout(() => {
            modal.classList.add("active");
        }, 10);
    });

    // Show the current page with animation
    function showPage(pageIndex) {
        pages[pageIndex].style.display = "block";
        setTimeout(() => {
            pages[pageIndex].classList.add("active");
        }, 10);
        updateButtons();
    }

    // Hide the current page with animation
    function hidePage(pageIndex) {
        pages[pageIndex].classList.remove("active");
        setTimeout(() => {
            pages[pageIndex].style.display = "none";
        }, 500); // Match the transition duration
    }

    // Update navigation button states
    function updateButtons() {
        prevButton.disabled = currentPage === 0;
        nextButton.disabled = currentPage === pages.length - 1;
    }
});


