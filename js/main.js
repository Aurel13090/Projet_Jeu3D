//Variables Three.js
var paysage;
var cam , createur;
var bac;

//Variables pour écran
var hauteur;
var largeur;

//Initialisation écran, souris et three.js
function creerPaysage () {
    hauteur = window.innerHeight;
    largeur = window.innerWidth;

    paysage = new THREE.Scene ();
    paysage.fog = new THREE.Fog ( 0xF7D9BA , 100 , 950 );

    cam = new THREE.PerspectiveCamera ( 70 , largeur / hauteur , 1 , 20000 );
    cam.position.x = 0;
    cam.position.z = 250;
    cam.position.y = 101;

    createur = new THREE.WebGLRenderer ( { alpha : true , antialias : true } );
    createur.setSize ( largeur , hauteur );
    createur.shadowMap.enabled = true;

    bac = document.getElementById ( 'monde' );
    bac.appendChild ( createur.domElement );

    window.addEventListener ( 'resize' , RedimensionnerFenetre , false );
}

// Si Redimmensionnement de la fenetre
function RedimensionnerFenetre () {
    hauteur = window.innerHeight;
    largeur = window.innerWidth;

    createur.setSize ( largeur , hauteur );

    cam.aspect = largeur / hauteur;
    cam.updateProjectionMatrix ();
}


// Lumière
var generalLum , espaceLum , ombreLum;

function creeLumiere () {

    espaceLum = new THREE.HemisphereLight ( 0xBAAABA , 0x100001 , .91 );
    generalLum = new THREE.AmbientLight ( 0xDC8874 , .51 );

    ombreLum = new THREE.DirectionalLight ( 0xFFFFFF , .91 );
    ombreLum.position.set ( 149 , 349 , 349 );
    ombreLum.castShadow = true;
    ombreLum.shadow.camera.left = - 399;
    ombreLum.shadow.camera.right = 399;
    ombreLum.shadow.camera.top = 399;
    ombreLum.shadow.camera.bottom = - 399;
    ombreLum.shadow.camera.near = 1;
    ombreLum.shadow.camera.far = 999;
    ombreLum.shadow.mapSize.largeur = 2047;
    ombreLum.shadow.mapSize.hauteur = 2047;
    paysage.add ( espaceLum );
    paysage.add ( ombreLum );
    paysage.add ( generalLum );
}

