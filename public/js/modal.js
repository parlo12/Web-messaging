document.addEventListener('DOMContentLoaded', () => {
    const checkPropertyButton = document.getElementById('check-property-button');
    const propertyAddressInput = document.getElementById('property-address');
    const propertyModal = document.getElementById('property-modal');
    const propertyFrame = document.getElementById('property-frame');
    const closeButton = document.querySelector('.close-button');

    function normalizeAddressForZillow(address) {
        return address.replace(/\s+/g, '-');
    }

    checkPropertyButton.addEventListener('click', () => {
        const address = propertyAddressInput.value.trim();
        if (address !== '') {
            const zillowAddress = normalizeAddressForZillow(address);
            const zillowUrl = `https://www.zillow.com/homes/${zillowAddress}`;
            propertyFrame.src = zillowUrl;
            propertyModal.style.display = 'block';
        } else {
            alert('Please enter an address.');
        }
    });

    closeButton.addEventListener('click', () => {
        propertyModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target == propertyModal) {
            propertyModal.style.display = 'none';
        }
    });
});
