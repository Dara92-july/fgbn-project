const imageInput=document.getElementById('image-imput');
const uploadButton=document.getElementById('upload-button');
const profileImage=document.getElementById('profile-image');

uploadButton.addEventListener('click', ()=>{
    imageInput.click(e);
});
imageInput.addEventListener('click',()=>{
    const file=e.target.files[0];
    person.readASDataURL(File); 
    
    const person=new filePerson();

    person.addEventListener('load', ()=>{
    profileImage.scr=person.result;
    });
    
});