// Création de notre Astronaute
var Astronaute = function () {
    this.mesh = new THREE.Object3D ();
    this.cheveuxAngle = 0;


    var corps = new THREE.Mesh ( new THREE.BoxGeometry ( 16 , 16 , 16 ) , new THREE.MeshPhongMaterial ( {
        color : 0x59332E ,
        shading : THREE.FlatShading
    } ) );

    corps.position.set ( 19 , 3 , 0 );
    this.mesh.add ( corps );

    var geomTete = new THREE.BoxGeometry ( 9 , 9 , 9 );
    var matériauxTete = new THREE.MeshLambertMaterial ( { color : 0xF5987E } );
    var tete = new THREE.Mesh ( geomTete , matériauxTete );
	tete.position.set ( 20 , 15 , 0 );
    this.mesh.add ( tete );

    var geomCheveu = new THREE.BoxGeometry ( 5 , 5 , 5 );
    var materiauxCheveu = new THREE.MeshLambertMaterial ( { color : 0x59333E } );
    var cheveu = new THREE.Mesh ( geomCheveu , materiauxCheveu );
    cheveu.geometry.applyMatrix ( new THREE.Matrix4 ().makeTranslation ( 0 , 3 , 0 ) );
    var cheveux = new THREE.Object3D ();
    this.cheveuxHaut = new THREE.Object3D ();

    for ( var y = 0 ; y < 11 ; y ++ ) {
        var clone = cheveu.clone ();
        var colonne = y % 3;
        var ligne = Math.floor ( y / 3 );
        var positionZ = - 3;
        var positionX = - 3;
        clone.position.set ( positionX + ligne * 4 , 0 , positionZ + colonne * 4 );
        this.cheveuxHaut.add ( clone );
    }
    cheveux.add ( this.cheveuxHaut );

    var geomCheveuxCote = new THREE.BoxGeometry ( 12 , 4 , 2 );
    geomCheveuxCote.applyMatrix ( new THREE.Matrix4 ().makeTranslation ( - 6 , 0 , 0 ) );
    var cheveuxCoteDroit = new THREE.Mesh ( geomCheveuxCote , materiauxCheveu );
    var cheveuxCoteGauche = cheveuxCoteDroit.clone ();

    cheveuxCoteDroit.position.set ( 7 , - 2 , 6 );
    cheveuxCoteGauche.position.set ( 7 , - 2 , - 6 );

    cheveux.add ( cheveuxCoteDroit );
    cheveux.add ( cheveuxCoteGauche );

    var geomCheveuxDos = new THREE.BoxGeometry ( 2 , 8 , 9 );
    var cheveuDos = new THREE.Mesh ( geomCheveuxDos , materiauxCheveu );
    cheveuDos.position.set ( - 1 , - 4 , 0 )
    cheveux.add ( cheveuDos );
    cheveux.position.set ( 15 , 20 , 0 );

    this.mesh.add ( cheveux );

    var geomLunette = new THREE.BoxGeometry ( 4 , 4 , 4 );
    var materiauxLunette = new THREE.MeshLambertMaterial ( { color : 0x59332E } );
    var lunetteDroite = new THREE.Mesh ( geomLunette , materiauxLunette );
    lunetteDroite.position.set ( 25 , 15 , 3 );
    var lunetteGauche = lunetteDroite.clone ();
    lunetteGauche.position.z = - lunetteDroite.position.z

    var geomLunetteAvant = new THREE.BoxGeometry ( 11 , 1 , 11 );
    var lunetteAvant = new THREE.Mesh ( geomLunetteAvant , materiauxLunette );
    this.mesh.add ( lunetteDroite );
    this.mesh.add ( lunetteGauche );
    this.mesh.add ( lunetteAvant );

    var geomOreille = new THREE.BoxGeometry ( 2 , 2 , 2 );
    var oreilleGauche = new THREE.Mesh ( geomOreille , matériauxTete );
    oreilleGauche.position.set ( 20 , 0 , - 6 );
    var oreilleDroite = oreilleGauche.clone ();
    oreilleDroite.position.set ( 20 , 15 , 6 );
    this.mesh.add ( oreilleGauche );
    this.mesh.add ( oreilleDroite );
}

Astronaute.prototype.updateHairs = function () {
    var cheveux = this.cheveuxHaut.children;

    for ( var y = 0 ; y < cheveux.length ; y ++ ) {
        var chev = cheveux[ y ];
        chev.scale.y = .74 + Math.cos ( this.cheveuxAngle + y / 3 ) * .24;
    }
    this.cheveuxAngle += 0.16;
}


