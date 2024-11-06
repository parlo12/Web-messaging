document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('agreement-modal');
    const openButton = document.getElementById('send-agreement-button');
    const closeButton = document.querySelector('.close-button');
    const modalContent = document.querySelector('.modal-content');

    openButton.onclick = function() {
        modal.style.display = "block";
    }

    closeButton.onclick = function() {
        modal.style.display = "none";
    }

    // Make the modal draggable
    let isDragging = false;
    let startX, startY, initialX, initialY;

    modalContent.addEventListener('mousedown', function(e) {
        if (e.target === modalContent) {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            initialX = modalContent.offsetLeft;
            initialY = modalContent.offsetTop;
            document.addEventListener('mousemove', moveModal);
            document.addEventListener('mouseup', stopDragging);
        }
    });

    function moveModal(e) {
        if (isDragging) {
            let dx = e.clientX - startX;
            let dy = e.clientY - startY;
            modalContent.style.left = initialX + dx + 'px';
            modalContent.style.top = initialY + dy + 'px';
        }
    }

    function stopDragging() {
        isDragging = false;
        document.removeEventListener('mousemove', moveModal);
        document.removeEventListener('mouseup', stopDragging);
    }

    // Prevent closing the modal when clicking outside of it
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            e.stopPropagation();
        }
    });
});
