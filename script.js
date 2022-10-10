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
        let huidig = parseInt(px);
        if(huidig == 0 || p_sort[huidig-1].artikelLink.artikelnr != (p_sort[huidig]).artikelLink.artikelnr){
            var i = 1;
            while(p_sort.length >= (huidig+i) && (p_sort[huidig]).artikelLink.artikelnr == (p_sort[huidig+i]).artikelLink.artikelnr){aantal_a++; i++}
            let aid = p.artikelLink.artikelnr;
            if(p.artikelLink.artikelnrtvg){aid += p.artikelLink.artikelnrtvg;}
            let a = artikelen[aid];
            let as = getArtikelHTML(a, aantal_a);
            for(let ai of as){pi.appendChild(ai);}
        }

        // grondgebruik
        let soort = document.createElement("td");
        soort.innerHTML = p.grondGebruik;
        pi.appendChild(soort);

        // huisnrs
        let huisnrs = document.createElement("td");
        soort.innerHTML = p.huisnrs.join(', ');
        pi.appendChild(huisnrs);

        // oppervlakte
        for(let oi of getOppervlakHTML(p.oppervlak)){pi.appendChild(oi);}

        t.appendChild(pi);
    }
    //console.log(secties);
    }


function getOppervlakHTML(opp){
    var h = [];
    let e = opp % 100;
    let r = ((opp-e) % 10000)/100;
    let b = (opp-e-(100*r)) /10000;
    let e_h = document.createElement("td");
    e_h.innerHTML = (e == 0 && r == 0 && b == 0 ? "" : e);
    let r_h = document.createElement("td");
    r_h.innerHTML = (r == 0 && b == 0 ? "" : r);
    let b_h = document.createElement("td");
    b_h.innerHTML = (b == 0 ? "" : b);
    h.push(b_h).push(r_h).push(e_h);
    return h
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
            let x = document.createElement("td");
            x.setAttribute("colspan",4);
            h.push(x);
        }
    } else if (a.rechtspersonen.length > 1){
        // meer dan 1 RP
        let x = document.createElement("td");
        x.setAttribute("colspan",4);
        h.push(x);
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