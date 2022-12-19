const q = window.location.search;
if(q.length>1){
    fetch('https://oat.hisgis.nl/oat-ws/rest/percelen/oat/' + q.substring(1))
        .then((response) => response.json())
        .then((data) => verwerkScan(data));
}

function verwerkScan(s){
    document.getElementById('scans').innerHTML += '<a class="btn btn-primary" target="_blank" href="https://oat.hisgis.nl/oat/faces/oatscans/image.xhtml?oatcode=' + window.location.search.substring(1) + '" role="button">Ga naar scan ' + window.location.search.substring(1) + '</a>';
    document.getElementById('gemeente').innerHTML += s.gemeente.code + ' - ' + s.gemeente.naam;
    document.getElementById('sectie').innerHTML += window.location.search.substring(1).charAt(8);
    document.getElementById('blad').innerHTML += parseInt(window.location.search.substring(1).substring(9));
    // console.log(s);
    var t = document.getElementById('tbl_percelen_body');
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
        pnr.setAttribute("class","pe-1 text-end border-end-0");
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
        soort.setAttribute("class","text-end border-end-0");
        soort.setAttribute("style","line-height:115%;");
        soort.innerHTML = p.grondGebruik;
        pi.appendChild(soort);

        // huisnrs
        let huisnrs = document.createElement("td");
        huisnrs.setAttribute("class","border-start-0 text-center");
        var hnr = ""
        for(hi of p.huisnrs){
            hnr += (hnr.length > 0 ? ', ' : '');
            hnr += '<span class="huisnr badge p-1 m-1">' + hi.wijk + (hi.wijk.length > 0 ? '-' : '');
            hnr += hi.nr + (hi.nrtvg.length > 0 ? '/' + hi.nrtvg : '') + '</span>';
        }
        huisnrs.innerHTML = hnr;
        pi.appendChild(huisnrs);

        // oppervlakte
        for(let oi of getOppervlakHTML(p.oppervlak)){pi.appendChild(oi);}
        let samengeteld_oppervlak = document.createElement("td");
        samengeteld_oppervlak.setAttribute("colspan",3);
        pi.appendChild(samengeteld_oppervlak);

        var pts = new PerceelTarieven(p.perceelTarieven);
        // voorlopige klassering
        let voorlopige_klassering = document.createElement("td");
        voorlopige_klassering.setAttribute("class","text-center");
        var voorl = ''
        if(pts.k1 > 0){voorl += '<span class="ongebouwde_klasse badge p-1 m-1">1</span>'}
        if(pts.k2 > 0){voorl += '<span class="ongebouwde_klasse badge p-1 m-1">2</span>'}
        if(pts.k3 > 0){voorl += '<span class="ongebouwde_klasse badge p-1 m-1">3</span>'}
        if(pts.k4 > 0){voorl += '<span class="ongebouwde_klasse badge p-1 m-1">4</span>'}
        if(pts.k5 > 0){voorl += '<span class="ongebouwde_klasse badge p-1 m-1">5</span>'}
        voorlopige_klassering.innerHTML = voorl;
        pi.appendChild(voorlopige_klassering);

        for(let i of getOppervlakHTML(pts.k1)){pi.appendChild(i);}
        for(let i of getOppervlakHTML(pts.k2)){pi.appendChild(i);}
        for(let i of getOppervlakHTML(pts.k3)){pi.appendChild(i);}
        for(let i of getOppervlakHTML(pts.k4)){pi.appendChild(i);}
        for(let i of getOppervlakHTML(pts.k5)){pi.appendChild(i);}
        let k_geb = document.createElement("td");
        k_geb.setAttribute("class","text-center");
        k_geb.innerHTML = pts.k_geb ? '<span class="gebouwde_klasse badge p-1 m-1">' + pts.k_geb + '</span>' : '';
        pi.appendChild(k_geb);
        for(let i of getBedragHTML(pts.t1)){pi.appendChild(i);}
        for(let i of getBedragHTML(pts.t2)){pi.appendChild(i);}
        for(let i of getBedragHTML(pts.t3)){pi.appendChild(i);}
        for(let i of getBedragHTML(pts.t4)){pi.appendChild(i);}
        for(let i of getBedragHTML(pts.t5)){pi.appendChild(i);}

        for(let i of getBedragHTML(p.belastbaar_inkomen + (p.aftrek || 0))){pi.appendChild(i);}
        let bel_ink_samen = document.createElement("td");
        bel_ink_samen.setAttribute("colspan",2);
        pi.appendChild(bel_ink_samen);
        
        for(let i of getBedragHTML(p.aftrek || 0)){pi.appendChild(i);}

        for(let i of getBedragHTML(p.belastbaar_inkomen         || 0)){pi.appendChild(i);}
        for(let i of getBedragHTML(p.belastbaar_inkomen_gebouwd || 0)){pi.appendChild(i);}

        t.appendChild(pi);
    }
}


