const q = window.location.search;
if(q.length>1){
    fetch('https://oat.hisgis.nl/oat-ws/rest/percelen/oat/' + q.substring(1))
        .then((response) => response.json())
        .then((data) => verwerkScan(data));
}

function verwerkScan(s){
    console.log(s);
    var t = document.getElementById('tbl_percelen');
    var artikelen = [];
    var percelen = [];
    //console.log(scans);
    for(let a of s.artikelen){
        let artikelid = a.artikelnr;
        if(a.artikelnrtvg){artikelid += a.artikelnrtvg;}
        artikelen[artikelid] = a;
        }
    let p_sort = s.results.sort((p1, p2) => (p1.perceelnr < p2.perceelnr) ? -1 : (p1.perceelnr > p2.perceelnr) ? 1 : 0);        
    for(let p of p_sort){
        let pi = document.createElement("tr");
        let pnr = document.createElement("td");
        pnr.innerHTML = p.perceelnr;
        if(p.perceelnrtvg){pnr.innerHTML += "/" + p.perceelnrtvg;}
        pi.appendChild(pnr);
        t.appendChild(pi);

        let aid = p.artikelLink.artikelnr;
        if(p.artikelLink.artikelnrtvg){aid += p.artikelLink.artikelnrtvg;}
        let a = artikelen[aid];
        let as = getArtikelHTML(a);
        for(let ai of as){t.appendChild(ai);}
    }
    //console.log(secties);
    }

function getArtikelHTML(a){
    var h = [];

    if(a.rechtsPersonen.length == 1){
        if(a.rechtsPersonen[0].type == "PERSOON"){
            let p = a.rechtsPersonen[0].persoon;

            // naam
            let naam_h = document.createElement("td");
            naam_h.innerHTML = p.naam;
            h.push(naam_h);

            // voornaam
            let vnaam_h = document.createElement("td");
            if(p.titel){vnaam_h.innerHTML += p.titel + " ";}
            vnaam_h.innerHTML += p.voornaam;
            if(p.voorvoegsel){vnaam_h.innerHTML += ", " + p.voorvoegsel;}
            h.push(vnaam_h);

            // beroep
            let beroep_h = document.createElement("td");
            beroep_h.innerHTML = p.beroep;
            h.push(beroep_h);

            // woonplaats
            let woonplaats_h = document.createElement("td");
            woonplaats_h.innerHTML = p.woonplaats;
            h.push(woonplaats_h);
        } else {
            // geen PERSOON
        }
    } else if (a.rechtspersonen.length > 1){
        // meer dan 1 RP
    }


    // artikelnummer
    let anr_html = document.createElement("td");
    let anr = a.artikelnr;
    if(a.artikelnrtvg){anr += "/" + a.artikelnrtvg;}
    anr_html.innerHTML = anr;
    h.push(anr_html);
    return h
}



// function getPersoonHTML(p){

//     return h
// }