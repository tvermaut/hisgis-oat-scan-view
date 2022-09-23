const q = window.location.search;
if(q.length>1){
    fetch('https://oat.hisgis.nl/oat-ws/rest/scans/' + q.substring(1))
        .then((response) => response.json())
        .then((data) => verwerkScans(data));
}


function verwerkScans(scans){
secties = [];
console.log(scans);
for(let si in scans){
    //console.log(scans);
}
}