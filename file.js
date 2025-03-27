// const cameraIcon=document.getElementById('camera-icon');
// const imageInput=document.getElementById('image-input');
// const profileImage=document.getElementById('profile-image');
// const cameraContainer=document.getElementById('camera-container');
// const cameraVideo=document.getElementById('camera-video');
// const captureButton=document.getElementById('capture-button');

// cameraIcon.addEventListener('click',() =>{
//     cameraContainer.style.display='flex';

//     navigator.mediaDevices.getUserMedia({video:true})
//       .then(stream=>{
//         cameraVideo.srcObject=stream;
//       })
//       .catch(error =>
//         console.error('Error accessing camera:', error))

// });
// captureButton.addEventListener('click', ()=>{
//     const canvas=document.createElement('canvas');
//     canvas.width=cameraVideo.videoWidth;
//     canvas.height=cameraVideo.videoHight;

    
//     const ctx=
//     canvas.getContext('2d');
//     ctx.drawImage(cameraVideo, 0, 0,canvas.width, canvas.height);

//     const imageDataURL=
//     canvas.toDataURL();
//     profileImage.scr=imageDataURL

//     cameraContainer.style.display= 'none';
// });


// // imageInput.addEventListener('change',  (e)=>{
// //   console.log('file input change');
// //     const file= e.target.file[0];
// //   console.log('selected file:' ,file );

// //      const reader=new FileReader();
    
// //     reader.addEventListener('load', ()=>{
// //       console.log('fileReader loaded');
// //       profileImage.scr=reader.result
// //     });
// //     reader.readAsDataURL(file);
// // });
// imageInput.addEventListener('change', (e) => {
//   console.log('file input change');
//   const file = e.target.files[0];  // 
//   console.log('selected file:', file); 

//   if (file) {
//     const reader = new FileReader();
    
//     reader.onload = function () {
//       console.log('fileReader loaded');
//       profileImage.src = reader.result;  
//     };
//     reader.readAsDataURL(file);  
//   } else {
//     console.error('No file selected');
//   }
//  });
const cameraIcon = document.getElementById('camera-icon');
const imageInput = document.getElementById('image-input');
const profileImage = document.getElementById('profile-image');
const cameraContainer = document.getElementById('camera-container');
const cameraVideo = document.getElementById('camera-video');
const captureButton = document.getElementById('capture-button');


cameraIcon.addEventListener('click', () => {
  cameraContainer.style.display = 'flex';

  navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
      cameraVideo.srcObject = stream;
    })
    .catch(error => {
      console.error('Error accessing camera:', error);
    });
});


captureButton.addEventListener('click', () => {
  const canvas = document.createElement('canvas');
  canvas.width = cameraVideo.videoWidth;
  canvas.height = cameraVideo.videoHeight;

  const ctx = canvas.getContext('2d');
  // ctx.drawImage(cameraVideo, 0, 0, canvas.width, canvas.height);

  const imageDataURL = canvas.toDataURL();
  profileImage.src = imageDataURL;

  cameraContainer.style.display = 'none';
});


imageInput.addEventListener('click', (e) => {
  console.log('file input change');
  const file = e.target.files[0];
  console.log('selected file:', file); 

  if (file) {
    const reader = new FileReader();
    
    reader.onload = function () {
      console.log('fileReader loaded');
      profileImage.src = reader.result;  
    };
    
    reader.onerror = function () {
      console.error('Error reading the file.');
    };

    reader.readAsDataURL(file);  
  } else {
    console.error('No file selected');
  }
});
