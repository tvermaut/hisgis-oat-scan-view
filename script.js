const q = window.location.search;
if(q.length>1){
    fetch('https://oat.hisgis.nl/oat-ws/rest/scans/' + q.substring(1))
        .then((response) => response.json())
        .then((data) => verwerkScans(data));
}

function verwerkScans(scans){
    var secties = [];
    console.log(scans);
    for(let si of scans){
        let letter = si.code.substring(8,9);
        if(not(letter in secties)){
            secties.push(letter);
        }
        }
    console.log(secties);
    }