function getOppervlakHTML(opp){
    var h = [];
    if(opp > 0){
        let e = opp % 100;
        let r = ((opp-e) % 10000)/100;
        let b = (opp-e-(100*r)) /10000;
        let e_h = document.createElement("td");
        e_h.setAttribute("class","ke mono");
        e_h.innerHTML = (e == 0 && r == 0 && b == 0 ? "" : String(e).padStart(2,'0'));
        let r_h = document.createElement("td");
        r_h.setAttribute("class","kr mono");
        r_h.innerHTML = (r == 0 && b == 0 ? "" : ( b == 0 ? r : String(r).padStart(2,'0')));
        let b_h = document.createElement("td");
        b_h.setAttribute("class","kb mono");
        b_h.innerHTML = (b == 0 ? "" : b);
        h.push(b_h);
        h.push(r_h);
        h.push(e_h);
    } else {
        let x = document.createElement("td");
        x.setAttribute("colspan","3");
        x.setAttribute("class","border")
        h.push(x);
    }
    return h
}

function getBedragHTML(bedrag){
    var h = [];
    if(bedrag > 0){
        let b = Math.round(bedrag);
        let c = b % 100;
        let g = (b-c)/100;
        let c_h = document.createElement("td");
        c_h.setAttribute("class","kc mono");
        c_h.innerHTML = (c == 0 ? '' : String(c).padStart(2,'0'));
        let g_h = document.createElement("td");
        g_h.setAttribute("class","kf mono");
        g_h.innerHTML = (g == 0 ? '' : g);
        h.push(g_h);
        h.push(c_h);
    } else {
        let x = document.createElement("td");
        x.setAttribute("class","border")
        x.setAttribute("colspan","2");
        h.push(x);
    }
    return h
}

