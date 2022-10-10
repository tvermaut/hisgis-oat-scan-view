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
        pi.setAttribute("style","height: 1px;");
        let pnr = document.createElement("td");
        pnr.innerHTML = p.perceelnr;
        if(p.perceelnrtvg){pnr.innerHTML += "/" + p.perceelnrtvg;}
        pnr.setAttribute("class","pe-1 text-end");
        pi.appendChild(pnr);

        var aantal_a = 1;
        let huidig = parseInt(px);
        if(huidig == 0 || p_sort[huidig-1].artikelLink.artikelnr != (p_sort[huidig]).artikelLink.artikelnr){
            var i = 1;
            while(p_sort.length > (huidig+i) && (p_sort[huidig]).artikelLink.artikelnr == (p_sort[huidig+i]).artikelLink.artikelnr){aantal_a++; i++}
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
        var hnr = ""
        for(hi of p.huisnrs){
            hnr += (hnr.length > 0 ? ', ' : '');
            hnr += hi.wijk + (hi.wijk.length > 0 ? '-' : '');
            hnr += hi.nr + (hi.nrtvg.length > 0 ? '/' + hi.nrtvg : '');
        }
        huisnrs.innerHTML = hnr;
        pi.appendChild(huisnrs);

        // oppervlakte
        for(let oi of getOppervlakHTML(p.oppervlak)){pi.appendChild(oi);}
        let samengeteld_oppervlak = document.createElement("td");
        samengeteld_oppervlak.setAttribute("colspan",3);
        pi.appendChild(samengeteld_oppervlak);

        // voorlopige klassering
        let voorlopige_klassering = document.createElement("td");
        pi.appendChild(voorlopige_klassering);

        console.log("nu starten met perceelTarieven:");
        console.log(p.perceelTarieven);
        var pts = new PerceelTarieven(p.perceelTarieven);
        console.log(pts);
        for(let i of getOppervlakHTML(pts.k1)){pi.appendChild(i);}
        for(let i of getOppervlakHTML(pts.k2)){pi.appendChild(i);}
        for(let i of getOppervlakHTML(pts.k3)){pi.appendChild(i);}
        for(let i of getOppervlakHTML(pts.k4)){pi.appendChild(i);}
        for(let i of getOppervlakHTML(pts.k5)){pi.appendChild(i);}
        let k_geb = document.createElement("td");
        k_geb.innerHTML = (pts.k_geb || '');
        pi.appendChild(k_geb);
        for(let i of getBedragHTML(pts.t1)){pi.appendChild(i);}
        for(let i of getBedragHTML(pts.t2)){pi.appendChild(i);}
        for(let i of getBedragHTML(pts.t3)){pi.appendChild(i);}
        for(let i of getBedragHTML(pts.t4)){pi.appendChild(i);}
        for(let i of getBedragHTML(pts.t5)){pi.appendChild(i);}

        t.appendChild(pi);
    }
    //console.log(secties);
    }


function getOppervlakHTML(opp){
    var h = [];
    if(opp > 0){
        let e = opp % 100;
        let r = ((opp-e) % 10000)/100;
        let b = (opp-e-(100*r)) /10000;
        let e_h = document.createElement("td");
        e_h.setAttribute("class","ps-0 text-end");
        e_h.innerHTML = (e == 0 && r == 0 && b == 0 ? "" : String(e).padStart(2,'0'));
        let r_h = document.createElement("td");
        r_h.setAttribute("class","px-0 text-end");
        r_h.innerHTML = (r == 0 && b == 0 ? "" : String(r).padStart(2,'0'));
        let b_h = document.createElement("td");
        b_h.setAttribute("class","pe-0 text-end");
        b_h.innerHTML = (b == 0 ? "" : b);
        h.push(b_h);
        h.push(r_h);
        h.push(e_h);
    } else {
        let x = document.createElement("td");
        x.setAttribute("colspan","3");
        h.push(x);
    }
    return h
}

function getBedragHTML(b){
    var h = [];
    if(b > 0){
        let c = round(b % 100);
        let g = round((b-c)/100);
        let c_h = document.createElement("td");
        c_h.setAttribute("class","ps-0 text-end");
        c_h.innerHTML = (c == 0 ? '' : String(c).padStart(2,'0'));
        let g_h = document.createElement("td");
        g_h.setAttribute("class","pe-0 text-end");
        g_h.innerHTML = g;
        h.push(g_h);
        h.push(c_h);
    } else {
        let x = document.createElement("td");
        x.setAttribute("colspan","2");
        h.push(x);
    }
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
            if(aantal > 1){
                naam_h.setAttribute("class","container my-auto");
                let accolade = document.createElement("div");
                accolade.setAttribute("class", "accolade");
                let inhoud = document.createElement("div");
                inhoud.setAttribute("class", "content my-auto");
                inhoud.innerHTML = p.achternaam;
                accolade.appendChild(inhoud);
                naam_h.appendChild(accolade);
            } else {
                naam_h.innerHTML = p.achternaam;
            }
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
        } else if (a.rechtsPersonen[0].type == "VERWIJZING") {
            // geen PERSOON
            let x = document.createElement("td");
            x.setAttribute("colspan",4);
            h.push(x);
        } else if (a.rechtsPersonen[0].type == "INSTANTIE"){
            let x = document.createElement("td");
            x.setAttribute("colspan",4);
            let instantie = new Instantie(a.rechtsPersonen[0].instantie);
            x.innerHTML = instantie.lbl();
            h.push(x);
        } else {
            console.error("onherkend type: " + a.rechtsPersonen[0].type);
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
    anr_html.setAttribute("class","pe-1 text-end");
    h.push(anr_html);
    return h
}