// Creation de notre Fusée
var FuseeEspace = function () {
    this.mesh = new THREE.Object3D ();


    var cabineGeom = new THREE.BoxGeometry ( 180 , 60 , 55 , 1 , 1 , 1 );
    var cabineMateriaux = new THREE.MeshPhongMaterial ( { color : 0xC0C0C0 , shading : THREE.FlatShading } );

    var cabine = new THREE.Mesh ( cabineGeom , cabineMateriaux );
    cabine.castShadow = true;
    cabine.receiveShadow = true;
    this.mesh.add ( cabine );

    // Tête Fusée

    var enginGeom = new THREE.BoxGeometry ( 60 , 40 , 40 , 1 , 1 , 1 );
    var enginMateriaux = new THREE.MeshPhongMaterial ( { color : 0xF25346 , shading : THREE.FlatShading } );
	
	enginGeom.vertices[ 4 ].y += 10;
    enginGeom.vertices[ 4 ].z -= 10;
    enginGeom.vertices[ 5 ].y += 10;
    enginGeom.vertices[ 5 ].z += 10;
    enginGeom.vertices[ 6 ].y -= 10;
    enginGeom.vertices[ 6 ].z -= 10;
    enginGeom.vertices[ 7 ].y -= 10;
    enginGeom.vertices[ 7 ].z += 10;
	
    var engin = new THREE.Mesh ( enginGeom , enginMateriaux );
    engin.position.x = 120;
    engin.castShadow = true;
    engin.receiveShadow = true;
    this.mesh.add ( engin );

    // Queue Fusée

    var fuseeQueueGeom = new THREE.BoxGeometry ( 15 , 20 , 5 , 1 , 1 , 1 );
    var fuseeQueueMateriaux = new THREE.MeshPhongMaterial ( { color : 0x49494A , shading : THREE.FlatShading } );
    var fuseeQueue = new THREE.Mesh ( fuseeQueueGeom , fuseeQueueMateriaux );
    fuseeQueue.position.set ( - 100 , 0 , 0 );
    fuseeQueue.castShadow = true;
    fuseeQueue.receiveShadow = true;
    this.mesh.add ( fuseeQueue );

	// Création Coupe-Vent
    var coupeVentGeom = new THREE.BoxGeometry ( 40 , 35 , 20 , 1 , 1 , 1 );
    var coupeVentMateriaux = new THREE.MeshPhongMaterial ( {
        color : 0xD8D0D1 ,
        transparent : true ,
        opacity : .2 ,
        shading : THREE.FlatShading
    } );
    ;
	
	
    var coupeVent = new THREE.Mesh ( coupeVentGeom , coupeVentMateriaux );
    coupeVent.position.set ( 10 , 37 , 0 );

    coupeVent.castShadow = true;
    coupeVent.receiveShadow = true;

    this.mesh.add ( coupeVent );

    this.astronaute = new Astronaute ();
    this.astronaute.mesh.position.set ( - 10 , 27 , 0 );
    this.mesh.add ( this.astronaute.mesh );

    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;

};

// Conception Espace
Espace = function () {
    this.mesh = new THREE.Object3D ();
    this.nbNuage = 21;
    this.nuages = [];
    var Angles = Math.PI * 2 / this.nbNuage;
    for ( var i = 0 ; i < this.nbNuage ; i ++ ) {
        var nuage = new Nuage ();
        this.nuages.push ( nuage );
        var angle = Angles * i;
        var hauteur = 620 + Math.random () * 199;
        nuage.mesh.position.y = Math.sin ( angle ) * hauteur;
        nuage.mesh.position.x = Math.cos ( angle ) * hauteur;
        nuage.mesh.position.z = - 399 - Math.random () * 399;
        nuage.mesh.rotation.z = angle + Math.PI / 2;
        var n = 1 + Math.random () * 2;
        nuage.mesh.scale.set ( n , n , n );
        this.mesh.add ( nuage.mesh );
    }
}


//Conception Terre
Terre = function () {
    var cercle = new THREE.CylinderGeometry ( 580 , 580 , 780 , 39 , 9 );
    cercle.applyMatrix ( new THREE.Matrix4 ().makeRotationX ( - Math.PI / 2 ) );
    cercle.mergeVertices ();
    var longueur = cercle.vertices.length;

    this.montagne = [];

    for ( var y = 0 ; y < longueur ; y ++ ) {
        var mont = cercle.vertices[ y ];
        this.montagne.push ( {
            y : mont.y ,
            x : mont.x ,
            z : mont.z ,
            angle : Math.random () * Math.PI * 2 ,
            nombre : 5 + Math.random () * 15 ,
            vitesse : 0.015 + Math.random () * 0.031
        } );
    }
    ;
    var materiaux = new THREE.MeshPhongMaterial ( {
        color : 0x2E9F29 ,
        transparent : true ,
        opacity : .8 ,
        shading : THREE.FlatShading ,

    } );

    this.mesh = new THREE.Mesh ( cercle , materiaux );
    this.mesh.receiveShadow = true;

}

