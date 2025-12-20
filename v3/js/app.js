
function grantAccess(){
 document.getElementById('access').style.display='none';
 document.getElementById('app').classList.remove('hidden');
}

function startRadar(){
 const radar = document.getElementById('radar');
 const match = document.getElementById('matchBox');
 radar.style.display='block';
 match.style.display='none';

 setTimeout(()=>{
  radar.style.display='none';
  match.style.display='block';
 },10000);
}
