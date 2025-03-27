let profileImage = document.getElementById('profileImage');
let dropdownMenu = document.getElementById('dropdownMenu');
let fileInput = document.getElementById('fileInput');
let modal = document.getElementById('imageModal');
let fullImage = document.getElementById('fullImage');
let cameraPreview = document.getElementById('cameraPreview');
let snapshotCanvas = document.getElementById('snapshotCanvas');

profileImage.onclick = function () {
    dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
};

function uploadImage(event) {
    let file = event.target.files[0];
    if (file) {
        let imageUrl = URL.createObjectURL(file);
        profileImage.src = imageUrl;
    }
}

function openModal() {
    fullImage.src = profileImage.src;
    modal.style.display = 'flex';
}

function closeModal() {
    modal.style.display = 'none';
}

async function captureFromCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        cameraPreview.srcObject = stream;
        cameraPreview.style.display = 'block';

        setTimeout(async () => {
            snapshotCanvas.width = cameraPreview.videoWidth;
            snapshotCanvas.height = cameraPreview.videoHeight;
            snapshotCanvas.getContext('2d').drawImage(cameraPreview, 0, 0);
            profileImage.src = snapshotCanvas.toDataURL('image/png');

            stream.getTracks().forEach(track => track.stop());
            cameraPreview.style.display = 'none';
        }, 3000);
    } catch (error) {
        alert('Camera access denied');
    }
}