Terre.prototype.montagneDynamique = function () {
    var sommets = this.mesh.geometry.vertices;
    var longueur = sommets.length;
    for ( var y = 0 ; y < longueur ; y ++ ) {
        var vect = sommets[ y ];
        var vectProp = this.montagne[ y ];
        vect.x = vectProp.x + Math.cos ( vectProp.angle ) * vectProp.nombre;
        vect.y = vectProp.y + Math.sin ( vectProp.angle ) * vectProp.nombre;
        vectProp.angle += vectProp.vitesse;
    }
    this.mesh.geometry.verticesNeedUpdate = true;
    terre.mesh.rotation.z += .006;
}

// Conception Nuage
Nuage = function () {
    this.mesh = new THREE.Object3D ();
    var cube = new THREE.CubeGeometry ( 21 , 21 , 21 );
    var materiaux = new THREE.MeshPhongMaterial ( {
        color : 0xD8D0D1 ,
    } );

    var nombre = 3 + Math.floor ( Math.random () * 4 );
    for ( var y = 0 ; y < nombre ; y ++ ) {
        var mat = new THREE.Mesh ( cube.clone () , materiaux );
        mat.position.x = y * 15;
        mat.position.y = Math.random () * 9;
        mat.position.z = Math.random () * 9;
        mat.rotation.z = Math.random () * Math.PI * 3;
        mat.rotation.y = Math.random () * Math.PI * 2;
        var alea = .1 + Math.random () * .9;
        mat.scale.set ( alea , alea , alea );
        mat.castShadow = true;
        mat.receiveShadow = true;
        this.mesh.add ( mat );
    }
}

// 3D Model
var terre;
var fuseeEspace;

function creeFusee () {
    fuseeEspace = new FuseeEspace ();
    fuseeEspace.mesh.scale.set ( .24 , .24 , .24 );
    fuseeEspace.mesh.position.y = 101;
    paysage.add ( fuseeEspace.mesh );
}

function creeTerre () {
    terre = new Terre ();
    terre.mesh.position.y = - 599;
    paysage.add ( terre.mesh );
}

function creeEspace () {
    espace = new Espace ();
    espace.mesh.position.y = - 599;
    paysage.add ( espace.mesh );
}

function boucle () {
    majFusee ();
    fuseeEspace.astronaute.updateHairs ();
    majCamera ();
    terre.montagneDynamique ();
    espace.mesh.rotation.z += .009;
    createur.render ( paysage , cam );
    requestAnimationFrame ( boucle );
}

function majFusee () {
    var cibleY = normalise ( positionSouris.y , - .74 , .74 , 24 , 174 );
    fuseeEspace.mesh.position.y += ( cibleY - fuseeEspace.mesh.position.y ) * 0.11;
    fuseeEspace.mesh.rotation.z = ( cibleY - fuseeEspace.mesh.position.y ) * 0.0127;
    fuseeEspace.mesh.rotation.x = ( fuseeEspace.mesh.position.y - cibleY ) * 0.0063;
}

function majCamera () {
    cam.fov = normalise ( positionSouris.x , - 1 , 1 , 39 , 79 );
    cam.updateProjectionMatrix ();
}

function normalise ( vit , vitMin , vitMax , taMin , taMax ) {
    var av = Math.max ( Math.min ( vit , vitMax ) , vitMin );
    var bv = vitMax - vitMin;
    var cv = ( av - vitMin ) / bv;
    var dt = taMax - taMin;
    var et = taMin + ( cv * dt );
    return et;
}

function initialisation ( evenement ) {
    document.addEventListener ( 'mousemove' , deplacementSouris , false );
    creerPaysage ();
    creeLumiere ();
    creeFusee ();
    creeTerre ();
    creeEspace ();
    boucle ();
}

// Deplacement de la souris

var positionSouris = { x : 0 , y : 0 };

function deplacementSouris ( evenement ) {
    var ax = - 1 + ( evenement.clientX / largeur ) * 2;
    var ay = 1 - ( evenement.clientY / hauteur ) * 2;
    positionSouris = { x : ax , y : ay };
}

window.addEventListener ( 'load' , initialisation , false );