const q = window.location.search;
if(q.length>1){
    fetch('https://oat.hisgis.nl/oat-ws/rest/percelen/oat/' + q.substring(1))
        .then((response) => response.json())
        .then((data) => verwerkScan(data));
}

function verwerkScan(s){
    console.log(s);
    var artikelen = [];
    var percelen = [];
    //console.log(scans);
    for(let a of s.artikelen){
        let artikelid = a.artikelnr;
        if(a.artikelnrtvg){artikelid += a.artikelnrtvg;}
        artikelen[artikelid] = a;
        }
    let p_sort = s.results.sort((p1, p2) => (p1.perceelnr < p2.perceelnr) ? 1 : (p1.perceelnr > p2.perceelnr) ? -1 : 0);        
    for(let p of p_sort){
        let pi = document.createElement("tr");
        let pnr = document.createElement("td");
        pnr.innerHTML = p.perceelnr;
        if(p.perceelnrtvg){pnr.innerHTML += "/" + p.perceelnrtvg;}
        pi.appendChild(pnr);
        document.getElementById('tbl_percelen').appendChild(pi);
    }
    //console.log(secties);
    }