class Artikel {
    nr;
    tvg;
    cs;
    reeks;
    rechtsPersonen;

    constructor(json){
        this.nr = json.artikelnr;
        this.tvg = json.artikelnrtvg || '';
        this.cs = json.consorten;
        this.reeks = json.reeks;
        this.rechtsPersonen = []
    }

    lbl(){return this.nr + (this.tvg ? '/'+this.tvg : '')}
}

class RechtsPersoon {
    rpi;
    rol;
    type;

    constructor(json){
        this.rol = json.rol;
        this.type = json.type;
    }
}

class RPI {
    // abstract
    lbl(){}
}

class Persoon extends RPI {
    achternaam;
    voornaam;
    voorvoegsel;
    titel;
    beroep;
    woonplaats;
    varianten; //@TODO nog verwerken

    constructor(json){
        super();
        this.achternaam = json.achternaam || '';
        this.voornaam = json.voornaam || '';
        this.voorvoegsel = json.voorvoegsel || '';
        this.titel = json.titel || '';
        this.beroep = json.beroep || '';
        this.woonplaats = json.woonplaats || '';
        this.varianten = [];
    }

    lbl(){
        let l = this.titel || '';
        l += ((this.voornaam.length > 0 && l.length > 0) ? ' ' : '' ) + this.voornaam;
        l += ((this.voorvoegsel.length > 0 && l.length > 0) ? ' ' : '' ) + this.voorvoegsel;
        l += ((this.achternaam.length > 0 && l.length > 0) ? ' ' : '' ) + this.achternaam;
        if(this.beroep.length > 0 && this.woonplaats.length > 0){l += ' (' + this.beroep + ' te ' + this.woonplaats + ')';}
        else if (this.beroep.length > 0){l += ' (' + this.beroep + ')';}
        else if (this.woonplaats.length > 0){l += ' (' + this.woonplaats + ')';}
        return l
    }
}

class Instantie extends RPI {
    naam;
    plaats;
    type;
    gezindte;

    constructor(json){
        super();
        this.naam = json.naam || '';
        this.plaats = json.plaats || '';
        this.type = json.type || '';
        this.gezindte = json.gezindte || '';
    }

    lbl(){
        let l = this.gezindte || '';
        l += (l.length > 0 && this.type.length > 0) ? ' ' : '';
        l += this.type || '';
        l += (l.length > 0 && this.naam.length > 0) ? ' ' : '';
        l += this.naam || '';
        l += (l.length > 0 && this.plaats.length > 0) ? ' te ' : '';
        l += this.plaats || '';
        return l
    }
}

class PerceelTarieven {
    k1;
    k2;
    k3;
    k4;
    k5;
    t1;
    t2;
    t3;
    t4;
    t5;
    k_geb;
    t_geb;
    ts_ong;
    ts_geb;

    constructor(json){
        console.log(json);
        for(let x of json){
            console.log(x);
            if(x.tarief.tariefsoort.type == "ONGEBOUWD"){
                switch(x.tarief.klasse){
                    case "1":
                        this.k1 = x.oppervlak;
                        this.t1 = x.tarief.tarief * x.oppervlak / 10000;
                        break;
                    case "2":
                        this.k2 = x.oppervlak;
                        this.t2 = x.tarief.tarief * x.oppervlak / 10000;
                        break;
                    case "3": 
                        this.k3 = x.oppervlak;
                        this.t3 = x.tarief.tarief * x.oppervlak / 10000;
                        break;
                    case "4":
                        this.k4 = x.oppervlak;
                        this.t4 = x.tarief.tarief * x.oppervlak / 10000;
                        break;
                    case "5":
                        this.k5 = x.oppervlak;
                        this.t5 = x.tarief.tarief * x.oppervlak / 10000;
                        break;
                    default: console.error("klasse niet gekend voor ongebouwd: " + x.tarief.klasse)
                }
            } else if (x.tarief.tariefsoort.type == "GEBOUWD"){
                this.k_geb = x.tarief.klasse;
                this.t_geb = getBedragHTML(x.tarief.tarief);
            } else {
                console.error("ongekend tariefsoort-type: " + x.tarief.tariefsoort.type);
            }
        }
    }
}