function getArtikelHTML(a, aantal){
    var h = [];

    var anr = a.artikelnr;
    if(a.artikelnrtvg){anr += "/" + a.artikelnrtvg;}
    anr = '<span class="badge artikelnr py-1 px-2 me-1">' + anr + '</span>';

    if(a.rechtsPersonen && a.rechtsPersonen.length == 1){
        if(a.rechtsPersonen[0].type == "PERSOON"){
            let p = new Persoon(a.rechtsPersonen[0].persoon);

            let persoon_h = document.createElement("td");
            persoon_h.setAttribute("rowspan", aantal);
            persoon_h.setAttribute("colspan", 5);
            if(aantal > 1){
                persoon_h.setAttribute("class","container border-start-0 border-end");
                let accolade = document.createElement("div");
                accolade.setAttribute("class", "accolade");
                let inhoud = document.createElement("div");
                inhoud.setAttribute("class", "content my-auto");

                inhoud.innerHTML = anr + p.lbl();
                accolade.appendChild(inhoud);
                persoon_h.appendChild(accolade);
            } else {
                persoon_h.setAttribute("class","border-start-0 border-end plinks");
                persoon_h.innerHTML = anr + p.lbl();
            }
            h.push(persoon_h);

            // // voornaam
            // let vnaam_h = document.createElement("td");
            // vnaam_h.setAttribute("rowspan", aantal);
            // vnaam_h.setAttribute("class", "border-start border-end");
            // if(p.titel){vnaam_h.innerHTML += p.titel + " ";}
            // vnaam_h.innerHTML += p.voornaam;
            // if(p.voorvoegsel){vnaam_h.innerHTML += ", " + p.voorvoegsel;}
            // h.push(vnaam_h);

            // // beroep
            // let beroep_h = document.createElement("td");
            // beroep_h.setAttribute("rowspan", aantal);
            // beroep_h.setAttribute("class", "border-start border-end");
            // beroep_h.innerHTML = p.beroep;
            // h.push(beroep_h);

            // // woonplaats
            // let woonplaats_h = document.createElement("td");
            // woonplaats_h.setAttribute("rowspan", aantal);
            // woonplaats_h.setAttribute("class", "border-start border-end");
            // woonplaats_h.innerHTML = p.woonplaats;
            // h.push(woonplaats_h);
        } else if (a.rechtsPersonen[0].type == "VERWIJZING") {
            // geen PERSOON
            let x = document.createElement("td");
            x.setAttribute("rowspan", aantal);
            x.setAttribute("colspan",5);
            let pv = new Verwijzing(a.rechtsPersonen[0].persoonsVerwijzing);
            if(aantal > 1){
                x.setAttribute("class","container border-end");
                let accolade = document.createElement("div");
                accolade.setAttribute("class", "accolade");
                let inhoud = document.createElement("div");
                inhoud.setAttribute("class", "content my-auto");

                inhoud.innerHTML = anr + pv.lbl();
                accolade.appendChild(inhoud);
                x.appendChild(accolade);
            } else {
                x.setAttribute("class","border-end plinks");
                x.innerHTML = anr + pv.lbl();
            }
            h.push(x);
        } else if (a.rechtsPersonen[0].type == "INSTANTIE"){
            let x = document.createElement("td");
            x.setAttribute("rowspan", aantal);
            x.setAttribute("colspan",5);
            let instantie = new Instantie(a.rechtsPersonen[0].instantie);
            if(aantal > 1){
                x.setAttribute("class","container border-end");
                let accolade = document.createElement("div");
                accolade.setAttribute("class", "accolade");
                let inhoud = document.createElement("div");
                inhoud.setAttribute("class", "content my-auto");

                inhoud.innerHTML = anr + instantie.lbl();
                accolade.appendChild(inhoud);
                x.appendChild(accolade);
            } else {
                x.setAttribute("class","border-end plinks");
                x.innerHTML = anr + instantie.lbl();
            }
            h.push(x);
        } else {
            console.error("onherkend type: " + a.rechtsPersonen[0].type);
        }
    } else if (a.rechtsPersonen && a.rechtsPersonen.length > 1){
        // meer dan 1 RP
        let x = document.createElement("td");
        x.setAttribute("rowspan", aantal);
        x.setAttribute("colspan",5);
        h.push(x);
    } else {
        let x = document.createElement("td");
        x.setAttribute("rowspan", aantal);
        x.setAttribute("colspan",5);
        x.innerHTML = "[Artikel" + anr + ": geen rechtspersonen]";
        h.push(x);
    }


    // // artikelnummer
    // let anr_html = document.createElement("td");
    // anr_html.setAttribute("rowspan", aantal);



    // anr_html.innerHTML = anr;
    // anr_html.setAttribute("class","pe-1 text-end");
    // h.push(anr_html);
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

class Verwijzing extends RPI {
    inRelatieTot;
    persoon;
    verwijzing;

    constructor(json){
        super();
        this.inRelatieTot = (json.hasOwnProperty("inRelatieTot") ? new Persoon(json.inRelatieTot) : null);
        this.persoon = (json.hasOwnProperty("persoon") ? new Persoon(json.persoon) : null);
        this.verwijzing = (json.verwijzing in d_verw ? d_verw[json.verwijzing] : json_verwijzing);
    }

    lbl(){
        let l = "";
        l += this.inRelatieTot ? this.inRelatieTot.lbl() : '';
        // l.length > 0 ? ' ' : '';
        l += "<span class='verwijzing badge rounded-pill mx-2 p-1'>" + this.verwijzing + "</span>";
        l += this.persoon ? this.persoon.lbl() : '';
        return l
    }
}


d_jrSr = [];
d_jrSr['JR'] = 'Junior';
d_jrSr['SR'] = 'Senior';

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
        this.jrSr = json.jrSr || '';
        this.beroep = json.beroep || '';
        this.woonplaats = json.woonplaats || '';
        this.varianten = [];
    }

    lbl(){
        let l = this.titel || '';
        l += ((this.voornaam.length > 0 && l.length > 0) ? ' ' : '' ) + this.voornaam;
        l += ((this.voorvoegsel.length > 0 && l.length > 0) ? ' ' : '' ) + this.voorvoegsel;
        l += ((this.achternaam.length > 0 && l.length > 0) ? ' ' : '' ) + this.achternaam;
        l += (this.jrSr.length > 0 ? '<span class="badge jrSr p-1 mx-1">' + d_jrSr[this.jrSr] + '</span>' : '');
        if(this.beroep.length > 0 && this.woonplaats.length > 0){l += ' (<span class="badge beroep p-1">' + this.beroep + '</span> te <span class="badge plaats p-1">' + this.woonplaats + '</span>)';}
        else if (this.beroep.length > 0){l += ' (<span class="badge beroep p-1">' + this.beroep + '</span>)';}
        else if (this.woonplaats.length > 0){l += ' (<span class="badge plaats p-1">' + this.woonplaats + '</span>)';}
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
        l += '<span class="badge plaats p-1">' + this.plaats + '</span>' || '';
        return l
    }
}

d_verw = [];
d_verw['WEDUWE_VAN'] = 'weduwe van';
d_verw['ERVEN_VAN'] = 'erven van';
d_verw['ECHTGENOOT_VAN'] = 'echtgeno(o)t(e) van';
d_verw['GESCHEIDEN_VAN'] = 'gescheiden van';
d_verw['HUISVROUW_VAN'] = 'huisvrouw van';
d_verw['VOOGD_VAN'] = 'voogd van';
d_verw['IN_HUWELIJK_HEBBENDE'] = 'in huwelijk hebbende';
d_verw['KINDEREN_VAN'] = 'kinderen van';
d_verw['ERVEN_VAN_WEDUWE'] = 'erven en weduwe van';
d_verw['BOEDEL_VAN'] = 'boedel van';

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
        //console.log(json);
        for(let x of json){
            //console.log(x);
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
