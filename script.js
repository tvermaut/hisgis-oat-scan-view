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
    var p_sort = (s.results).sort((p1, p2) => (p1.perceelnr < p2.perceelnr) ? -1 : (p1.perceelnr > p2.perceelnr) ? 1 : 0);        
    for(let px in p_sort){
        let p = p_sort[px];
        let pi = document.createElement("tr");
        let pnr = document.createElement("td");
        pnr.innerHTML = p.perceelnr;
        if(p.perceelnrtvg){pnr.innerHTML += "/" + p.perceelnrtvg;}
        pi.appendChild(pnr);

        var aantal_a = 1;
        console.log("test: ");
        console.log(px);
        console.log((p_sort[px]).artikelLink);
        console.log((p_sort[px+1]).artikelLink);
        while(p_sort.length >= (px+1) && (p_sort[px]).artikelLink.artikelnr == p_sort[px+1].artikelLink.artikelnr){aantal_a++;}
        let aid = p.artikelLink.artikelnr;
        if(p.artikelLink.artikelnrtvg){aid += p.artikelLink.artikelnrtvg;}
        let a = artikelen[aid];
        let as = getArtikelHTML(a, aantal_a);
        for(let ai of as){pi.appendChild(ai);}

        // grondgebruik
        let soort = document.createElement("td");
        soort.innerHTML = p.grondGebruik;
        pi.appendChild(soort);

        t.appendChild(pi);
    }
    //console.log(secties);
    }

function getArtikelHTML(a, aantal){
    var h = [];

    if(a.rechtsPersonen.length == 1){
        if(a.rechtsPersonen[0].type == "PERSOON"){
            let p = a.rechtsPersonen[0].persoon;

            // naam
            let naam_h = document.createElement("td");
            naam_h.setAttribute("rowspan", aantal);
            naam_h.innerHTML = p.achternaam;
            h.push(naam_h);

            // voornaam
            let vnaam_h = document.createElement("td");
            vnaam_h.setAttribute("rowspan", aantal);
            if(p.titel){vnaam_h.innerHTML += p.titel + " ";}
            vnaam_h.innerHTML += p.voornaam;
            if(p.voorvoegsel){vnaam_h.innerHTML += ", " + p.voorvoegsel;}
            h.push(vnaam_h);

            // beroep
            let beroep_h = document.createElement("td");
            beroep_h.setAttribute("rowspan", aantal);
            beroep_h.innerHTML = p.beroep;
            h.push(beroep_h);

            // woonplaats
            let woonplaats_h = document.createElement("td");
            woonplaats_h.setAttribute("rowspan", aantal);
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
    anr_html.setAttribute("rowspan", aantal);
    let anr = a.artikelnr;
    if(a.artikelnrtvg){anr += "/" + a.artikelnrtvg;}
    anr_html.innerHTML = anr;
    h.push(anr_html);
    return h
}


// function getPersoonHTML(p){

//     return h
// }